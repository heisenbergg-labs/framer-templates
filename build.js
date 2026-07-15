// Zero-dependency static build: templates.json -> dist/
// Usage: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));
const { site, templates, components } = data;

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;500&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const page = ({ title, description, body, root = "." }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
${FONTS}
<link rel="stylesheet" href="${root}/style.css">
</head>
<body>
<nav><div class="wrap">
  <a class="wordmark" href="${root}/index.html">carmy<sup>®</sup></a>
  <div class="links">
    <a href="${root}/index.html#templates">TEMPLATES</a>
    <a href="${root}/index.html#components">COMPONENTS</a>
    <a class="pill" href="mailto:${site.contact}?subject=${encodeURIComponent("Hello Carmy")}">GET IN TOUCH</a>
  </div>
</div></nav>
${body}
<footer><div class="wrap">
  <span class="mono-sm">© 2026 CARMY STUDIO®</span>
  <a class="mono-sm" href="${site.handleUrl}" target="_blank" rel="noreferrer">${esc(site.handle.toUpperCase())}</a>
  <span class="mono-sm">COOKED IN FRAMER — SERVED FROM GITHUB</span>
</div></footer>
<script>
// progressive reveal: content is visible by default; animation only when JS + IO are healthy
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
  document.querySelectorAll(".reveal").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) { el.classList.add("in"); return; }
    el.classList.add("pre");
    io.observe(el);
  });
}
const sw = document.getElementById("free-switch");
if (sw) {
  sw.addEventListener("click", () => {
    sw.classList.toggle("on");
    const freeOnly = sw.classList.contains("on");
    document.querySelectorAll("[data-free]").forEach(c => {
      c.style.display = (!freeOnly || c.dataset.free === "true") ? "" : "none";
    });
  });
}
</script>
</body>
</html>`;

const tcard = (t, root = ".") => `
<a class="tcard reveal" data-free="${t.free}" href="${root}/templates/${t.slug}/index.html">
  <div class="frame"><div class="shot"><img src="${root}/${t.cover}" alt="${esc(t.name)} — Framer template preview" loading="lazy"></div></div>
  <div class="meta">
    <h3>${esc(t.name)}${t.new ? ' <span class="badge">New</span>' : ""}${t.status === "soon" ? ' <span class="badge soon">Soon</span>' : ""}</h3>
    <span class="catprice">${esc(t.category)} · <b>${esc(t.price)}</b></span>
  </div>
</a>`;

/* ---------------- home ---------------- */
const home = page({
  title: site.title,
  description: site.description,
  body: `
<header>
  <p class="eyebrow mono"><span class="dot">◐</span> PREMIUM FRAMER TEMPLATES BY CARMY STUDIO</p>
  <h1>Framer templates<br><em>built with taste</em></h1>
  <p class="statement">Remix, customise, and launch your site in days, not months. Every template fully editable, no code required.</p>
  <div class="ctas">
    <a class="pill lg" href="#templates">Browse templates</a>
    <a class="textlink" href="mailto:${site.contact}?subject=${encodeURIComponent("Help me pick a template")}">Not sure which? Ask us →</a>
  </div>
</header>

<section id="templates"><div class="wrap">
  <div class="head">
    <div>
      <p class="mono">/01 — TEMPLATES</p>
      <h2>Pick your template</h2>
    </div>
    <div class="toggle-row">
      <span class="mono-sm">FREE ONLY</span>
      <div class="switch" id="free-switch" role="switch" aria-label="Show free templates only"></div>
    </div>
  </div>
  <div class="grid">
    ${templates.map(t => tcard(t)).join("\n")}
  </div>
</div></section>

<section id="components"><div class="wrap">
  <div class="head">
    <div>
      <p class="mono">/02 — COMPONENTS</p>
      <h2>Motion components, $5 each</h2>
    </div>
    <span class="mono-sm">DROP INTO ANY FRAMER SITE</span>
  </div>
  <div class="comp-grid">
    ${components.map(c => `
    <a class="comp reveal" href="${c.get}" target="_blank" rel="noreferrer">
      <span class="price-tag">${esc(c.price)}</span>
      <h3>${esc(c.name)}</h3>
      <p>${esc(c.tagline)}</p>
    </a>`).join("\n")}
  </div>
</div></section>

<section><div class="wrap">
  <div class="head">
    <div>
      <p class="mono">/03 — WHY CARMY</p>
      <h2>Premium site, without the premium invoice</h2>
    </div>
  </div>
  <div class="props">
    <div class="prop reveal"><div class="k">Live in days</div><p>Remix, swap your content, publish. No agency timelines, no handoffs.</p></div>
    <div class="prop reveal"><div class="k">Looks expensive</div><p>Editorial type, real motion, considered details — design that reads like the higher standard.</p></div>
    <div class="prop reveal"><div class="k">Fully editable</div><p>Native Framer layers. Every image swappable, every word yours, no code anywhere.</p></div>
    <div class="prop reveal"><div class="k">Built to convert</div><p>Clear structure, working forms, CTAs where they belong. Pretty and practical.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="head">
    <div>
      <p class="mono">/04 — HOW IT WORKS</p>
      <h2>Three steps to your new site</h2>
    </div>
  </div>
  <div class="steps">
    <div class="step reveal"><div class="num">01</div><h3>Choose a template</h3><p>Preview it live, then grab it from the Framer Marketplace with one click.</p></div>
    <div class="step reveal"><div class="num">02</div><h3>Customise it</h3><p>Swap the words, images and colours right in Framer. It stays beautiful while you do.</p></div>
    <div class="step reveal"><div class="num">03</div><h3>Publish it</h3><p>Hit publish and your site is live. Connect your domain whenever you're ready.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="studio-note reveal">
    <p class="mono" style="margin-bottom:14px">/05 — THE STUDIO</p>
    <h2>Made by Carmy Studio</h2>
    <p>An independent design &amp; development studio building unreasonably crafted websites on Framer. Follow the work at <a href="${site.handleUrl}" target="_blank" rel="noreferrer">${esc(site.handle)}</a>.</p>
  </div>
</div></section>

<section><div class="wrap">
  <div class="cta-band reveal">
    <h2>Want it custom?</h2>
    <p>We also take a small number of client builds. Tell us what you're making.</p>
    <a class="pill lg" href="mailto:${site.contact}?subject=${encodeURIComponent("Project inquiry — Carmy Studio")}">START A PROJECT</a>
  </div>
</div></section>`,
});

/* ---------------- detail pages ---------------- */
const detail = (t) => {
  const related = templates.filter(x => x.slug !== t.slug).slice(0, 2);
  return page({
    title: `${t.name} — ${t.category} Framer Template | Carmy`,
    description: t.description,
    root: "../..",
    body: `
<div class="wrap crumb mono-sm"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <a href="../../index.html#templates">Templates</a> &nbsp;/&nbsp; ${esc(t.name)}</div>
<div class="wrap detail">
  <div class="gallery reveal in">
    <div class="main"><img src="../../${t.cover}" alt="${esc(t.name)} — Framer template preview"></div>
  </div>
  <div class="info">
    <p class="cat mono">${esc(t.category.toUpperCase())} TEMPLATE FOR FRAMER${t.new ? ' — <span class="badge">New</span>' : ""}</p>
    <h1>${esc(t.tagline)}</h1>
    <div class="price-row">
      <span class="price">${esc(t.price)}</span>
      ${t.free ? '<span class="vs">free forever</span>' : '<span class="vs">vs $2,000+ for a designer</span>'}
    </div>
    <p class="desc">${esc(t.description)}</p>
    <div class="actions">
      <a class="btn-primary" href="${t.get}" target="_blank" rel="noreferrer">${t.free ? "Use for free" : "Get this template"}</a>
      <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Preview live demo</a>
    </div>
  </div>
</div>
<section style="padding-top:0"><div class="wrap">
  <div class="head">
    <div><p class="mono">MORE TEMPLATES</p></div>
  </div>
  <div class="grid">
    ${related.map(r => tcard(r, "../..")).join("\n")}
  </div>
</div></section>`,
  });
};

/* ---------------- write dist ---------------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets", "covers"), { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), home);
fs.writeFileSync(path.join(DIST, "style.css"), fs.readFileSync(path.join(ROOT, "src", "style.css")));
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
for (const f of fs.readdirSync(path.join(ROOT, "assets", "covers"))) {
  fs.copyFileSync(path.join(ROOT, "assets", "covers", f), path.join(DIST, "assets", "covers", f));
}
for (const t of templates) {
  const dir = path.join(DIST, "templates", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detail(t));
}
console.log("built:", ["index.html", ...templates.map(t => `templates/${t.slug}/`)].join(", "));
