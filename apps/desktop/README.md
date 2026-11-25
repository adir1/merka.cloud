# Merka Desktop

The Tauri 2 desktop configurator and orchestrator scaffold. Its intended role is to guide installation and configuration of Merka's Bun services, ensure those services are available to the appropriate OS-user profiles, and coordinate verified updates to the desktop app and services. Extension management is planned for a future iteration.

This scaffold does not yet perform service installation, profile mapping, updates, or extension management. It does not replace `agent-core` or provide the UI with general shell or filesystem access. See the [desktop-first setup proposal](../../docs/architecture/desktop-first-setup.md) for the shared-computer security and onboarding model.

For the approved cross-platform visual and accessibility direction, see the [style guide](../../docs/design/style-guide.md).
The [initial screens specification](../../docs/desktop/initial-screens.md) describes the MVP flow. The UI currently opens on a Dashboard with unavailable status and offers a preview of Getting Started. Cloud creation and joining are not yet available; navigating the preview does not change setup.

## Development

From the repository root:

```sh
pnpm install
pnpm dev:desktop
```

Building a native app bundle requires pnpm, Rust, and the platform-specific prerequisites in the [Tauri guide](https://v2.tauri.app/start/prerequisites/):

```sh
pnpm build:desktop
```

The desktop bundle icons are generated from `app-icon.svg` using
`pnpm --filter @merka/desktop tauri icon app-icon.svg`.
