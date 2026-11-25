# Merka cross-platform style guide

**Status: approved visual direction.** This guide directs the Tauri desktop UI
and later mobile, dashboard, and public website work. Exact color values,
components, and implementation details remain starting points to refine as
the product is built. Approval is not a claim that current interfaces meet
these guidelines. It covers visual presentation and interaction, not product
features, security policy, or file layout. A coordinator reviewed the 14 visual
references in `docs/design/ideas/` in the primary checkout and supplied the observations
below; this worktree session could not inspect the images directly. The warm
gold direction was selected from a visual comparison; the exact values below
remain starting points and were not sampled from the reference images.

## Reference direction

Layered clouds and starry, cosmic skies in deep midnight navy, blue, and teal,
with warm gold, amber, and cream light contrasted against cyan and teal glows.
A luminous central focal point, depth,
and openness create a calm, aspirational atmosphere. Fine, symmetrical
interlocking-circle, flower, and seed geometry appears alongside occasional
angular wireframes, stars, and connected points. Some images are colorful and
painterly, with coral, violet, and rainbow tones; others use restrained gold
and dark blue.

Translate this direction into a quiet, spacious interface with deep
surfaces, glowing golden accents, and restrained cool highlights. Do not
reproduce every motif or color in everyday controls. Reserve layered skies,
glows, and geometry for optional, nonessential decoration such as
illustrations or onboarding; keep functional surfaces clear and readable.
Geometric symbolism can carry cultural or spiritual associations. Avoid
mainstream religious symbols; draw sparingly and thoughtfully on subtle,
esoteric elements from various traditions, without suggesting that any
belief receives preferential treatment.

## Design intent

Merka helps people work with their own devices and information. It should feel
calm, welcoming, capable, and trustworthy without looking exclusively like
enterprise administration software or a children's product. Design for a
wide range of ages, abilities, languages, technical experience, households,
and organizations. Do not assume a particular family structure, profession,
device ownership, or level of expertise.

- **Keep the focus.** Give each screen a clear purpose, a few prominent
  elements, and a visible next step. Reveal supporting detail on request.
- **Feel lively and responsive.** Use quick feedback and a touch of playful
  motion without slowing navigation or distracting from the task.
- **Make states clear.** Use readable labels and distinct visual treatments
  for loading, success, and errors; never rely on color alone.
- **Be consistent, not identical.** Share visual roles, language, and interaction
  principles across platforms while respecting native conventions and input
  methods.

## Color and surfaces

Use semantic roles rather than hard-coding meaning into a particular color:
background, surface, primary and secondary text, accent, focus, border, and
informational, success, warning, and error states. An accent is not inherently
a success indicator. Pair every meaningful status with text and, where useful,
an icon; do not rely on color alone.

The selected direction is **warm gold without lime**, with a little more glow
where practical. The existing desktop scaffold still uses lime; this guide
does not change its implementation. The following dark palette is a starting
point for desktop work, not a final brand palette. The gold value is a
candidate used for the comparison, not an exact color sampled from the image:

| Role | Value | Intended use |
| --- | --- | --- |
| Background | `#101318` | Main canvas |
| Surface | `#181C22` | Opaque cards and panels |
| Primary text | `#E7EAF0` | Main text on background or surface |
| Secondary text | `#A2A8B2` | Supporting text on background or surface |
| Accent | `#E9B95C` | Golden emphasis, links, or a solid action surface |
| On accent | `#172111` | Text on the solid accent |
| Decorative border | `#292F38` | Subtle division only, not a control boundary |

These opaque text/surface pairings have at least 7:1 contrast; the decorative
border does **not** have enough contrast to identify an essential control.
Choose and test a separate higher-contrast boundary wherever a border is
necessary to identify a control or its state. Test focus indicators against
adjacent colors as rendered, including on accent-filled controls. Gradients,
transparency, images, hover and disabled treatments can change effective
contrast; do not assume the table validates those combinations.

Give gold accents a soft, warm halo where it adds atmosphere, such as around
primary actions or decorative highlights. Keep it subtle around dense content;
do not place glow behind body text or rely on it as the only focus or status
indicator. Controls and focus indicators must remain clear without the glow,
including in high-contrast modes. Avoid flashing, keep any animated glow
gentle, and respect reduced-motion settings.

Support both light and dark appearances in future UI work. Respect the system
preference and allow an accessible override where appropriate; neither theme
is a proxy for accessibility. Light-theme roles, semantic status colors and
their pairings remain to be designed and tested. Avoid encoding the palette as
shared platform-specific CSS: translate the same semantic roles into each
platform's token system once those tokens are agreed.

## Typography, layout, and imagery

- Prefer readable, familiar sans-serif type with platform-appropriate
  fallbacks. Use monospace for actual technical values, not ordinary labels
  or long explanations. Do not depend on a particular installed font.
- Establish a restrained hierarchy with clear headings, readable body text,
  comfortable line height, and consistent spacing. Support text enlargement,
  translation, long names, and reflow without clipping or losing functionality.
- Use a small, consistent spacing and corner-radius scale once defined. Give
  related controls space to breathe; adapt density to the task and screen
  rather than shrinking text. Keep complex settings organized in manageable
  sections.
- Let geometry and the golden ratio inspire spacing and proportions between
  UI elements where they create a pleasing hierarchy. Treat them as flexible
  guides, not exact rules; readability, accessibility, and responsive layouts
  come first.
- Use simple, recognizable icons with visible labels for important actions.
  Treat icons, illustrations, and decorative effects as supporting content,
  not the only way to understand a feature. Avoid imagery or metaphors that
  presume a household, industry, culture, or ability.
- Use motion to add personality and clarify changes, not to convey required
  information. Respect reduced-motion settings and avoid flashing or
  distracting animation.
- Consider more luxurious, Victorian-inspired fonts for larger titles where
  appropriate; keep smaller text simpler for readability.

## Accessibility and inclusive interaction

Target **WCAG 2.2 AA** for applicable web and desktop UI, and apply equivalent
accessibility principles to native mobile surfaces. Verify with real platform
assistive technology; these guidelines alone do not establish conformance.

- Meet at least 4.5:1 contrast for normal text and 3:1 for large text and
  necessary non-text UI indicators against adjacent colors. Do not convey
  meaning solely through color, position, shape, or sound.
- Make all actions operable with a keyboard and assistive technologies, with
  logical focus order, visible focus, meaningful names and roles, and announced
  errors and status changes. Preserve native screen-reader and OS accessibility
  behavior.
- Meet WCAG 2.2 target-size requirements, including its exceptions; aim for
  at least 44 by 44 CSS pixels for touch targets where feasible. Provide
  adequate spacing and do not require precision gestures, dragging, hover, or
  a mouse as the only way to complete a task.
- Support zoom, larger system text, reflow, high-contrast or forced-colors
  modes, reduced motion, and both light and dark system preferences. Avoid
  fixed-height text containers and layout that requires horizontal scrolling
  for ordinary content.
- Use explicit labels, helpful examples, and actionable error messages. Don't
  use placeholders as labels. Support localization, including text expansion
  and right-to-left layouts, without embedding culturally specific assumptions.

## Visual interactions

- **A few clear focal points:** give the primary action and most useful
  information the strongest visual weight. Group related details and use
  whitespace, size, and contrast to guide the eye. Avoid competing accents and
  crowded dashboards.
- **Quick and playful:** make controls respond immediately to hover, press,
  focus, and selection. Use small, brief changes in color, glow, or position
  to make interactions feel lively. Feedback should acknowledge input without
  implying an operation has completed.
- **Fast to navigate:** keep common actions close and navigation predictable.
  Avoid long animations or unnecessary interruptions; show useful progress
  feedback when work takes time. Transitions should never delay interaction.
- **Reveal on demand:** use a clearly labeled three-dot menu or a “More” or
  expandable section for secondary actions and details. Keep important actions,
  essential context, and critical messages visible instead of hiding them.
  Disclosure controls must work with keyboard, touch, and screen readers.
- **Comfortable motion:** respect reduced-motion preferences by replacing
  movement with immediate or subtle non-moving feedback. Avoid flashing and
  never make motion necessary to understand or use an interaction.

## Proposed presentation levels

Basic, Intermediate, and Advanced are a **proposed presentation pattern**, not
implemented application states. They provide a consistent way to introduce
complexity gradually across screens without defining which product features
belong on any particular screen.

| Level | Presentation |
| --- | --- |
| **Basic** | Start with a small number of prominent, commonly useful elements and simple labels. |
| **Intermediate** | Reveal more contextual details and secondary controls while retaining the same familiar layout. |
| **Advanced** | Make additional detail and fine-grained controls available without overwhelming the main view. |

Let people move between levels at their own pace, starting with Basic, and make
the current level and how to change it easy to find. Keep essential context,
critical messages, and accessible navigation available at every level. These
levels are about presentation, not permissions or separate user identities;
their exact controls and persistence can be decided when the pattern is built.

## Platform adaptation

- **Desktop:** support mouse, keyboard, screen readers, resizable windows and
  native window behavior on Windows, macOS, and Linux. Validate rendering and
  accessibility in each Tauri system WebView rather than assuming parity.
- **Mobile:** prioritize touch, small screens, system text scaling, safe areas,
  and native navigation and accessibility conventions.
- **Web and dashboard:** support responsive layouts, browser zoom, keyboard
  navigation and standard browser behavior. The public website may have a
  more expressive presentation, but should use the same accessible brand
  roles and clear language as product interfaces.

## Practical MVP priorities

- **Accent direction:** use warm gold rather than the scaffold's lime, with a
  soft glow where it helps. Refine the exact shade and effect as the desktop UI
  is built; they need not block initial work.
- **For each screen being built:** reuse a small set of color and spacing
  values, keep text and controls legible, check contrast and keyboard focus,
  and keep the main view focused. Check screen-reader behavior and
  the target platform as interactions are added.
- **Presentation levels:** try the disclosure pattern on an actual screen
  before deciding how broadly to apply it; it does not block the first UI.

A comprehensive token system, refined light theme, broader cross-platform
component library, and wider usability studies can grow alongside the product;
they are not prerequisites for starting the desktop MVP.
