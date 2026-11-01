# Agent Core

The main local Bun daemon. Its planned responsibilities are cluster orchestration, Tailscale identity/networking, Yjs state synchronization, tool dispatch, and the node dashboard.

The initial process only exposes the shared `/health` response on `127.0.0.1:3000`. Bind to a wider interface only when the network identity and authorization layers are implemented.
