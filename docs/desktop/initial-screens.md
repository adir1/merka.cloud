# Desktop initial screens

**Status: draft MVP specification.** The Tauri desktop app has a visual
preview of the Dashboard, welcome, and cloud choice screens. It opens on the
Dashboard and reports setup status as unavailable because no status source is
implemented. Cloud setup, enrollment, and service management are not
implemented. Visual presentation follows the
[approved cross-platform style guide](../design/style-guide.md).

## Flow and scope

**Dashboard is the home screen.** A **Home** button remains available in a
consistent location throughout the desktop UI, including during wizards, and
returns the user to Dashboard. How an in-progress wizard is handled when
leaving it remains to be decided.

The hybrid flow gives a first-time user a guided welcome and a returning user
a simple Dashboard overview. Wizards use full-page views, not popups over the
Dashboard; the consistent Home button remains available. Getting Started is
the first of potentially several wizards. Its welcome has one primary
**Get started** action, followed by a short explanation and a choice to
create or join a cloud. The Dashboard keeps a few essentials and a next
action visible, with secondary details under **More**.

The screen behavior below is a proposed starting point for discussion.
Exact copy, data sources, and the condition for recognizing a returning user
remain open. Do not equate an app launch, an OS login, or a reachable device
with completed setup or authorization.

## 1. Getting Started: welcome

**Purpose:** Give a new user a calm introduction and one clear next step.

- In the full-page wizard view, show the Merka identity, a brief welcoming
  sentence, and **Get started** as the single primary action. Keep the
  consistent **Home** button visible; any illustration or geometry is
  optional decoration.
- Selecting **Get started** opens the cloud choice screen. It does not create
  a cloud, enroll a device, or change settings.
- If setup state cannot be determined, show an understandable unavailable
  state and a retry action when a status source exists, rather than assuming
  the user is new or returning. The preview has no status source to retry.

## 2. Getting Started: create or join

**Purpose:** Briefly explain a Merka cloud and offer the two setup paths.

- Show a concise explanation that a cloud brings a person's Merka devices and
  information together. Present **Create a cloud** and **Join a cloud** as
  equally clear choices in the full-page wizard, with brief descriptions;
  provide **Back** to return to Welcome and keep **Home** visible.
- Each choice leads to its respective setup flow once that flow is specified
  and implemented. Selecting a choice alone must not create or join a cloud.
  Until a path works, label it as unavailable or coming later rather than
  simulating success.
- If a later setup step is cancelled or fails, preserve any safely retained
  progress and make the result and next step clear. Exact resume and recovery
  behavior needs to be defined with the implementation.

## 3. Dashboard (home)

**Purpose:** Give the user a quick understanding of the current state and the
most useful next action without a crowded dashboard, including when returning
home from a wizard before setup is complete.

- Show a compact overview of the active cloud and this computer, plus one
  context-appropriate next action. Use actual available information, not
  placeholder success states. Exact fields and action priority are open.
- Put secondary details and less frequent actions behind a clearly labeled
  **More** control. Keep important status, necessary context, and critical
  messages visible. Expanding and collapsing More must work with keyboard
  and assistive technology.
- **Loading:** indicate that the overview is being checked without blocking
  the rest of the interface unnecessarily.
- **Ready:** display only verified information and offer an applicable next
  action. An online network alone does not establish cloud membership or
  access.
- **Incomplete setup:** show the relevant next step when known. The exact
  route for resuming setup remains open.
- **Offline or unavailable:** identify what cannot be checked and offer a
  retry where useful; do not describe an unknown state as healthy or failed.
- **Error:** explain the problem and a useful next step without displaying
  sensitive details. Do not hide an important error under More.

The proposed Basic, Intermediate, and Advanced presentation levels in the
style guide are not implemented or required to build these first screens.
Start with a focused Basic-style layout and use More for secondary detail.

## Boundaries and decisions before functional setup

- The desktop app is a local control plane; keep service work in its existing
  processes and use narrow, authenticated local IPC for lifecycle operations,
  not general shell or filesystem access. See
  [desktop-first setup](../architecture/desktop-first-setup.md).
- Cloud creation, joining, and device enrollment require their real trust
  flows, not a visual-only success. The desktop-first proposal permits
  desktop-originated cloud creation, while the
  [security architecture](../architecture/security.md) anchors cloud
  authority in mobile devices. Reconcile custody and bootstrap before
  implementing that path.
- Decide what reliably distinguishes first run, incomplete setup, and a
  returning user, and what to show when that state cannot be read.
- Decide what happens to progress when the user selects Home during a wizard
  and how an interrupted wizard can be resumed.
- Define the create/join steps, their prerequisites, cancellation and resume
  behavior, and the overview's actual data and next-action rules as those
  capabilities are designed. These questions do not block a visual prototype
  that clearly identifies unavailable functionality.
