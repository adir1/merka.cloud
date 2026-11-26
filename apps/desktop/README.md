# Merka Desktop

The Tauri 2 desktop configurator and orchestrator scaffold. Its intended role is to guide installation and configuration of Merka's Bun services, ensure those services are available to the appropriate OS-user profiles, and coordinate verified updates to the desktop app and services. Extension management is planned for a future iteration.

This scaffold does not yet perform service installation, profile mapping, updates, or extension management. It does not replace `agent-core` or provide the UI with general shell or filesystem access. See the [desktop-first setup proposal](../../docs/architecture/desktop-first-setup.md) for the shared-computer security and onboarding model.

For the approved cross-platform visual and accessibility direction, see the [style guide](../../docs/design/style-guide.md).
The [initial screens specification](../../docs/desktop/initial-screens.md) describes the MVP flow. The UI currently opens on a Dashboard with unavailable status and offers a preview of Getting Started. Cloud creation and joining are not yet available; navigating the preview does not change setup.

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

The desktop bundle icons are generated from `app-icon.svg` using
`bun run --filter @merka/desktop tauri icon app-icon.svg`.

### Pending cross-platform validation

The Tauri CLI and esbuild have not yet been verified from a clean Bun install
on every supported desktop platform. Before treating desktop setup as
cross-platform validated, run these checks from a fresh checkout on macOS,
Windows, and Linux:

```sh
bun install --frozen-lockfile
bun run --filter @merka/desktop tauri --version
bun run --filter @merka/desktop build:ui
```

Confirm the Tauri CLI executable is available and the UI build completes,
including esbuild's transform step. If Bun blocks a required dependency
lifecycle script, trust only the specific dependency that requires it and
repeat the clean-install checks.
