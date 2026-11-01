import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");

if (!app) {
  throw new Error("Could not find the app mount point");
}

app.innerHTML = `
  <main class="shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Merka Desktop home">
        <span class="brand-mark" aria-hidden="true">M</span>
        <span>merka<span class="brand-muted">.cloud</span></span>
      </a>
      <span class="environment"><span class="status-dot"></span> Desktop setup</span>
    </header>

    <section class="intro" aria-labelledby="page-title">
      <p class="eyebrow">LOCAL CONTROL PLANE</p>
      <h1 id="page-title">Your services,<br /><span>in sync.</span></h1>
      <p class="summary">
        Configure Merka services for this computer and the people who use it.
        Your data and services stay under their respective OS-user permissions.
      </p>
    </section>

    <section class="setup" aria-labelledby="setup-title">
      <div class="section-heading">
        <div>
          <p class="eyebrow">SETUP OVERVIEW</p>
          <h2 id="setup-title">Desktop setup</h2>
        </div>
        <span class="scaffold-badge">SCAFFOLD</span>
      </div>

      <div class="capabilities">
        <article class="capability">
          <span class="capability-icon" aria-hidden="true">01</span>
          <div>
            <h3>Runtime &amp; services</h3>
            <p>Install and verify Bun services for this OS account.</p>
          </div>
          <span class="planned">Planned</span>
        </article>
        <article class="capability">
          <span class="capability-icon" aria-hidden="true">02</span>
          <div>
            <h3>People &amp; profiles</h3>
            <p>Choose which local profiles can access each service.</p>
          </div>
          <span class="planned">Planned</span>
        </article>
        <article class="capability">
          <span class="capability-icon" aria-hidden="true">03</span>
          <div>
            <h3>Software updates</h3>
            <p>Keep this app and its managed Bun services current.</p>
          </div>
          <span class="planned">Planned</span>
        </article>
        <article class="capability">
          <span class="capability-icon" aria-hidden="true">04</span>
          <div>
            <h3>Extensions</h3>
            <p>Extend service capabilities through a trusted lifecycle.</p>
          </div>
          <span class="planned">Future</span>
        </article>
      </div>

      <p class="notice">
        This is an early desktop scaffold. It does not yet install or manage
        services, profiles, updates, or extensions.
      </p>
    </section>

    <footer>
      <span>Merka Desktop <span class="version">· 0.1.0</span></span>
      <span>Local-first, profile-aware by design</span>
    </footer>
  </main>
`;
