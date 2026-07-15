// Zero-dependency static build: templates.json -> dist/
// Usage: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));
const { site, templates, components } = data;

// free first, then paid cheapest-first
const sorted = [...templates].sort((a, b) => {
  if (a.free !== b.free) return a.free ? -1 : 1;
  const pa = parseInt(String(a.price).replace(/\D/g, "")) || 0;
  const pb = parseInt(String(b.price).replace(/\D/g, "")) || 0;
  return pa - pb;
});

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
  <a class="wordmark" href="${root}/index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
  <div class="links">
    <a href="${root}/index.html#websites">FREE WEBSITES</a>
    <a href="${root}/index.html#how">HOW IT WORKS</a>
    <a class="pill" href="${root}/index.html#websites">Find yours</a>
  </div>
</div></nav>
${body}
<footer><div class="wrap">
  <span class="mono-sm">© 2026 — HAND-PICKED WEBSITES</span>
  <span class="mono-sm">NEW ONES ADDED OFTEN</span>
  <span class="mono-sm">BUILT INDEPENDENTLY</span>
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
  ${t.free ? '<span class="sticker">FREE</span>' : ""}${t.status === "soon" ? '<span class="sticker blue">SOON</span>' : ""}
  <div class="frame"><img src="${root}/${t.cover}" alt="${esc(t.name)} — free website design preview" loading="lazy"></div>
  <div class="meta">
    <h3>${esc(t.name)}</h3>
    <span class="catprice">${esc(t.category)} · <b>${esc(t.price)}</b></span>
  </div>
  <p class="line2">${esc(t.tagline)}</p>
</a>`;

/* ---------------- home ---------------- */
const home = page({
  title: site.title,
  description: site.description,
  body: `
<header>
  <span class="eyebrow">★ COPY-AND-GO WEBSITES — NO CODE, NO CATCH</span>
  <h1>Get a free website<br>that <span class="hl">doesn't look free.</span></h1>
  <p class="statement">${esc(site.description)}</p>
  <div class="ctas">
    <a class="pill lg" href="#websites">Show me the websites</a>
    <a class="textlink" href="#how">how does this work?</a>
  </div>
</header>

<section id="websites"><div class="wrap">
  <div class="head">
    <div>
      <h2>Pick a website</h2>
      <p class="sub">Every one opens as a real, live site — click around before you take it. The yellow stickers cost nothing.</p>
    </div>
    <div class="toggle-row">
      <span class="lab">FREE ONLY</span>
      <div class="switch" id="free-switch" role="switch" tabindex="0" aria-label="Show free websites only"></div>
    </div>
  </div>
  <div class="grid">
    ${sorted.map(t => tcard(t)).join("\n")}
  </div>
</div></section>

<section id="how"><div class="wrap">
  <div class="head">
    <div>
      <h2>How it works</h2>
      <p class="sub">Three steps, one afternoon. You never touch code.</p>
    </div>
  </div>
  <div class="steps">
    <div class="step reveal"><span class="num">1</span><h3>Take it</h3><p>Hit "Use this website" and it copies itself into a free Framer account. The whole thing — pages, pictures, motion.</p></div>
    <div class="step reveal"><span class="num">2</span><h3>Make it yours</h3><p>Click any word and retype it. Click any photo and swap it. It keeps looking good while you change everything.</p></div>
    <div class="step reveal"><span class="num">3</span><h3>Put it online</h3><p>One publish button and you're live on a free link. Plug in your own domain whenever you feel fancy.</p></div>
  </div>
</div></section>

<section><div class="wrap">
  <div class="head">
    <div>
      <h2>Fair questions</h2>
    </div>
  </div>
  <div class="props">
    <div class="prop reveal"><div class="k">Is it actually free?</div><p>The ones with the yellow sticker — completely. No signup wall, no watermark, no "free trial". Take it and go.</p></div>
    <div class="prop reveal"><div class="k">Do I need to know code?</div><p>No. If you can edit a slide deck, you can edit these. Everything changes by clicking on it.</p></div>
    <div class="prop reveal"><div class="k">Then why is it free?</div><p>Some of our websites cost money. We give the rest away so you can see the quality is real before spending anything.</p></div>
    <div class="prop reveal"><div class="k">What about the paid ones?</div><p>One flat price, yours forever, use it as long as you like. Cheaper than one hour of a designer's time.</p></div>
  </div>
</div></section>

<section id="extras"><div class="wrap">
  <div class="head">
    <div>
      <h2>Little extras</h2>
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
  <div class="cta-band reveal">
    <h2>Can't pick one?</h2>
    <p>A 60-second quiz that matches you with your website is coming this week. Until then, the free ones are a safe bet.</p>
    <a class="pill lg" href="#websites">Back to the shelf</a>
  </div>
</div></section>`,
});

/* ---------------- detail pages ---------------- */
const detail = (t) => {
  const related = sorted.filter(x => x.slug !== t.slug).slice(0, 2);
  return page({
    title: `${t.name} — free ${t.category.toLowerCase()} website${t.free ? "" : " design"} | ${site.name}${site.tld}`,
    description: t.description,
    root: "../..",
    body: `
<div class="wrap crumb mono-sm"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <a href="../../index.html#websites">Websites</a> &nbsp;/&nbsp; ${esc(t.name)}</div>
<div class="wrap detail">
  <div class="gallery">
    <div class="main"><img src="../../${t.cover}" alt="${esc(t.name)} — website design preview"></div>
  </div>
  <div class="info">
    <p class="cat mono">${esc(t.category.toUpperCase())} WEBSITE${t.status === "soon" ? ' — <span class="sticker blue" style="position:static;display:inline-block">SOON</span>' : ""}</p>
    <h1>${esc(t.tagline)}</h1>
    <div class="price-row">
      <span class="price">${esc(t.price)}</span>
      ${t.free ? '<span class="vs">100% free — no signup</span>' : '<span class="vs">vs $2,000+ from a designer</span>'}
    </div>
    <p class="desc">${esc(t.description)}</p>
    <div class="actions">
      <a class="btn-primary" href="${t.get}" target="_blank" rel="noreferrer">${t.free ? "Use this website — free" : "Get this website"}</a>
      <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Open the live site</a>
    </div>
  </div>
</div>
<section style="padding-top:0"><div class="wrap">
  <div class="head"><div><h2>More like this</h2></div></div>
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
