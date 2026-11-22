# Merka file layout and installation

- **Status:** Decided Nov 14, 2026 (Pure B — one visible Merka service folder under the user profile). The earlier OS-native app-data proposal for the Bun components is superseded. Installation and service lifecycle behavior are not yet implemented.
- **Scope:** The on-disk layout and lifecycle of a desktop node's Bun components, and their relationship to the separately installed Tauri app. Mobile storage is out of scope.

## 1. Decision

Desktop installation has two distinct components:

1. **Tauri desktop app:** Installed in the platform's normal application location according to its distribution channel and OS conventions, including app stores where supported. Its bundle is not installed inside the Merka service folder.
2. **Merka Bun components:** Installed and run for the active OS user from one visible folder under that user's profile, with the same inner structure on every OS:

- macOS: `~/merka/`
- Windows: `%USERPROFILE%\merka\`
- Linux: `~/merka/`

The app detects whether the Bun components are installed for the active OS user and guides their installation or configuration when needed. The Merka service home must not be offered at a shared or external path; the app must warn if the user moves it to one manually (see §3). OS-managed service registrations may reside outside this folder.

## 2. Layout

```
~/merka/
  clouds/<cloud-id>/    cloud.json  node.key  membership.json  owner.key-ref
  profiles/<profile-id>/  memory.sqlite  chats/  index/      (sqlite-vec)
  services/  bin/  logs/  state.json                       (ports, pids)
  models/    *.gguf cache — per-user service home, inference-capable nodes only
  spaces/    manifests only — pointers to user-chosen shared folders
```

- `clouds/` holds one directory per cloud this node belongs to: the cloud record, the node key, membership, and a reference to the Owner key (never the key itself).
- `profiles/` holds one directory per Merka-native profile on this node: private agent memory, chat history, indexes, and that profile's temporary OS-account UUID/API-like identifier. No database or private context is shared across profiles.
- `services/bin/` holds the installed service programs and any service-managed runtime dependencies. The Bun runtime may be managed there or supplied separately; its distribution is not yet decided.
- `services/` also holds runtime state for `agent-core` and its `inference-service` and `memory-service` subprocesses (such as ports and PIDs), and their logs. The exact executable and state formats remain to be designed.
- `models/` is the GGUF cache for this service home. It exists only on inference-capable devices (see §4).
- `spaces/` holds manifests only — pointers to user-chosen shared folders, never copies of their contents.

## 3. Privacy on a shared computer

The per-OS-user home supports the safety rules in `desktop-first-setup.md` §3, but its location alone does not guarantee privacy. Installers and services must enforce appropriate OS permissions on credentials, private agent memory, chat history, and indexes, and must not share tokens or databases across profiles. Each OS account has its own Merka service home; a shared location or permissive access controls can break this boundary.

Profiles are Merka-native and managed by the cloud (`security.md` §2 and §4); enrollment may use phone pairing or a desktop-first flow. Each OS user's Merka home generates a temporary UUID/API-like identifier. A root mobile or desktop authority captures that identifier on the selected Merka profile. The device lease is the authoritative security boundary; the UUID only identifies which family member's context is in use. It must not be inferred from a username or OS account name, and local OS login alone must not silently enroll a person into a cloud.

## 4. Models and inference

Models live only on inference-capable devices. Within one OS user's service home, `models/` is shared by the services and profiles authorized to use them; per-profile copies of multi-GB files are wasteful. Agent-core enforces grants for service access, while OS permissions govern direct file access. Sharing one physical cache across OS-user homes is not specified.

Devices without local inference reach AI remotely over the Tailnet to an inference-capable Merka node. If no AI-capable device is available at all, an OpenAI-compatible endpoint outside the Merka cloud is the fallback — today that is OpenRouter, managed by agent-core (`AGENTS.md`). Which inference route is in use, and its data-flow boundary, must be visible before it is enabled (setup flow step 6, `desktop-first-setup.md` §4).

## 5. Backup

Pure B's visible folder makes backup easy to find — and easy to get wrong. Two rules:

1. **Back up databases consistently.** Use SQLite's backup API or capture a consistent snapshot with writers stopped; include any required WAL alongside the database, or checkpoint it on clean shutdown before copying. Copying a live database and its WAL separately does not guarantee a consistent backup.
2. **Exclude `models/` and `services/logs/` from routine backup and sync.** Models are multi-GB and re-downloadable; back up a `models/manifest.json` (model id, revision, hash) instead of the weights. Same for logs.

Externalizing models is a future option, not an exception to the service-home rule in §1. It requires a separate design for paths, permissions, integrity, and shared access.

## 6. Tauri app and background services

The separately installed Tauri app is the setup and coordination control plane, not the cloud service or the host of the service processes.

- **Separate installation and detection.** The platform installs the Tauri app in its normal location. On launch, the app checks the active OS user's service installation and registration, distinguishing missing, stopped, and running services; if needed, it guides the user through installing and configuring the Bun components in that user's Merka home. The packaging and delivery of Bun and service dependencies are open; Git is not assumed to be required.
- **Background services.** The intended initial default is per-OS-user workers: `agent-core` runs as the background daemon and manages `inference-service` and `memory-service` as subprocesses, restarting them if they exit (`AGENTS.md`). The platform registration mechanism and behavior outside an OS login session remain to be designed. Closing the Tauri app must not stop running services.
- **App responsibilities.** The app guides the first-run wizard (the 7 setup steps in `desktop-first-setup.md` §4), service start/stop/restart, status and health, and updates to both components. Lifecycle operations require narrow, authenticated local IPC; loopback access alone is not authentication. Updates must be authorized, integrity-verified, and recoverable. Exact IPC and health endpoints remain open.
- **Removal.** The service removal flow must offer to stop and unregister the background services and clearly distinguish removing programs from retaining or deleting user data. Platform or store uninstallers may not support interactive prompts, so a supported cleanup path must be designed rather than relying solely on an uninstall prompt.

## 7. Owner-key recovery

Deferred to `security.md` §6 (Mobile Key Custody & Device Recovery), which covers key custody, handover between phones, and device recovery. If that section proves incomplete for the desktop install flow, it is revisited in a future iteration — this document does not invent a recovery story.

## 8. What this settles, and what remains open

Settled here:

- File layout: Pure B, `~/merka/` under each OS user's profile for the Bun components; the Tauri app is installed separately using platform conventions.
- Profiles: Merka-native, cloud-managed trust chain; optional OS-account association at first install.
- Models: inference-capable devices only, shared cache within each service home, Tailnet remote inference, OpenAI-compatible endpoint as fallback.
- Desktop app: detects and guides installation of the active user's Bun components, then coordinates their lifecycle.
- Services: `agent-core` and two managed subprocesses; per-user workers are the initial default.

Still open (from `desktop-first-setup.md` §5):

- Decision #3: whether to retain per-user workers or introduce a machine service with per-user workers.
- Decision #4: the shared-data model — selected folders, Merka-managed libraries, or both.
- Decision #5: exact Owner-key recovery guarantees (see §7).
- Decision #6: the local IPC and process-supervision design that works consistently across all three desktop OSes.
- Decision #7: whether the Tauri shell meets UI, accessibility, packaging, update, and native-inference requirements.
- Bun runtime and service dependency packaging, delivery, and registration on each desktop OS.
- Service cleanup and data-retention options across platform and store uninstall flows.
- In-account profile switching (multiple people switching profiles within one OS account) is deferred, not rejected.

## References

- `desktop-first-setup.md` — shared-computer identity model (§3), 7-step setup flow (§4), open decisions (§5)
- `security.md` — trust hierarchy (§2), leased device credentials and desktop storage (§3), member profiles (§4), mobile key custody and device recovery (§6)
- `platform-overview.md` — the 7 functional planes
