# Desktop-first setup and shared-computer model

- **Status:** Discussion draft; no desktop framework or identity-flow decision has been accepted.
- **Scope:** A cross-platform desktop client and first-run experience, including computers used by multiple people.

This proposal makes desktop a first-class setup path alongside mobile. It does not replace the local services, cloud identity, or explicit enrollment requirements in the current security design.

## 1. Fit with the current design

The product goal is clear: connect personal, family, and small-business devices; retain clear identity and access boundaries; and let agents find relevant information where it lives. The repository does not yet define the operational rules needed to deliver that goal on a shared computer.

- The root README describes mobile as an Expo scaffold and says app behavior is not yet defined. It has no desktop app.
- `AGENTS.md` describes a Tailnet-centered node with three Bun processes and a SvelteKit dashboard hosted by `agent-core`. It does not say how those processes behave when several OS accounts use the same machine.
- `security.md` previously treated mobile registration and a portal account as part of cloud setup. The corrected direction is that any client creates the cloud key locally and publishes a signed public record without portal login. Cloud-local profiles and their data remain outside the portal.

These are not conflicts with the high-level local-first goal, but they are real gaps for desktop-first onboarding. In particular, a Tailnet identity or node is not a safe substitute for the person currently signed in to Windows, macOS, or Linux. Merka must authenticate and authorize local people independently of network reachability.

## 2. Desktop target and stack to evaluate

**Recommended prototype target:** `apps/desktop`, using Tauri 2 as a thin native shell, a TypeScript UI (preferably Svelte to align with the intended dashboard), and the existing `@merka/core` protocol types. Treat this as a candidate, not an accepted stack decision.

| Candidate | Strengths for Merka | Costs and risks |
| --- | --- | --- |
| **Tauri 2** | Small native shell; Rust host can expose narrowly scoped commands; supports Windows, macOS, and Linux; can package external sidecar processes. | Uses the system WebView (WebView2, WKWebView, or WebKitGTK), so rendering and available web APIs differ. Native packaging, signing, WebView prerequisites, and Bun/native inference sidecars need prototypes on all three OSes. |
| **Electron** | Bundled Chromium gives a more consistent renderer and a mature desktop ecosystem. Main/renderer process separation can support a strong privilege boundary when configured correctly. | Bundles Chromium and Node.js, increasing runtime and distribution footprint; privileged IPC still needs careful design and a small API surface. |

Tauri is the better first experiment for the stated efficiency goal and keeps privileged operations in a small native host. Electron remains a sensible fallback if WebView variation or required integrations outweigh the size and runtime costs. The choice should follow a vertical-slice prototype, not assumptions based on framework marketing.

The desktop shell should be a client and lifecycle manager, not a second implementation of `agent-core`. Keep orchestration, indexing, and inference in their existing processes. The UI must not receive general filesystem or shell access; native commands should be narrow, validated operations. The services need an authenticated local IPC contract (for example, per-OS-user named pipes or Unix-domain sockets with OS permissions). Loopback-only binding alone must not be treated as authentication.

Before committing to the stack, prototype installation and upgrades, sidecar startup/shutdown, service recovery after UI exit, file-picker grants, local IPC authorization, and inference packaging on Windows, macOS, and Linux. GPU-enabled inference may have different support and distribution requirements from the desktop shell.

## 3. Identity and data boundaries on a shared computer

Keep these concepts distinct; they are related, but they are not interchangeable:

| Concept | Meaning |
| --- | --- |
| **Node** | The enrolled computer and its device key. Multiple local people may use one node. |
| **OS account/session** | The operating-system security principal whose filesystem permissions and login session apply to a process. |
| **Cloud-local member profile** | A principal managed by one Merka cloud, with cloud-scoped identity and grants. It may be associated with an OS account, but must not be inferred from its name or email. |
| **Agent process** | A process acting for a specific profile, with only that profile's grants and data scope. |
| **Data space** | A private or explicitly shared collection with defined members and actions. |

For the family desktop example, father, mother, and child should be able to use one enrolled node without each having to create a Tailnet or portal account. Each person's local session should map explicitly to a profile managed by that family cloud. A single shared Tailnet connection can provide network reachability, while the cloud's own signed membership policy decides which profile can use which service or data.

Start with these safety rules:

- Run file-reading agents under the OS account whose access they represent. Do not start with a privileged machine-wide agent that can read every home directory.
- Keep profile credentials, private agent memory, chat history, and indexes in OS-user-private storage. Do not reuse a shared token or database across profiles.
- Treat shared folders or libraries as explicit shared data spaces. Membership and actions are granted deliberately; a file being on the same computer does not make it family-shared.
- Apply source permissions to derived material too. Embeddings, thumbnails, summaries, and search snippets must not reveal content to a profile that cannot read the source.
- Preserve OS access controls as a lower bound. Merka grants cannot make a process read files the OS account cannot access.
- Make the acting profile visible in the UI and record the profile, node, action, scope, and policy version in security-relevant audit events.

One node-level network identity may serve several cloud-local profiles, but the node's network membership must not silently confer Owner authority or access to every profile's data. Conversely, a local OS login alone must not silently enroll a person into a cloud.

## 4. Desktop-first setup flow to design

1. **Start in the active OS account.** Explain that the computer is a node and this OS account is the initial local session. Do not scan every account's home directory.
2. **Create or join a cloud.** Generate the cloud identity locally; publish a signed public directory record without portal login. Offer a phone-pairing option for key custody and device enrollment. A cloud invitation is issued and accepted cryptographically by cloud members, not by portal accounts.
3. **Enroll the computer.** Bind a node key to the cloud and configure network connectivity. Tailnet setup should be a network step, not a requirement that every local family member authenticate separately.
4. **Map people to local profiles.** Provide an explicit, revocable invitation or approval flow for additional OS accounts, including children and people without Tailnet identities. Never auto-enroll based on OS username, email, or network presence.
5. **Choose content scopes.** Offer per-profile folders and separately selected shared locations. Show which profiles and agents can access each scope before indexing starts.
6. **Choose local capabilities.** Explain indexing, local inference, remote inference, sync, and their data-flow boundaries before enabling them.
7. **Verify and audit.** Show enrolled node/profile relationships, shared grants, active services, and recent security actions. Support removing a profile's access without revoking the whole computer's node identity.

The exact Owner-key bootstrap matters on every platform: the cloud authority key is generated locally and never sent to the directory. Secure storage, export, backup, recovery, and transfer between devices still need a cross-platform design.

## 5. Decisions still needed

1. Is a local Merka profile always tied to an OS account, or can multiple people switch profiles within one OS account?
2. How can an Owner invite a child or family member who has no Tailnet identity, and what credential unlocks that profile locally?
3. Should local services run once per OS login, or should a small machine service broker requests to per-user workers? The safer initial default is per-user workers; a privileged shared daemon needs a separate threat model.
4. What is the shared-data model: selected folders, Merka-managed libraries, or both? How are membership changes and offline revocation enforced?
5. How does cloud authority move between a desktop and mobile device, and what exact recovery guarantees apply?
6. Which local IPC and process-supervision design works consistently across all three desktop OSes?
7. Does the proposed Tauri shell meet UI consistency, accessibility, packaging, update, and native inference requirements?

These decisions should be settled before making the desktop onboarding flow or the current three-process-per-node topology normative for multi-user computers.

## References

- [Tauri 2 WebView versions](https://v2.tauri.app/reference/webview-versions/)
- [Tauri 2 capabilities and permissions](https://v2.tauri.app/security/capabilities/)
- [Tauri 2 sidecars](https://v2.tauri.app/develop/sidecar/)
- [Electron security](https://www.electronjs.org/docs/latest/tutorial/security)
- [Tailscale identity](https://tailscale.com/kb/1206/identity/)
