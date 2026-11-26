# Merka.cloud

Merka.cloud is a local-first, multi-device agent platform. The local services, shared protocol, portal, and mobile app are managed in a Bun workspace. The Tauri desktop app is a standalone pnpm project.

## Workspace

| Path | Responsibility |
| --- | --- |
| `modules/agent-core` | Local orchestration, mesh state, tool dispatch, and dashboard |
| `modules/inference-service` | Isolated local model inference |
| `modules/memory-service` | Local indexing and long-term memory |
| `modules/core` | Shared, versioned protocol types |
| `apps/portal` | Cloudflare Workers portal scaffold; target is a public cryptographic discovery directory |
| `apps/mobile` | Expo development-build app with `llama.rn` |
| `apps/desktop` | Tauri 2 desktop configurator and orchestrator scaffold for local Bun services |
| `docs/` | Architecture, API/protocol references, and decision records |
| `infra/` | Existing deployment and infrastructure configuration |
| `tools/fabric` | Existing Fabric and transcript utilities |

The desktop app is intended to guide Bun service installation, configure service availability for OS-user profiles, and coordinate updates to the app and services. Extension management is a future capability. The current Tauri 2 scaffold does not yet install or manage services, map profiles, deliver updates, or manage extensions; those operations require an explicit authorization and integrity model.

The shared-computer security model and onboarding flow remain under design in [the desktop-first setup proposal](docs/architecture/desktop-first-setup.md). The desktop shell is a local control plane, not a replacement for the Bun services. It must not treat node or Tailnet membership as profile authorization or receive broad shell/filesystem privileges.

## Getting started

Install [Bun](https://bun.sh), then install the Bun workspace dependencies and run:

```sh
bun install
bun run dev:agent-core
```

The local services bind to loopback by default. `agent-core` uses port `3000`, `inference-service` uses `3001`, and `memory-service` uses `3002`; each exposes a `/health` endpoint.

## Desktop app

The Tauri 2 desktop app uses pnpm for its UI dependencies and requires a Rust toolchain and the platform prerequisites listed in the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/). From the repository root, install its dependencies and start it with:

```sh
pnpm --dir apps/desktop install
pnpm --dir apps/desktop dev
```

Build a native app bundle with `pnpm --dir apps/desktop build`. This scaffolds the desktop shell and UI only; it does not yet install, configure, start, or update Bun services.

See each module's README for its current scope. The previous infrastructure guide is preserved at [`docs/archive/legacy-infrastructure.md`](docs/archive/legacy-infrastructure.md).
