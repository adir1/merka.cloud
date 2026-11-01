# Merka.cloud Security Architecture

- **Status:** Initial design; implementation details and open questions are tracked below.
- **Scope:** Cloud registration from mobile or desktop, one Tailnet per cloud, cloud-local member profiles, local device participation, and future cloud-to-cloud trust. Desktop-first setup and multi-user OS profiles are not yet designed; see [Desktop-first setup](desktop-first-setup.md).

This document supersedes the earlier speculative security model preserved in [`../archive/legacy-security.md`](../archive/legacy-security.md). The portal is a public cryptographic discovery directory, not an account provider: cloud creation and administration must not require signing in to merka.cloud. Tailnet is a network identity and connectivity layer, while each Merka cloud defines its own member profiles, enrollment, and data authorization.

## 1. Security principles

- **Separate identities and authority.** A cloud-local member profile, Tailnet identity, Merka cloud, and node are related but are not interchangeable. There is no global Merka person account.
- **The cloud owns its identity.** A cloud's cryptographic identity is anchored by its signing key, not a human-readable name, Tailnet name, or IP address.
- **The portal publishes; peers verify.** The portal publishes and resolves minimal signed cloud-discovery records. Devices establish authenticated, encrypted communication directly and enforce cloud authorization locally.
- **Profiles belong to clouds.** Each cloud manages its own member profiles and policy. The portal does not create, authenticate, or synchronize people.
- **Network membership is not data permission.** Tailnet connectivity makes communication possible and helps identify network participants; cloud policy decides which services and data they can use.
- **Enroll devices explicitly.** A Tailnet-connected device is not automatically an enrolled Merka node. Every node has its own identity and cloud-specific authorization.
- **Use small, understandable policy.** Start with Owner and Participant member profiles, then narrowly scoped grants to member, node, or agent principals. Avoid a deeply nested role hierarchy.

## 2. Identity model

| Identity | Represents | Authority |
| --- | --- | --- |
| Cloud-local member profile | A person/principal recognized by one Merka cloud | Cloud-scoped membership, identity key, and policy grants; not a global portal account |
| Tailnet identity | A user or device recognized by the associated Tailnet | Network identity and reachability; not automatically cloud ownership |
| Merka cloud identity | One cloud and its cryptographic authority | Stable cloud identifier and cloud signing-key history |
| Node identity | One enrolled phone, computer, or other participating device | Device authentication and the capabilities granted to that node |
| Agent identity | A process acting on a node | Only the authority delegated to it by the node or an authorized user |

Identifiers must be scoped and stable. Do not use email addresses, display names, Tailnet IP addresses, or local aliases as authorization principals. A cloud-local member identity must not be confused with an OS account or node identity.

### 2.1. Cloud-local member profiles

Each cloud creates and manages its own member profiles. A member profile is scoped to that cloud and may have a public-key identity, profile metadata, and cloud-specific grants; it is not a global Merka account. Admission should use an invitation or approval signed by the cloud's authorized key and accepted by the new member's key. Email, portal login, and Tailnet membership are not prerequisites.

Profile records and authorization state are maintained by participating cloud devices and synchronized directly according to cloud policy. Keep private profile data and member secrets only on the member's authorized devices; publish only the public keys and minimum policy metadata peers need to authenticate and authorize actions. Do not treat ordinary CRDT convergence or last-write-wins merging as sufficient authorization: grants, ownership changes, and revocations need signed policy versions and defined behavior for stale or offline peers. The format, key lifecycle, local unlock method, and which profile fields are replicated remain open decisions.

### 2.2. Cloud identity and private discovery identifier

Any authorized client, including mobile or desktop, can create a cloud by generating its cryptographic identity and a stable cloud identifier locally. The identifier is the RFC 7638 SHA-256 thumbprint of the cloud's public signing JWK. Publishing the cloud requires proof of possession of the corresponding private key, not a portal login.

The directory publishes no cloud name, shortname, or subdomain and provides no list or name-search endpoint. Discovery requires the exact cloud identifier, communicated through a trusted offline or separate channel such as an invitation or QR code. A client verifies that the public key in the signed record hashes to the requested identifier; the directory cannot substitute a different key without breaking that binding. A human-readable label may be used locally or in an invitation, but is not published as a directory key.

The cloud identifier is a pseudonymous public locator, not a secret or an authorization credential. Anyone who receives it can look up the public record; peer authentication and data access still require cryptographic identity and cloud policy. Cloud identifiers are never recycled.

### 2.3. Tailnet identity and association

For v1, a Merka cloud is associated with exactly one Tailnet. The association is authorized with the cloud identity key, regardless of which client performs setup. The portal should not retain a Tailnet user identity or credential. Whether discovery requires publishing a Tailnet reference or time-limited connectivity hints is undecided; publish no network metadata unless necessary and explicitly defined.

The Tailnet association is distinct from cloud membership and node enrollment. Tailnet identifiers may establish network reachability or help verify a node, but cloud authorization uses cloud-local member profiles and explicit node/agent grants. The exact trusted mechanism for obtaining and validating network-level device identifiers must be specified before implementation.

Moving a cloud to a different Tailnet is not a routine settings change. Re-association is intentionally deferred until its consequences for member identities, device grants, ongoing sessions, peer discovery, and cloud-to-cloud trust have been designed. V1 must not silently treat an Owner's newly selected Tailnet as equivalent to the original one.

## 3. Initial registration and key custody

The initial registrant creates the cloud from a mobile or desktop client and becomes its first **Owner**. The private key is generated and held by that client, never sent to the portal. The exact relationship between the cloud authority key and the Owner's member-profile key remains to be designed.

An eventual public directory record should bind at least:

- the stable cloud identifier;
- the current public signing key and key version;
- a cloud-signed publication proof;
- the record version and any expiry/renewal information needed by the directory.

The initial portal scaffold uses a compact JWS with EdDSA/Ed25519, an embedded public JWK, and the RFC 7638 SHA-256 JWK thumbprint as the cloud identifier. Its signed payload contains only the record type and cloud identifier. This is a prototype format, not a finalized protocol; key rotation and signed update/removal records are not implemented.

The portal does not authenticate a person or decide who owns a cloud. Devices and other clouds verify the cloud-signed record and confirm that the embedded public key hashes to the identifier they received out of band. Final key-versioning and signed update/removal rules remain to be selected. Prefer established cryptographic formats and libraries over custom signature protocols.

### 3.1. Recovery, export, and rotation

Users should be advised to back up their cloud authority and provided a deliberate way to export it for offline, separate safekeeping. An exported key is highly sensitive private material and must be encrypted before it leaves the app; it must never be sent to the portal or ordinary cloud storage as a plaintext file.

A device backup is not a guaranteed recovery mechanism: platform backup behavior may omit app secrets or hardware-bound keys. Each client must explain this limitation and verify restore behavior on supported platforms. The key-storage design must support the promised explicit export; a non-exportable hardware key cannot be the sole cloud authority unless a separate recovery-key design is added.

Key rotation must produce a verifiable transition from the old key to the replacement. Recovery after loss or compromise without access to the old key needs a separately designed process. Until that is defined, losing the original key and all valid backups may permanently prevent the Owner from administering the cloud.

## 4. Tailnet participants, nodes, and access

The platform aims to let any device supported by the associated Tailnet become an enrolled Merka node. Tailnet membership alone does not make a person a cloud member. Participation does not imply that every device can run every service: each node advertises only the capabilities it can safely provide.

An enrolled node has a device-specific key and a record binding it to the cloud and its verified Tailnet device identity. Enrollment must be approved by the Owner or by an explicitly authorized process. Revocation must prevent future authenticated access when peers next receive or verify cloud policy updates; behavior for offline peers and cached grants needs further design.

### 4.1. Minimal roles and policy

The initial role vocabulary is intentionally small:

- **Owner:** the first cloud-local member profile granted authority to manage cloud settings, Tailnet association, node enrollment, access rules, and cloud-to-cloud trust.
- **Participant:** a cloud-local member profile with the grants needed to use the cloud.

Do not introduce a general hierarchy of nested roles for v1. A cloud may define narrowly scoped allow or deny exceptions for individual member, node, or agent principals to control access to a service or file. Rules must identify the cloud, principal, resource or service, and allowed action; they must not rely on mutable display names. Node enrollment is separate from membership in a person profile.

The product direction favors broad, simple participation with targeted exceptions. Whether a new member requires explicit invitation, how a profile is authenticated across devices, and how conflicting allow/deny rules are resolved remain open policy decisions. Tailnet presence or administrator status alone never grants Merka membership or Owner authority.

## 5. Portal and direct peer trust

The portal is a non-enumerable public discovery directory, not an account provider, cloud control plane, or data plane. It does not host user profiles, member lists, cloud policy, private keys, data-encryption keys, files, or plaintext cloud content. It stores a signed record addressed only by its high-entropy cloud identifier; it provides no public listing, subdomain, or shortname lookup. Anyone who knows an identifier can still query its record, so the identifier is a pseudonymous locator rather than a secret or access token. Cloud creation and administration must work without portal login.

Cloud membership policy and service/file access decisions are enforced by participating devices, not inferred from a directory response. Cloud members and devices communicate directly after discovery; the portal does not relay cloud data or authorize a connection.

After discovery, devices communicate directly over the Tailnet and authenticate peers using verified cloud, member, and node identities. The portal returns a signed record only for the exact identifier requested; it does not silently establish trust, authorize a file transfer, or substitute its own assertion for peer verification. Payload relaying is outside this design.

A compromised or unavailable portal may disrupt discovery, censor publication, or provide stale metadata. Since the lookup identifier is derived from the signing key, clients can reject a substituted key without trusting a directory-provided key binding. Minimize lookup logging because queries reveal which identifiers are being discovered. Key rotation and mutable records will need signed transitions and a freshness/replay policy before they are implemented.

## 6. Cloud-to-cloud trust and family transitions

Federated trust is established deliberately between distinct Merka clouds. Each side must verify and accept the other cloud's cryptographic identity; a shared Tailnet or knowledge of the other's public identifier is not a trust grant. Trust grants should be scoped to the intended services, data, and actions rather than granting blanket access to another cloud.

When a child graduates from a family cloud, the initial path is to create a separate cloud with a new identity and identifier, then manually establish new federation trust between the resulting clouds. The new cloud does not inherit the family cloud's identity, Owner authority, node enrollment, or trust grants. Data sharing or migration and removal of the child's previous access are separate, explicit operations.

## 7. Lifecycle and audit requirements

The implementation must distinguish these events: cloud-key recovery, member-profile admission/removal, Tailnet membership change, node enrollment/revocation, cloud deletion, and signed directory-record removal. One event must not silently imply another.

Record security-relevant changes with the actor, affected cloud or node, action, scope, timestamp, and key or policy version. Define how records are synchronized across nodes and what happens when devices are offline. Never make successful portal delivery equivalent to successful authorization or revocation at every peer.

## 8. Open decisions before implementation

1. Review the portal prototype's JWS EdDSA/Ed25519 record format, define key versioning, and specify how clients verify out-of-band identifiers and future key transitions.
2. Define mobile and desktop key storage and encrypted export/restore behavior across supported platforms; determine whether device backups can restore the app-held key.
3. Design device-loss recovery, offline-export restoration, and compromised-key rotation when the original key is unavailable.
4. Specify how the cloud associates with a Tailnet and how network-level device identifiers are obtained and validated without treating them as Merka member identities.
5. Define re-association to another Tailnet, including migration or revocation of existing grants.
6. Define cloud-local member profiles, invitation/acceptance, Owner authority, profile-key lifecycle, default enrollment, allow/deny precedence, and how signed policy is distributed and enforced by offline peers.
7. Define cloud deletion, signed directory-record removal, tombstones, and identifier non-reuse.
8. Define directory abuse controls, retention, and lookup-log privacy while preserving exact-ID-only discovery.
9. Specify node enrollment/revocation and the authenticated direct peer protocol.
10. Define federation invitation, bilateral acceptance, trust scope, and how either cloud revokes a trust grant.
11. Define how desktop-first cloud creation and key custody interoperate with mobile and satisfy export, recovery, and rotation requirements.
12. Define how multiple OS accounts on one node map to cloud-local principals, how users without Tailnet identities are invited, and whether local services run per-user or as a machine-level broker.
13. Define private versus shared content spaces on multi-user nodes, including permissions for derived indexes, embeddings, summaries, and search results.

These are intentional design gaps, not permission to infer trust from Tailnet reachability or portal ownership.
