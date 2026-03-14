# Merka Agent OS - Security Architecture

## 1. Core Principles & Definitions

The security model of Merka is designed to allow a "Federation of Sovereignties". Each user is their own root authority, but they can seamlessly interact with others through a common web of trust.

### 1.1. Components
*   **Merka "Cloud" (The Kingdom)**: A sovereign digital territory. Anchored by a **Cloud Root Key**.
*   **Node (The Castle)**: A device (Server, Laptop). Has a **Node Identity** (Keypair) used for network routing.
*   **User (The Lord/Lady)**: A human identity. Has a **User Identity** (Keypair) used to authorize actions.
*   **Agent (The Servant)**: A process running on a Node, acting on behalf of a User or Node.

## 2. Identity Model: Humans vs. Machines

We strictly separate the machine infrastructure from the humans operating it.

### 2.1. Node Identity (Infrastructure)
*   **Purpose**: Network routing, encryption, persistent storage availability.
*   **Format**: Cryptographic Keypair (Ed25519).
*   **IPv6 Binding**: The Node's IPv6 address is derived from its Public Key `Hash(Node_PubKey)`.
*   **Lifecycle**: Born when the OS is installed. Dies when the disk is wiped.

### 2.2. User Identity (Sovereignty)
*   **Purpose**: Access control, signing commits, authorizing payments.
*   **Format**: Keypair (ideally hardware-backed via WebAuthn/YubiKey).
*   **Multi-User Clouds**: A single Merka Cloud can host multiple Users (e.g., "The Smith Family Cloud").
*   **Root User**: The holder of the Cloud Root Key, who can add/remove other Users and Nodes.

## 3. Network Security: Cryptographic IPv6

We bypass legacy DNS and VPN management by moving security to the Network Layer.

### 3.1. Crypto-Addressing (CGA / Yggdrasil Model)
*   **The Address**: A Node's IPv6 address is not random. It is a cryptographic hash of its Public Key.
    *   `IPv6_Addr = Hash(Node_Public_Key)`
*   **Zero-Config Routing**: Routing tables are based on the "distance" between these hashes (DHT-like routing in the network layer).
*   **Implicit Authentication**: when you receive a packet from `200::abc`, you can verify it was signed by `Key_ABC`. Proof of Ownership is built into the protocol.

### 3.2. End-to-End Encryption
*   **Default**: All traffic is encrypted between source and destination IPv6 addresses using the keys derived from those addresses.
*   **No "VPN" to manage**: The entire Merka Mesh is one giant encrypted overlay.


## 4. Federated Identity & Exposure

How do different clouds talk if they don't share a Root Key?

### 4.1. Peering "Handshakes"
*   **Direct Peering**: Alice wants to share a file with Bob.
    1.  Alice adds Bob's Root Public Key to her "Trusted Contacts" ring.
    2.  Nodes signed by Alice can now accept connections from Nodes signed by Bob.
*   **Address Book**: "Bob" is just a local alias for `Bob_Root_Public_Key`.

### 4.2. Public Exposure
*   **Gateway Nodes**: Some nodes have a distinct "Public Role".
*   **Cleartext Ingress**: They accept standard TCP/HTTPS on specific ports.
*   **Internal Routing**: They map `https://share.alice.com` -> `[IPv6_Crypto_Addr]:8080` internally.
*   **Isolation**: Public requests are isolated from the Mesh unless explicitly forwarded.

## 5. Authorization: Hierarchical Roles

We use a sovereign, hierarchical Role-Based Access Control (RBAC) model. Permissions are assigned to Roles, and Roles can contain Users, Nodes, or *other Roles*.

### 5.1. The Role Mechanism
*   **Structure**: A Graph of Roles.
*   **Definition**: A Role is a list of members.
    `Role:Editors = [User:Alice, Role:Interns]`
*   **Inheritance**: A Role implies all permissions of its children.
    *   `Role:Root` contains `Role:Admin`
    *   `Role:Admin` contains `Role:User`
    *   `Role:User` contains `Role:Guest`

### 5.2. Standard Primitive Roles (The Hierarchy)
1.  **Role:Root (The Sovereign)**
    *   **Members**: The Cloud Owner.
    *   **Permissions**: `*` (All). Can fundamentally alter the Cloud's topology (add nodes, ban users).
    *   *Includes: Role:Admin*

2.  **Role:Admin (The Maintainer)**
    *   **Members**: Trusted power users.
    *   **Permissions**: Install software, change configurations, read all data.
    *   *Includes: Role:User*

3.  **Role:User (The Resident)**
    *   **Members**: Standard family members / employees.
    *   **Permissions**: Read/Write to shared spaces, Full control over own `Private/` namespace.
    *   *Includes: Role:Guest*

4.  **Role:Guest (The Visitor)**
    *   **Members**: Read-only accounts, limited scope agents.
    *   **Permissions**: Read specific `Public/` or `Shared/` collections.

### 5.3. Federated Trust (Cross-Cloud Roles)
Trust is established by mapping an **External Identity** (or External Role) into a **Local Role**.

*   **Scenario**: Alice wants to give Bob (from `BobCloud`) access to her photos.
*   **Mechanism**: Alice adds `BobCloud:User:Bob` to her local `Role:PhotoViewers`.
*   **Group Mapping**: Alice can add `BobCloud:Role:Family` to her local `Role:CloseFriends`.
    *   Now, *anyone* Bob adds to *his* Family role automatically gains access to Alice's photos.
    *   *Trust Delegation*: "I trust Bob to decide who his family is."

### 5.4. Agent Delegation (The "Task Token")
Agents operate on a **Least Privilege** basis. They do *not* endlessly inherit the full rights of their owner. Instead, they are granted **Task-Specific Authority**.

1.  **The Trigger**: User Alice asks the "Image Optimizer Agent" to compress her vacation photos.
2.  **The Delegation**: Alice's client generates a signed **Task Token**:
    *   **Issuer**: `User:Alice`
    *   **Subject**: `Agent:Optimizer`
    *   **Scope**: `ALLOW Read/Write on /data/photos/2024_Hawaii/*`
    *   **Constraint**: `TTL = 1 Hour`
3.  **The Elevation**: The Agent attaches this token to its internal requests.
    *   When accessing the Storage Plane, it says: "I am the Optimizer, and Alice authorized this *specific* write."
4.  **Traceability**: The audit log records: *"Action by Agent:Optimizer, on behalf of User:Alice (TokenID: 123)"*.

This ensures that a compromised agent cannot nuke the entire cloud, even if the user who triggered it has Root privileges.

## 6. Security Lifecycle Workflows

### 6.1. Device Enrollment (Bootstrapping trust)
1.  **New Device** generates a keypair.
2.  **User** on an *existing trusted device* (e.g., Phone) scans a QR code from the New Device.
3.  **Trusted Device** signs the New Device's public key with the Cloud Root (or delegates via an intermediate).
4.  **New Device** receives the certificate and joins the Mesh.

### 6.2. Revocation
*   **Node Compromise**: The Cloud Root publishes a CRL (Certificate Revocation List) or OCSP stapling to all other nodes.
*   **Effect**: The compromised node is immediately locked out of the Mesh and rejected by all internal services.
