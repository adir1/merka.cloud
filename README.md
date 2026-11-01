# Merka.cloud

Merka.cloud is a local-first, multi-device agent platform. This repository is being reorganized as a Bun workspace for its local services and shared protocol, alongside the Cloudflare portal and React Native app.

## Workspace

| Path | Responsibility |
| --- | --- |
| `modules/agent-core` | Local orchestration, mesh state, tool dispatch, and dashboard |
| `modules/inference-service` | Isolated local model inference |
| `modules/memory-service` | Local indexing and long-term memory |
| `modules/core` | Shared, versioned protocol types |
| `apps/portal` | Cloudflare Workers portal scaffold; target is a public cryptographic discovery directory |
| `apps/mobile` | Expo development-build app with `llama.rn` |
| `docs/` | Architecture, API/protocol references, and decision records |
| `infra/` | Existing deployment and infrastructure configuration |
| `tools/fabric` | Existing Fabric and transcript utilities |

The service and app directories are initial scaffolds; their detailed behavior and protocol contracts will be established in the architecture docs and future decision records.

The cross-platform desktop target and its shared-computer security model are being explored in [the desktop-first setup design](docs/architecture/desktop-first-setup.md); no desktop app scaffold or framework decision exists yet.

## Getting started

Install [Bun](https://bun.sh), then run:

```sh
bun install
bun run dev:agent-core
```

The local services bind to loopback by default. `agent-core` uses port `3000`, `inference-service` uses `3001`, and `memory-service` uses `3002`; each exposes a `/health` endpoint.

See each module's README for its current scope. The previous infrastructure guide is preserved at [`docs/archive/legacy-infrastructure.md`](docs/archive/legacy-infrastructure.md).
