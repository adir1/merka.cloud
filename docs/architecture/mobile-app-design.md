# Mobile app design

- **Status:** Initial product and interaction proposal, not an implementation specification or an approved change to the security architecture.
- **Scope:** An open-source iOS and Android MVP for a cloud Owner using a phone as the primary authority and as a client of their Merka cloud.
- **Sources:** [Security architecture](security.md), [platform overview](platform-overview.md), [desktop-first setup](desktop-first-setup.md), [ADR 0001](../decisions/0001-monorepo-foundation.md), the [mobile scaffold](../../apps/mobile/README.md), and the [approved cross-platform style guide](../design/style-guide.md). The guide's exact values are starting points, not a finalized brand palette.

## What is established

- Merka is local-first: files remain on their devices, under their OS permissions. A cloud's signed policy and member context govern access; Tailnet provides connectivity, not Merka authorization.
- The mobile Cloud Authority signs cloud genesis, device leases and cloud-wide policy decisions. Authority operations require Owner confirmation and device authentication as specified in the security architecture. Hardware-backed custody, algorithms, backup and recovery need validation on each platform.
- Pairing requires proof of possession of the device key and an exact match against an authorized Tailnet identity in the same session. A QR code alone is not proof. Failure or unavailable verification leaves enrollment pending.
- Desktop-originated policy changes can be provisional on that desktop only. Approval must bind the exact change and base policy; peers verify signatures and policy history, not just CRDT convergence.
- Leases default to 30 days, with renewal beginning seven days before expiry in an available app session. Revocation reaches each peer only when it receives the signed record; a disconnected peer may accept an otherwise valid lease until expiry. Tailnet removal is a separate follow-up.
- The portal is a public discovery directory, not an account provider or policy authority. Cloud administration requires no portal login.
- The mobile app is an Expo development-build scaffold with React Native and `llama.rn`; it does not yet implement enrollment, networking, sync, model lifecycle or inference. `@merka/core` contains preliminary types, not finalized transport or authorization contracts.

## MVP proposal

The first useful release should let an Owner create a cloud on a phone, enroll one desktop, ask the connected agent a text question, and review or revoke access without a hosted Merka account. This is a proposed vertical slice, not a claim that the necessary services exist. It should work with self-hosted, open-source components and must not depend on paid inference or a proprietary hosted backend. Tailnet and platform dependencies still need an explicit open-source distribution and self-hosting review.

| Include in the first usable slice | Defer |
| --- | --- |
| Cloud creation and explicit recovery readiness; one verified desktop pairing; a device list and revocation | Automatic device discovery, multi-cloud federation and sophisticated member administration |
| Text conversation with an authorized reachable agent, and clear connection/error states | Voice, background conversations, attachments and local model downloads/inference |
| Review and approve or reject desktop policy proposals, including conflict handling | A general policy editor or extension marketplace |
| Basic source/device attribution when available and truthful partial/unavailable results | Advanced search, full file browsing, indexing configuration and audit analytics |
| Accessible iOS/Android UI and an app-session-based refresh | Push delivery, silent signing and background availability guarantees |

This slice depends on the security protocols, node transport, policy journal and agent endpoints being designed and implemented first. In particular, a mock conversation or mock pairing must be visibly labeled as a prototype and must never issue real authority credentials. Do not ship a reduced-verification pairing or pretend recovery works to meet the MVP.

## Navigation and screen sketches

These are interaction proposals, applying the approved guide below. Use a single cloud context prominently and expose the Owner/authority status without equating a device with a person. Four primary destinations avoid making device administration the only purpose of the app:

1. **Home** — cloud name, connection status, a short action list (pending approvals, renewal or recovery attention), and a primary route to the agent. Empty state explains how to add the first device.
2. **Ask** — text conversation, current connection/agent target, composer and response attribution. Show when the target is unreachable, a response is incomplete, or a request failed; do not imply that missing nodes were searched. A draft can remain on the device, but sending while offline is disabled unless a safe queue is explicitly designed.
3. **Devices** — enrolled devices with last verified state and lease expiry, plus **Add device**. Detail shows capabilities, lease status, last known connectivity and **Revoke device**. Unknown connectivity is not removal.
4. **Activity** — pending decisions and their outcomes. A proposal detail shows originating device and administrator, affected profiles and scopes, exact before/after values and base policy. It distinguishes local provisional effects from cloud-wide effects and provides explicit **Approve** and **Reject** actions.

Cloud settings, recovery readiness and authority-device information are available from Home. Avoid destructive actions in primary navigation. Never show private snippets or derived summaries in a different member context.

### Mobile presentation

The approved direction is calm, spacious and welcoming: deep midnight surfaces with warm gold emphasis, restrained cool highlights and a subtle halo where useful. Avoid lime, clutter and enterprise-only or child-specific metaphors. For an initial dark mockup, the guide suggests background `#101318`, surface `#181C22`, primary text `#E7EAF0`, secondary text `#A2A8B2`, accent `#E9B95C`, and on-accent text `#172111`. These are candidate roles, not locked mobile tokens. The guide's `#292F38` decorative border is not sufficient as an essential control boundary; define and test control and focus colors separately. Semantic warning, success and error treatments and a light theme remain to be designed and contrast-tested.

Use readable platform sans-serif text with a clear hierarchy and comfortable spacing; technical identifiers may use monospace. Any expressive title type or layered clouds, celestial geometry and glow are optional decoration, especially for onboarding, not a background behind body copy. Respect different cultures and avoid mainstream religious symbols or suggesting preference for any belief. Every state has a text label, not just color or animation. Press feedback acknowledges input, not completion; motion must not delay interaction and should be reduced or removed when requested.

Proposed phone layouts, top to bottom:

| Screen | Main content and primary action |
| --- | --- |
| Welcome | Optional quiet sky illustration; “Your devices, your cloud”; brief local-first explanation; **Create a cloud** and **Join a cloud**. If joining is unavailable, identify it as not yet available rather than offering a nonfunctional action. |
| Home | Cloud name and authority status; labeled connection state; urgent recovery or approval card when applicable; **Ask your agent**; compact device summary. Persistent navigation sits within the safe area. |
| Ask | Target and connection status; scrollable conversation with labeled source and partial-result state when provided; multiline composer and **Send** above the keyboard. |
| Devices | **Add device**, then named device rows with a text status and lease expiry. Device detail keeps **Revoke device** separate from routine information. |
| Activity | Pending review count and proposal rows; detail places source, affected scopes and before/after change ahead of **Approve** and **Reject**, with sync status after signing. |

Use the guide's progressive disclosure as a proposal: show the essentials first and reveal technical IDs, policy base and verification evidence through labeled details, without concealing the exact change, affected scopes, critical warnings or any approval context. Basic/Intermediate/Advanced are presentation levels, not permissions; do not require a global level selector for the MVP.

## Key journeys and states

### First run

1. Explain local-first operation, the authority phone's role and the separation between Merka and Tailnet. Offer **Create a cloud** and **Join a cloud**; joining as an additional phone is a later journey unless its verification and authority model are ready.
2. On creation, generate the authority key locally through a validated platform-specific path. Explain the effect of losing the device and show recovery readiness before completing setup. Never upload the private authority key to the directory.
3. Introduce the requirement for pre-approved recovery devices and quorum; until recovery is configured, show a persistent **Recovery not configured** warning and do not imply the cloud is recoverable. The exact bootstrap and recovery setup flow are unresolved, and a production MVP must resolve them before claiming safe recovery.
4. Offer to add a desktop, or continue to an honest empty Home. A directory publication failure is separate from local cloud creation: report its actual state and do not claim the cloud is discoverable.

### Add a desktop

1. Explain that the desktop must join the intended Tailnet first and display its enrollment QR. Ask for camera access only when scanning; provide a way to retry after denial. A manual pairing route requires the same security checks and is not assumed to exist.
2. Scan a request, establish a live pairing session and verify possession and the exact Tailnet node identity. While checking, show **Verifying**; on unavailable or failed verification, show **Not verified**, explain the next action and keep enrollment pending.
3. Show the verified node name, identity and requested capabilities. The Owner confirms the exact device, authenticates on the phone and signs its lease. Cancellation, expired sessions, failed authentication or failed delivery must not be presented as successful enrollment.
4. Show **Lease issued, delivery pending** separately from the desktop's confirmed receipt. Only show **Enrolled** when verified acknowledgement is available. If connectivity is lost, allow retry without inventing a new approval or silently changing the requested capabilities.

### Review a policy proposal

1. List pending proposals without treating a notification or receipt as approval. Show the originating desktop and that changes are provisional there only.
2. Verify the proposal signature, device lease and revocation status, administrator authorization and base policy before enabling a decision. Show exact old and new values and affected scopes.
3. On approval or rejection, require explicit confirmation and device authentication, then sign the decision bound to the exact proposal and base policy. Show **Signed; sync pending** until delivery is confirmed; do not represent a signed decision as applied everywhere.
4. If the base changed or a conflict is detected, disable the old approval and require a rebased proposal and a fresh review. For invalid or unverifiable proposals, show a reason and do not enable approval.

### Revoke and follow up

1. Explain that revocation stops future authorized access only as peers receive the signed record or the existing lease expires; it cannot recall data already obtained. Authenticate and confirm before signing.
2. Show separate states for signed revocation, propagation/acknowledgements where known, and Tailnet removal. Do not wait for Tailnet removal to revoke Merka access.
3. Keep the Tailnet action outstanding until an authorized reliable source verifies removal or restriction. An offline device or failed lookup is **unknown**, never proof of removal.

### Offline and interrupted operation

Keep last verified state visibly timestamped and distinguish offline, expired, pending verification and rejected. Do not claim global synchronization from a single peer's acknowledgement. Authority approval and lease renewal occur during available app sessions; no silent signing or push delivery is assumed. An interrupted or expired pairing starts a fresh verified session rather than reusing stale identity evidence.

## Accessibility and platform behavior

Use native safe areas, keyboard avoidance and platform screen-reader semantics. Provide meaningful labels, focus order and announced state changes; controls must be reachable without color, gestures or camera alone where a secure equivalent exists. Aim for at least 44 by 44 logical points for touch targets where feasible, and validate equivalent native accessibility principles, including 4.5:1 normal-text contrast and 3:1 necessary non-text contrast. Support scalable text, reflow, localization including right-to-left layouts, light and dark system preferences, and reduced motion; avoid clipping or hiding security details at large text sizes. Keep destructive and approval controls clearly named and separately confirmed. Validate these behaviors on both platforms with assistive technology and real devices; this proposal does not assert conformance.

## Dependencies and unresolved decisions

1. Define and validate iOS/Android authority signing and custody, including supported algorithms, authentication, backup, handover and the interaction with the adopted Ed25519 lease format.
2. Design a usable recovery-device enrollment and quorum bootstrap, including what happens if recovery is not configured or all recovery devices are lost.
3. Specify authenticated pairing transport, session expiry, authorized Tailnet identity lookup, acknowledgements and retry/idempotency behavior.
4. Define versioned policy, lease, journal and agent request/response contracts, authorization enforcement and trustworthy attribution/partial-result signals.
5. Decide whether and how the mobile client receives cloud state and targets an agent under mobile OS networking and lifecycle constraints; do not assume it runs the desktop three-process topology.
6. Define directory publication and first-contact verification, local data retention, profile switching and notification privacy before introducing those capabilities.
7. Verify distribution and licensing of the selected dependencies and establish an entirely self-hostable MVP path; distinguish mandatory third-party network access from optional services.
