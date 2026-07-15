// Zero-dependency static build: templates.json -> dist/
// Usage: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));
const { site, templates, components } = data;

// optional AI art (drop files into assets/art/: triangle.png|jpg, sphere, torus, slab)
const findArt = (name) => {
  for (const ext of ["png", "jpg", "webp"]) {
    if (fs.existsSync(path.join(ROOT, "assets", "art", name + "." + ext))) return "assets/art/" + name + "." + ext;
  }
  return null;
};
const ART = { triangle: findArt("triangle"), sphere: findArt("sphere"), torus: findArt("torus"), slab: findArt("slab") };

// free first, then paid cheapest-first
const sorted = [...templates].sort((a, b) => {
  if (a.free !== b.free) return a.free ? -1 : 1;
  const pa = parseInt(String(a.price).replace(/\D/g, "")) || 0;
  const pb = parseInt(String(b.price).replace(/\D/g, "")) || 0;
  return pa - pb;
});

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&family=Inter:wght@400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet">`;

const page = ({ title, description, body, root = "." }) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
${ART.slab ? `<meta property="og:image" content="${site.baseUrl}/${ART.slab}">` : ""}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%23101010'/%3E%3Ctext x='32' y='44' font-family='sans-serif' font-weight='700' font-size='36' fill='%23F2F1EC' text-anchor='middle'%3Eg%3C/text%3E%3C/svg%3E">
${FONTS}
<link rel="stylesheet" href="${root}/style.css">
</head>
<body>
<nav><div class="wrap">
  <a class="wordmark" href="${root}/index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
  <div class="links">
    <a href="${root}/index.html#templates">Templates</a>
    <a href="${root}/index.html#how">How it works</a>
    <a class="pill" href="${root}/index.html#templates">Browse templates</a>
  </div>
</div></nav>
${body}
<footer><div class="wrap">
  <div class="foot-grid">
    <div class="foot-brand">
      <span class="wordmark">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></span>
      <p>Premium website templates,<br>easy to make yours.</p>
      <span class="mono-sm">© 2026 ${esc(site.name)}${esc(site.tld)}</span>
    </div>
    <div class="foot-col">
      <span class="mono-sm">TEMPLATES</span>
      ${sorted.map(t => `<a href="${root}/templates/${t.slug}/index.html">${esc(t.name)}</a>`).join("\n      ")}
    </div>
    <div class="foot-col">
      <span class="mono-sm">EXPLORE</span>
      <a href="${root}/index.html#templates">All templates</a>
      <a href="${root}/index.html#why">Why a template</a>
      <a href="${root}/index.html#how">How it works</a>
      <a href="${root}/index.html#extras">Components</a>
    </div>
  </div>
</div></footer>
<script>
// progressive reveal: content is visible by default; animation only when JS + IO are healthy
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
  const pending = [];
  document.querySelectorAll(".reveal").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) { el.classList.add("in"); return; }
    el.classList.add("pre");
    io.observe(el);
    pending.push(el);
  });
  let tick = false;
  const sweep = () => {
    tick = false;
    for (let i = pending.length - 1; i >= 0; i--) {
      const el = pending[i];
      if (el.classList.contains("in")) { pending.splice(i, 1); continue; }
      if (el.getBoundingClientRect().top < innerHeight * 0.96) { el.classList.add("in"); io.unobserve(el); pending.splice(i, 1); }
    }
    if (!pending.length) removeEventListener("scroll", onScroll);
  };
  const onScroll = () => { if (!tick) { tick = true; requestAnimationFrame(sweep); } };
  addEventListener("scroll", onScroll, { passive: true });
  setTimeout(() => { pending.forEach(el => el.classList.add("in")); pending.length = 0; removeEventListener("scroll", onScroll); }, 2500);
}
const sw = document.getElementById("free-switch");
if (sw) {
  const flip = () => {
    sw.classList.toggle("on");
    const freeOnly = sw.classList.contains("on");
    document.querySelectorAll("[data-free]").forEach(c => {
      c.style.display = (!freeOnly || c.dataset.free === "true") ? "" : "none";
    });
  };
  sw.addEventListener("click", flip);
  sw.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
}
</script>
</body>
</html>`;

const tcard = (t, root = ".") => `
<a class="tcard reveal" data-free="${t.free}" href="${root}/templates/${t.slug}/index.html">
  <div class="frame"><div class="shot"><img src="${root}/${t.cover}" alt="${esc(t.name)} — website template preview" loading="lazy"></div></div>
  <div class="meta">
    <h3>${esc(t.name)}${t.free ? ' <span class="badge">Free</span>' : ""}${t.status === "soon" ? ' <span class="badge soon">Soon</span>' : ""}${t.new ? ' <span class="badge">New</span>' : ""}</h3>
    <span class="catprice">${esc(t.category)} · <b>${esc(t.price)}</b></span>
  </div>
  <p class="line2">${esc(t.tagline)}</p>
</a>`;

// value-prop cells; icon images appear automatically once art files exist
const WHY = [
  { art: ART.triangle, k: "Live in days, not months", p: "No waiting on a designer's calendar. Take a template today, publish this week." },
  { art: ART.sphere, k: "Looks custom-built", p: "Editorial type, real motion, considered detail. Nobody will guess it started as a template." },
  { art: ART.torus, k: "Actually easy to edit", p: "Click a word, retype it. Click a photo, swap it. If you can edit a slide deck, you can edit this." },
  { art: ART.slab, k: "Free to start", p: "Some templates cost nothing — no signup wall, no watermark. See the quality before spending a cent." },
];

/* ---------------- home ---------------- */
const home = page({
  title: site.title,
  description: site.description,
  body: `
<header>
  <p class="eyebrow"><span class="badge-pill">✦&nbsp; Premium Framer templates</span></p>
  <h1 class="grad">Premium templates,<br>easy to make yours.</h1>
  <p class="statement">Websites that look custom-built and edit like a slide deck. Copy one, put your words in, go live today.</p>
  <div class="ctas">
    <a class="pill lg" href="#templates">Browse templates</a>
    <a class="textlink" href="#how">How it works <span class="arr">→</span></a>
  </div>
  <div class="hero-visual reveal">
    <img src="assets/covers/aubrey.jpg" alt="A premium website template, live in the browser">
  </div>
</header>

<section id="templates" class="tight-top"><div class="wrap">
  <div class="head">
    <div>
      <h2 class="grad">Find your template</h2>
      <p class="sub">Every one opens as a real, live site — click around before you take it. The green ones are free.</p>
    </div>
    <div class="toggle-row">
      <span class="lab">FREE ONLY</span>
      <div class="switch" id="free-switch" role="switch" tabindex="0" aria-label="Show free templates only"></div>
    </div>
  </div>
  <div class="grid">
    ${sorted.map(t => tcard(t)).join("\n")}
  </div>
</div></section>

<section id="why"><div class="wrap">
  <div class="center-head">
    <span class="badge-pill">Why a template?</span>
    <h2 class="grad">A premium website, without<br>the premium invoice</h2>
    <p class="sub">Because you don't need to spend thousands, or wait months, to look like you did.</p>
  </div>
  <div class="why-grid">
    ${WHY.map(w => `
    <div class="why-cell reveal">
      ${w.art ? `<img class="icon3d" src="${w.art}" alt="" aria-hidden="true">` : `<span class="icon3d icon3d-ph" aria-hidden="true"></span>`}
      <h3>${esc(w.k)}</h3>
      <p>${esc(w.p)}</p>
    </div>`).join("\n")}
  </div>
</div></section>

<section id="how"><div class="wrap">
  <div class="center-head">
    <span class="badge-pill">How it works</span>
    <h2 class="grad">Three steps to<br>your new website</h2>
    <p class="sub">You don't need to be technical. It's genuinely this simple.</p>
  </div>
  <div class="steps">
    <div class="step reveal">
      <span class="mono-sm">STEP 1</span>
      <h3>Choose a template</h3>
      <p>Browse the collection and open the live demos until one feels like yours.</p>
      <div class="step-shot"><img src="assets/covers/fernhollow.jpg" alt="" loading="lazy"></div>
    </div>
    <div class="step reveal">
      <span class="mono-sm">STEP 2</span>
      <h3>Make it yours</h3>
      <p>Click any word and retype it. Click any photo and swap it. No code, ever.</p>
      <div class="step-shot"><img src="assets/covers/still.jpg" alt="" loading="lazy"></div>
    </div>
    <div class="step reveal">
      <span class="mono-sm">STEP 3</span>
      <h3>Publish your site</h3>
      <p>One click and you're live on a free link. Plug in your own domain whenever you're ready.</p>
      <div class="step-shot"><img src="assets/covers/brookmere.jpg" alt="" loading="lazy"></div>
    </div>
  </div>
</div></section>

<section id="extras"><div class="wrap">
  <div class="head">
    <div>
      <h2 class="grad">Little extras</h2>
      <p class="sub">Small pieces of motion that drop into any Framer site. $5 each.</p>
    </div>
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
  <div class="center-head">
    <span class="badge-pill">Fair questions</span>
    <h2 class="grad">Questions? Answers.</h2>
  </div>
  <div class="props">
    <div class="prop reveal"><div class="k">Are some really free?</div><p>The ones with the green badge — completely. No signup wall, no watermark, no "free trial". Take it and go.</p></div>
    <div class="prop reveal"><div class="k">Do I need to know code?</div><p>No. If you can edit a slide deck, you can edit these. Everything changes by clicking on it.</p></div>
    <div class="prop reveal"><div class="k">Why give any away free?</div><p>So you can see the quality is real before spending anything. The free ones are built to the same standard as the paid ones.</p></div>
    <div class="prop reveal"><div class="k">What do the paid ones cost?</div><p>One flat price, yours forever, use it as long as you like. Cheaper than one hour of a designer's time.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="cta-band reveal">
    <h2 class="grad">Can't pick one?</h2>
    <p>A 60-second quiz that matches you with your template is coming soon. Until then, the free ones are a safe bet.</p>
    <a class="pill lg" href="#templates">Back to the templates</a>
  </div>
</div></section>`,
});

/* ---------------- detail pages ---------------- */
const detail = (t) => {
  const related = sorted.filter(x => x.slug !== t.slug).slice(0, 2);
  return page({
    title: `${t.name} — ${t.category.toLowerCase()} website template${t.free ? " (free)" : ""} | ${site.name}${site.tld}`,
    description: t.description,
    root: "../..",
    body: `
<div class="wrap crumb mono-sm"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <a href="../../index.html#templates">Templates</a> &nbsp;/&nbsp; ${esc(t.name)}</div>
<div class="wrap detail">
  <div class="gallery">
    <div class="main"><div class="shot"><img src="../../${t.cover}" alt="${esc(t.name)} — website template preview"></div></div>
  </div>
  <div class="info">
    <p class="cat mono">${esc(t.category.toUpperCase())} TEMPLATE${t.status === "soon" ? ' · COMING SOON' : ""}</p>
    <h1 class="grad">${esc(t.tagline)}</h1>
    <div class="price-row">
      <span class="price">${esc(t.price)}</span>
      ${t.free ? '<span class="vs">100% free — no signup</span>' : '<span class="vs">vs $2,000+ from a designer</span>'}
    </div>
    <p class="desc">${esc(t.description)}</p>
    <div class="actions">
      <a class="btn-primary" href="${t.get}" target="_blank" rel="noreferrer">${t.free ? "Use this template — free" : "Get this template"}</a>
      <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Preview live demo</a>
    </div>
  </div>
</div>
<section style="padding-top:0"><div class="wrap">
  <div class="head"><div><h2 class="grad">You might also like</h2></div></div>
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
if (fs.existsSync(path.join(ROOT, "assets", "art"))) {
  fs.mkdirSync(path.join(DIST, "assets", "art"), { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, "assets", "art"))) {
    fs.copyFileSync(path.join(ROOT, "assets", "art", f), path.join(DIST, "assets", "art", f));
  }
}
for (const t of templates) {
  const dir = path.join(DIST, "templates", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detail(t));
}
const urls = [site.baseUrl + "/", ...templates.map(t => `${site.baseUrl}/templates/${t.slug}/`)];
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n") + "\n</urlset>");
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
console.log("built:", ["index.html", ...templates.map(t => `templates/${t.slug}/`)].join(", "));
