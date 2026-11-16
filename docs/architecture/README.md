# Architecture

- [Platform overview](platform-overview.md) — preserved functional architecture.
- [Security architecture](security.md) — Tailnet-based identity, cloud boundaries, enrollment, and trust.
- [Desktop-first setup](desktop-first-setup.md) — proposed cross-platform desktop target and shared-computer identity model.
- [File layout and installation](file-layout.md) — per-user Bun service home and its relationship to the separately installed desktop app.
- [Monorepo foundation](../decisions/0001-monorepo-foundation.md) — initial module boundaries and scaffold choices.

Treat the service contracts in `modules/core` as a starting point. Record transport, versioning, lifecycle, persistence, and trust decisions here before expanding them.
