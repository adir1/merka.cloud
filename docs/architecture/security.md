# Merka.cloud Security Architecture

- **Status:** Initial design; implementation details and open questions are tracked below.
- **Scope:** Initial mobile-led cloud registration, one Tailnet per cloud, local device participation, and future cloud-to-cloud trust.

This document supersedes the earlier speculative security model preserved in [`../archive/legacy-security.md`](../archive/legacy-security.md). It treats Tailnet as the network identity and connectivity layer, while Merka.cloud defines cloud identity, enrollment, and data authorization.

## 1. Security principles

- **Separate identities and authority.** A website account, a Tailnet identity, a Merka cloud, and a device are related but are not interchangeable.
- **The cloud owns its identity.** A cloud's cryptographic identity is anchored by its signing key, not its subdomain, website account, Tailnet name, or IP address.
- **The portal coordinates; peers verify.** The Cloudflare portal provides registration and discovery metadata. Devices establish authenticated, encrypted communication directly and enforce cloud authorization locally.
- **Network membership is not data permission.** Tailnet connectivity makes communication possible and helps identify network participants; cloud policy decides which services and data they can use.
- **Enroll devices explicitly.** A Tailnet-connected device is not automatically an enrolled Merka node. Every node has its own identity and cloud-specific authorization.
- **Use small, understandable policy.** Start with an Owner and Participants, then narrowly scoped per-Tailnet-identity rules. Avoid a deeply nested role hierarchy.

## 2. Identity model

| Identity | Represents | Authority |
| --- | --- | --- |
| Merka website account | A person signed into the online portal | Portal management and registration workflow; not sufficient to control an existing cloud |
| Tailnet identity | A user or device recognized by the associated Tailnet | Network identity and reachability; not automatically cloud ownership |
| Merka cloud identity | One cloud and its cryptographic authority | Stable cloud identifier and cloud signing-key history |
| Node identity | One enrolled phone, computer, or other participating device | Device authentication and the capabilities granted to that node |
| Agent identity | A process acting on a node | Only the authority delegated to it by the node or an authorized user |

Identifiers must be provider-scoped and stable where the provider supplies such identifiers. Do not use email addresses, display names, Tailnet IP addresses, or subdomains as authorization principals.

### 2.1. Merka website account

The portal account supports a person-facing login and cloud registration workflow. Linking a portal account to a cloud must be explicit; matching email addresses is not proof of control. Recovering a portal account must not, by itself, recover or replace a cloud signing key.

### 2.2. Cloud identity and name

The mobile app creates the initial cloud signing key and a stable cloud identifier. The portal reserves a normalized short name, such as `family.merka.cloud`, and registers the association between that name, cloud identifier, and public key after receiving proof that the phone controls the private key.

The name is a locator, not the cloud identity:

- A cloud keeps its assigned name while it exists. Renaming or transferring an active cloud's name is not part of the initial design.
- Deletion starts a separate name-release process. A deleted cloud's name remains reserved during a quarantine period; the exact duration (provisionally one to two years) is not yet decided.
- Reusing a released name creates a new cloud identifier and key history. Cloud identifiers are never recycled.
- Cloud-to-cloud trust and cached peer records bind to cloud identity and verified keys, never to the name alone.

Name normalization, reserved names, deletion grace periods, and the authority to approve exceptional releases require a defined portal policy.

### 2.3. Tailnet identity and association

For v1, a Merka cloud is associated with exactly one Tailnet. The association is initiated from the original registering phone and authorized with the cloud identity key. The portal may retain only the Tailnet reference required for coordination; Tailnet credentials and private keys are never stored there.

The Tailnet association is distinct from membership and node enrollment. A cloud's policy uses verified, Tailnet-scoped user and device identifiers rather than email or IP address. The exact trusted mechanism for obtaining and verifying those identifiers must be specified before implementation.

Moving a cloud to a different Tailnet is not a routine settings change. Re-association is intentionally deferred until its consequences for member identities, device grants, ongoing sessions, peer discovery, and cloud-to-cloud trust have been designed. V1 must not silently treat an Owner's newly selected Tailnet as equivalent to the original one.

## 3. Initial registration and key custody

The initial registrant creates the cloud from the mobile app and becomes its first **Owner**. The private key is generated and held by the app on that phone. The portal receives the public key and signed registration data, never the private key.

The portal's registration record should bind at least:

- the stable cloud identifier;
- the normalized, reserved subdomain;
- the current public signing key and key version;
- the registration status and relevant lifecycle timestamps.

Devices and other clouds must verify signed cloud identity and key changes rather than trusting a name lookup alone. The format, signature algorithm, key-versioning rules, and how clients authenticate the portal's initial registration record remain to be selected. Prefer established cryptographic formats and libraries over custom signature protocols.

### 3.1. Recovery, export, and rotation

Users should be advised to back up their phone and provided a deliberate way to export the cloud key for offline, separate safekeeping. An exported key is highly sensitive private material and must be encrypted before it leaves the app; it must never be sent to the portal or ordinary cloud storage as a plaintext file.

A phone backup is not a guaranteed recovery mechanism: platform backup behavior may omit app secrets or hardware-bound keys. The app must explain this limitation and verify the actual restore behavior on supported platforms. The key-storage design must support the promised explicit export; a non-exportable hardware key cannot be the sole cloud authority unless a separate recovery-key design is added.

Key rotation must produce a verifiable transition from the old key to the replacement. Recovery after loss or compromise without access to the old key needs a separately designed process. Until that is defined, losing the original key and all valid backups may permanently prevent the Owner from administering the cloud.

## 4. Tailnet participants, nodes, and access

The platform aims to let any device supported by the associated Tailnet become a Merka participant. Participation does not imply that every device can run every service: each node advertises only the capabilities it can safely provide.

An enrolled node has a device-specific key and a record binding it to the cloud and its verified Tailnet device identity. Enrollment must be approved by the Owner or by an explicitly authorized process. Revocation must prevent future authenticated access when peers next receive or verify cloud policy updates; behavior for offline peers and cached grants needs further design.

### 4.1. Minimal roles and policy

The initial role vocabulary is intentionally small:

- **Owner:** the initial registrant; manages cloud settings, Tailnet association, enrollment, access rules, and cloud-to-cloud trust.
- **Participant:** an enrolled user or device that can use the cloud within the applicable policy.

Do not introduce a general hierarchy of nested roles for v1. A cloud may define narrowly scoped allow or deny exceptions for individual Tailnet identities to control access to a service or file. Rules must identify the cloud, principal, resource or service, and allowed action; they must not rely on mutable display names.

The product direction favors broad, simple participation with targeted exceptions. Whether every authenticated identity in the associated Tailnet is a Participant by default, how an identity becomes enrolled, and how conflicting allow/deny rules are resolved remain open policy decisions. Tailnet administrator status alone never grants Merka Owner authority.

## 5. Portal and direct peer trust

The Cloudflare portal is a coordination and discovery service, not the cloud's data plane or ultimate authorization authority. Its intended visibility is limited to the information needed to register and locate clouds and their participating devices, such as the cloud name, public identity material, Tailnet association reference, and time-limited discovery or presence data where required.

The portal must not receive cloud private keys, data encryption keys, private files, or plaintext cloud content. Cloud membership policy and service/file access decisions should be enforced by participating devices, not inferred from a portal login or directory response.

After discovery, devices communicate directly over the Tailnet and authenticate peers using verified cloud and node identities. The portal may assist with discovery or rendezvous; it does not silently establish trust, authorize a file transfer, or substitute its own assertion for peer verification. Whether any payload relay is ever needed is outside this initial design.

A compromised or unavailable portal may be able to disrupt discovery, provide stale metadata, or mislead first-time lookup. Peers must verify signed identity records and reject unexpected key changes. A public transparency log could improve detection of registry changes, but is optional future work and must account for the privacy of registration metadata.

## 6. Cloud-to-cloud trust and family transitions

Federated trust is established deliberately between distinct Merka clouds. Each side must verify and accept the other cloud's cryptographic identity; a shared Tailnet, a matching name, or portal account relationship is not sufficient. Trust grants should be scoped to the intended services, data, and actions rather than granting blanket access to another cloud.

When a child graduates from a family cloud, the initial path is to create a separate cloud with a new identity and name, then manually establish new federation trust between the resulting clouds. The new cloud does not inherit the family cloud's identity, Owner authority, node enrollment, or trust grants. Data sharing or migration and removal of the child's previous access are separate, explicit operations.

## 7. Lifecycle and audit requirements

The implementation must distinguish these events: portal account recovery, cloud-key recovery, Tailnet membership change, cloud Participant removal, node enrollment/revocation, cloud deletion, and subdomain release. One event must not silently imply another.

Record security-relevant changes with the actor, affected cloud or node, action, scope, timestamp, and key or policy version. Define how records are synchronized across nodes and what happens when devices are offline. Never make successful portal delivery equivalent to successful authorization or revocation at every peer.

## 8. Open decisions before implementation

1. Select the key algorithm, signed-record format, key versioning, and client-side verification rules, including how first-time name-to-key discovery is authenticated.
2. Define mobile key storage and encrypted export/restore behavior across supported platforms; determine whether phone backups can restore the app-held key.
3. Design phone-loss recovery, offline-export restoration, and compromised-key rotation when the original key is unavailable.
4. Specify how the original phone proves Tailnet control and how Tailnet user/device identifiers are obtained and validated.
5. Define re-association to another Tailnet, including migration or revocation of existing grants.
6. Decide default Participant enrollment, allow/deny precedence, whether the Owner may delegate Owner authority, and how cloud policy is distributed and enforced by offline peers.
7. Set the deleted-name quarantine duration and detailed deletion, tombstone, and release process.
8. Define the minimum portal directory/presence data, retention, and whether a transparency log is warranted.
9. Specify node enrollment/revocation and the authenticated direct peer protocol.
10. Define federation invitation, bilateral acceptance, trust scope, and how either cloud revokes a trust grant.

These are intentional design gaps, not permission to infer trust from Tailnet reachability or portal ownership.
