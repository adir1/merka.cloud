# Merka Desktop

The Tauri 2 desktop configurator and orchestrator scaffold. Its intended role is to guide installation and configuration of Merka's Bun services, ensure those services are available to the appropriate OS-user profiles, and coordinate verified updates to the desktop app and services. Extension management is planned for a future iteration.

This scaffold does not yet perform service installation, profile mapping, updates, or extension management. It does not replace `agent-core` or provide the UI with general shell or filesystem access. See the [desktop-first setup proposal](../../docs/architecture/desktop-first-setup.md) for the shared-computer security and onboarding model.

## Development

From the repository root:

```sh
bun install
bun run dev:desktop
```

Building a native app bundle requires Bun, Rust, and the platform-specific prerequisites in the [Tauri guide](https://v2.tauri.app/start/prerequisites/):

```sh
bun run build:desktop
```
