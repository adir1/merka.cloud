# Merka Agent OS - Functional Architecture

## 1. Vision: The Abstracted Agent Operating System
Merka Agent OS serves as a "meta-operating system" layer. It abstracts the underlying infrastructure (local PC, cloud stream, mobile device) into coherent functional planes. This allows for pluggable tooling where specific implementations (e.g., K3s vs. Podman, Garage vs. MinIO) can be swapped without breaking the higher-level agentic behaviors.

## 2. Functional Areas (The 7 Pillars)

### 2.1. Storage Plane (The "Memory & Cortex")
Transcend simple file storage to become a reactive, time-aware data fabric. This plane manages the lifecycle of information, not just bytes.

*   **Core Data (The "Truth")**
    *   **Definition**: The raw, immutable artifacts (documents, images, videos, logs).
    *   **Behavior**: Versioned and often Content-Addressable (CAS). A change in a file creates a new version, preserving the old one for history.
    *   **Role**: The "System of Record".

*   **Descriptive Metadata (The "Context")**
    *   **Definition**: Information *about* the data that describes it but doesn't change the data itself (e.g., tags, authorship, permissions, file names).
    *   **Behavior**: Mutable and lightweight. Can change frequently without creating new heavy blobs of Core Data.
    *   **Role**: Searching and organizing.

*   **Derived Data (The "Insight")**
    *   **Definition**: Information *computationally generated* from Core Data by Agents.
        *   *Examples*: Vector embeddings, transcription text, summaries, detected objects in images.
    *   **Behavior**: **Re-computable**. This is the critical differentiator. Derived data is ephemeral in the sense that it can always be regenerated from the Source.
    *   **Reactive Lineage**: If `Core Data (v1)` changes to `(v2)`, the system invalidates the `Derived Data` associated with `(v1)` and triggers an Agent to compute derived data for `(v2)`.
    *   **Role**: Querying and Intelligence.

*   **Temporal Fabric (The "Timeline")**
    *   **Definition**: The system maintains awareness of *when* data existed.
    *   **Behavior**: Time-Travel. Agents should be able to ask "What did the Knowledge Graph look like yesterday?"
    *   **Mutation Logs**: Every change (data or metadata) is recorded in an append-only log.

### 2.2. Compute Plane (The "Brain & Muscle")
Orchestrates the execution of logic, distinguishing between deterministic algorithms and probabilistic inference, independent of physical location.

*   **General Compute (Universal Logic)**
    *   **Definition**: Traditional, deterministic code execution (Scripts, Binaries, WASM, Containers).
    *   **Workloads**: Data ingestion, graph traversal, format conversion, web serving.
    *   **Requirement**: Strong consistency and standard architectural compatibility (x86/ARM).

*   **Neural Compute (Cognitive Operations)**
    *   **Definition**: Probabilistic execution using AI models (LLMs, Vision, Audio).
    *   **Workloads**: Semantic analysis, image recognition, reasoning, embeddings generation.
    *   **Requirement**: Hardware acceleration (GPU/NPU) and specific runtime environments (CUDA, Metal, ROCm).

*   **Compute Location Strategy (The "Offload")**
    *   **Local First**: Default to executing on the node where data resides to minimize latency and bandwidth.
    *   **Remote Offload**: If Local Compute is insufficient (e.g., weak mobile device needing 70B LLM), offload to a capable peer (e.g., Home Server).
    *   **Data Gravity vs. Compute Mobility**:
        *   *Function Shipping*: If data is heavy (e.g., 4K video) and compute is light (extract metadata), send code to the data.
        *   *Data Shipping*: If compute is specialized (e.g., Neural Inference on dedicated GPU node) and data is movable (text chunk), stream data to the compute.

### 2.3. Networking Plane (The "Nervous System")
Connects components locally, across owner devices, and federates with other clouds.
*   **Mesh Fabric**: Secure, zero-config overlay network connecting all user devices.
    *   *Pluggable Options*: Tailscale (Headscale), WireGuard, Nebula.
*   **Service Mesh / Discovery**: Internal routing to find "where is the vector DB?" or "where is the summarization agent?".
    *   *Pluggable Options*: Kube-DNS, Consul, mDNS (for local peer discovery).
*   **Streaming Transport**: High-throughput protocol for real-time data exchange between Merka nodes.
    *   *Pluggable Options*: gRPC, QUIC / HTTP3, WebRTC (for P2P).

### 2.4. Identity & Security Plane (The "Immune System")
Ensures that "who you are" and "what you can see" is enforced across boundaries.
*   **Identity Provider (IdP)**: Single source of truth for Users and Devices.
    *   *Pluggable Options*: Keycloak, Authentik, Zitadel, OIDC Generic.
*   **Policy Engine**: Fine-grained access control (RBAC/ABAC). "Can Agent X read File Y?"
    *   *Pluggable Options*: Open Policy Agent (OPA), Cedar.
*   **Lineage Notary**: Cryptographic signing of data origin and transformation history.
    *   *Pluggable Options*: Notary (TUF), Sigstore, Merkle Trees.

### 2.5. User Interface & Interaction Plane (The "Face")
Generic abstractions for how the human interacts with the OS.
*   **Omni-channel API/Gateway**: Aggregates UI requests.
    *   *Pluggable Options*: GraphQL (Federated), TRPC.
*   **Frontend Frameworks**: Visual interfaces for management and interaction.
    *   *Pluggable Options*: Next.js, React Native (Mobile), Gradio/Streamlit (Data Apps).
*   **Natural Language Interface**: Voice/Text command interpretation layer.

### 2.6. Integration Plane (The "Hands")
Adapters that allow Merka to reach outside its own boundaries to fetch or send data.
*   **Connectors**: Standardized drivers for external data sources.
    *   *Types*: IMAP (Email), Slack/Discord APIs, Google Drive/OneDrive, IoT (MQTT/HomeAssistant).
*   **Protocol Adapters**: Translation layers for legacy systems.

### 2.7. Observability & Insight Plane (Proposed)
System-wide visibility into what the Agent OS is doing.
*   **Telemetry**: Metrics and Logs.
    *   *Pluggable Options*: Prometheus, Grafana, Loki, OpenTelemetry.
*   **Audit Trail**: Immutable log of *decisions* made by agents (e.g., "Why did the agent recommend this file?").

## 3. Architecture Diagram (Abstract)

```mermaid
graph TD
    User((User)) --> UI[UI / Interaction Plane]
    
    subgraph "Merka Agent OS"
        UI --> ID[Identity Plane]
        UI --> API[API Gateway]
        
        API --> Logic[Compute Plane]
        Logic --> Models[Inference / Intelligence]
        
        Logic --> Store[Storage Plane]
        subgraph "Storage Abstraction"
            Store --> S_Blob[Blob]
            Store --> S_Vec[Vector]
            Store --> S_Graph[Graph]
        end
        
        Logic --> Integrations[Integration Plane]
        Integrations <--> External[External World (Web, IoT, Cloud)]
        
        Logic <--> Net[Networking Plane]
    end
    
    Net <--> Mesh[Other Merka Nodes]
```

## 6. System Bootstrap & Discovery (The "Init System")
Taking inspiration from *systemd*, Merka Agent OS uses a declarative, dependency-based bootstrap process. It does not hardcode implementations; instead, it requests *Capabilities* which are fulfilled by *Providers*.

### 6.1. Declarative Unit Specification
The system defines requirements via `CapabilityUnits`.
*   **Target**: A desired system state (e.g., `graph-storage.target`).
*   **Requirement**: Defines the interface, not the tool (e.g., "Must provide Neo4j-compatible Bolt Protocol").
*   **Example**:
    ```yaml
    # /etc/merka/targets/semantic-storage.target
    [Unit]
    Description=Semantic Vector Storage Layer
    Requires=storage.plane
    
    [Capability]
    Interface=vector.store.v1
    PreferredProvider=lance-db
    ```

### 6.2. Provider Discovery Mechanism
*   **Provider Manifests**: Each plugin (Container, Binary, WASM) ships with a manifest declaring what local capabilities it fulfills.
    *   *Example*: A Postgres container declares `Provides=sql.store.v1, vector.store.v1` (if pgvector installed).
*   **The Registrar**: A lightweight daemon (Process 1) scans `/etc/merka/providers/` and registers available implementers into a dependency graph.

### 6.3. Late-Binding & Resolution
*   At boot, the OS builds a Directed Acyclic Graph (DAG) of the requested Targets.
*   **Resolution**:
    1.  Check strictly required capabilities.
    2.  Find registered providers for each.
    3.  **Score**: If multiple providers exist (e.g., both `Chroma` and `LanceDB` are installed), use the user's `PreferredProvider` or a heuristic (speed/memory).
    4.  **Bind**: Inject the selected provider's connection details (Socket/Port) into the environment of dependent agents.

### 6.4. Multi-Provider & Fallback
*   **Hot-Swapping**: The OS allows for multiple active providers. An "Archive Agent" might use `GlacierAdapter` (slow, cheap), while a "Chat Agent" uses `LocalNVMeAdapter` (fast).
*   **Fallback Strategy**: If `RemoteGPUCompute` provider is unreachable, the system can dynamically re-bind the `neural.compute.v1` capability to `LocalCPUInference`, ensuring degradation rather than failure.

### 6.5. Dynamic Updates
*   **Hot Reload**: Providers can be updated in-place without rebooting the system.
*   **Rollback**: If a provider fails, the system can revert to a previous version or failover to a different provider.
