import "./style.css";

type View = "dashboard" | "welcome" | "cloud-choice";

const mount = document.querySelector<HTMLDivElement>("#app");

if (!mount) {
  throw new Error("Could not find the app mount point");
}

const app: HTMLDivElement = mount;

const mark = `
  <svg class="brand-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <circle cx="20" cy="14" r="8" />
    <circle cx="15" cy="22" r="8" />
    <circle cx="25" cy="22" r="8" />
    <circle cx="20" cy="20" r="15" />
  </svg>
`;

const artwork = `
  <div class="artwork" aria-hidden="true">
    <div class="artwork-glow"></div>
    <svg viewBox="0 0 360 360" fill="none">
      <circle class="orbit orbit-outer" cx="180" cy="180" r="151" />
      <circle class="orbit orbit-inner" cx="180" cy="180" r="126" />
      <path class="orbit-lines" d="M180 20v320M20 180h320M67 67l226 226M293 67 67 293" />
      <circle class="geometry" cx="180" cy="180" r="63" />
      <circle class="geometry" cx="180" cy="117" r="63" />
      <circle class="geometry" cx="235" cy="149" r="63" />
      <circle class="geometry" cx="235" cy="211" r="63" />
      <circle class="geometry" cx="180" cy="243" r="63" />
      <circle class="geometry" cx="125" cy="211" r="63" />
      <circle class="geometry" cx="125" cy="149" r="63" />
      <circle class="center-point" cx="180" cy="180" r="4" />
      <circle class="star" cx="180" cy="29" r="2" />
      <circle class="star" cx="306" cy="180" r="2" />
      <circle class="star" cx="54" cy="180" r="2" />
      <circle class="star" cx="180" cy="331" r="2" />
    </svg>
  </div>
`;

const views: Record<View, string> = {
  dashboard: `
    <section class="page dashboard" aria-labelledby="page-title">
      <div class="dashboard-heading">
        <div>
          <p class="eyebrow">YOUR SPACE, TOGETHER</p>
          <h1 id="page-title" tabindex="-1">Welcome to Merka.</h1>
          <p class="lead">A little more connection between your devices, and a little more room for what matters.</p>
        </div>
        <span class="preview-label">Early preview</span>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-content">
          <section class="overview" aria-labelledby="overview-title">
            <div class="section-header">
              <div>
                <p class="eyebrow">AT A GLANCE</p>
                <h2 id="overview-title">Your overview</h2>
              </div>
              <span class="status-label"><span aria-hidden="true"></span> Unavailable</span>
            </div>
            <p class="status-message">Cloud and computer status can't be checked yet in this preview.</p>
            <div class="overview-items">
              <div class="overview-item">
                <span class="item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><path d="M6.5 18h10.3a3.7 3.7 0 0 0 .4-7.4A5.5 5.5 0 0 0 6.7 9.3 4.4 4.4 0 0 0 6.5 18Z" /></svg>
                </span>
                <div><h3>Active cloud</h3><p>Not available yet</p></div>
              </div>
              <div class="overview-item">
                <span class="item-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="12" rx="2" /><path d="M8 20h8m-4-3.5V20" /></svg>
                </span>
                <div><h3>This computer</h3><p>Not available yet</p></div>
              </div>
            </div>
          </section>

          <section class="next-step" aria-labelledby="next-title">
            <div>
              <p class="eyebrow">A PLACE TO BEGIN</p>
              <h2 id="next-title">Get to know Merka</h2>
              <p>Explore how a Merka cloud brings your devices and information together.</p>
            </div>
            <button class="button button-primary" type="button" data-view="welcome">
              Getting started <span aria-hidden="true">→</span>
            </button>
          </section>

          <details class="more">
            <summary>More <span aria-hidden="true" class="chevron"></span></summary>
            <p>This preview doesn't yet check setup or manage clouds, devices, services, profiles, or updates.</p>
          </details>
        </div>
        <aside class="dashboard-art" aria-hidden="true">
          ${artwork}
          <p>YOUR DEVICES. YOUR SPACE.</p>
        </aside>
      </div>
    </section>
  `,
  welcome: `
    <section class="page wizard welcome" aria-labelledby="page-title">
      <div class="wizard-copy">
        <p class="eyebrow">GETTING STARTED <span aria-hidden="true"> / </span> 01</p>
        <h1 id="page-title" tabindex="-1">A little closer to <em>everything.</em></h1>
        <p class="lead">Welcome to Merka, a place for your devices and information to come together.</p>
        <button class="button button-primary" type="button" data-view="cloud-choice">
          Get started <span aria-hidden="true">→</span>
        </button>
        <p class="wizard-note">A preview of what's to come. No changes will be made.</p>
      </div>
      ${artwork}
    </section>
  `,
  "cloud-choice": `
    <section class="page wizard choice" aria-labelledby="page-title">
      <div class="choice-content">
        <p class="eyebrow">GETTING STARTED <span aria-hidden="true"> / </span> 02</p>
        <h1 id="page-title" tabindex="-1">Make space for your <em>cloud.</em></h1>
        <p class="lead">A Merka cloud brings your devices and information together, so they can work with you.</p>
        <div class="choice-list">
          <article class="choice-card">
            <div class="choice-icon" aria-hidden="true">＋</div>
            <div class="choice-description">
              <h2>Create a cloud</h2>
              <p>Start a new space for your devices and information.</p>
            </div>
            <button class="button button-secondary" type="button" disabled aria-describedby="create-availability">Create a cloud</button>
            <p class="availability" id="create-availability">Coming later</p>
          </article>
          <article class="choice-card">
            <div class="choice-icon" aria-hidden="true">↗</div>
            <div class="choice-description">
              <h2>Join a cloud</h2>
              <p>Connect to a cloud you've been invited to join.</p>
            </div>
            <button class="button button-secondary" type="button" disabled aria-describedby="join-availability">Join a cloud</button>
            <p class="availability" id="join-availability">Coming later</p>
          </article>
        </div>
        <button class="back-button" type="button" data-view="welcome"><span aria-hidden="true">←</span> Back</button>
      </div>
    </section>
  `,
};

function render(view: View, moveFocus = false): void {
  app.innerHTML = `
    <div class="shell">
      <header class="topbar">
        <div class="brand" aria-label="Merka cloud">
          ${mark}
          <span>merka<span class="brand-muted">.cloud</span></span>
        </div>
        <nav aria-label="Main navigation">
          <button class="home-button" type="button" data-view="dashboard" ${view === "dashboard" ? 'aria-current="page"' : ""}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m3.5 10 8.5-7 8.5 7M5.5 8.5V20h13V8.5M9.5 20v-6h5v6" /></svg>
            Home
          </button>
        </nav>
      </header>
      <main>${views[view]}</main>
      <footer><span>Made for your world.</span><span>MERKA DESKTOP <span aria-hidden="true">·</span> EARLY PREVIEW</span></footer>
    </div>
  `;

  if (moveFocus) {
    app.querySelector<HTMLElement>("#page-title")?.focus();
  }
}

app.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest<HTMLButtonElement>("button[data-view]");
  const view = button?.dataset.view;
  if (view === "dashboard" || view === "welcome" || view === "cloud-choice") {
    render(view, true);
  }
});

render("dashboard");
