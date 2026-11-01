# Merka.cloud platform

## Overview

Merka.cloud is a local-first multi-device Agent solution for managing personal and family devices. It is designed to simplify access to personal information and files no matter what device they are on, while also allowing interoperability with other merka clouds if approved.

## Technical Architecture

The core platform combines Tailnet and Bun, and supports many adds and integrations for flexibility.

A **Multi-Process Architecture** (1 Main Agent Daemon + 2 Managed Sub-Processes = 3 total Bun instances on every node) to provide balance of safety and performance.

### Local Process Breakdown

1. **Main Agent & Network Daemon (`agent-core`)**
* **Role:** Orchestrates cluster state, tool execution, networking, and UI.
* **Executes:**
* SvelteKit C2 Dashboard served via `Bun.serve()`.
* Peer-to-Peer Yjs CRDT Sync engine over Tailscale WebSockets.
* Network identity and reachability (`tailscale whois`); cloud-local member and data authorization is enforced separately by Merka policy.
* Tool dispatcher & Scatter-Gather search aggregator.
* **Lifecycle:** High-availability long-running daemon.

2. **Inference Engine Sub-Process (`inference-service`)**
* **Role:** Dedicated local LLM execution.
* **Executes:** `node-llama-cpp` wrapper listening on a local port or Unix domain socket using an OpenAI-compatible endpoint.
* **Why Separate?** Isolates native C++ memory allocation and GPU/CPU thread pools from the main JS event loop. If inference crashes or OOMs, `agent-core` detects the process exit, restarts it in the background, or seamlessly reroutes the active request to OpenRouter without dropping client UI connections or losing CRDT state.

3. **Background Indexer & Memory Process (`memory-service`)**
* **Role:** Local file system crawling and vector embedding generation.
* **Executes:** Disk walking, text chunking, and embedding generation written to local `bun:sqlite` using `sqlite-vec`.
* **Why Separate?** Prevents heavy disk I/O and vector calculations from causing micro-stutters in the SvelteKit dashboard or delaying network packet processing in `agent-core`.

### Architectural Layers Summary

| Layer | Tech Stack | Execution Model (Local Node) | Mesh Scope (Tailscale) |
| --- | --- | --- | --- |
| **Networking & Identity** | Tailscale + Native Bun WS | Embedded in `agent-core` | Direct P2P encrypted mesh between all nodes; zero-trust identity via `tailscale whois`. |
| **State Synchronization** | Yjs CRDT over Bun WebSockets | Embedded in `agent-core` | Masterless distributed state map; mathematically merges config, active tasks, and event logs across all nodes. |
| **User Interface (C2)** | SvelteKit (Svelte 5) | Embedded in `agent-core` (`Bun.serve()`) | Accessible from any device browser at `http://<node-tailscale-ip>:3000`. |
| **Local Inference** | `node-llama-cpp` (CUDA / Metal) | **Isolated Bun process** (`localhost` IPC) | Hardware-accelerated local LLM inference; fallback to OpenRouter managed by `agent-core`. |
| **Short-Term Memory** | Yjs CRDT Scratchpad | In-memory within `agent-core` | Replicated across all mesh nodes in real time. |
| **Long-Term Vector Memory** | `bun:sqlite` + `sqlite-vec` | Shared between `agent-core` & `memory-service` | **CQRS Pattern:** Events synced via CRDT; vectors materialized locally into SQLite. Queries use Scatter-Gather. |
| **Filesystem Indexing** | Local crawler + `sqlite-vec` | **Isolated Bun background process** | Node-local file indexing; cross-device search executed via WebSocket Scatter-Gather RPC. |

### Process Topology

Main Agent Daemon with SvelteKit C2 Dashboard and Yjs CRD Engine for state sync over mesh. It does imply that every node has own Dashboard, but regardless of which one is accessed - the information and operations shall be the same as CRDT engine maintains state sync.

Two additional sub-processes shall be running locally as another Bun instance, communicating over IPC or port. First is Inference-service, utilizing node-llama-cpp to host GGUF model with CUDA or Metal hardware integration. Second is dedicated data processor, including memory organization, disk indexing and vector-store enabled DB.

## Security Architecture
