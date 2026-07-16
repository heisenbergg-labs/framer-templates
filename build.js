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

const VER = Date.now().toString(36);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">`;

const QDATA = sorted.map(t => ({
  name: t.name, slug: t.slug, cat: t.category, price: t.price, free: !!t.free,
  soon: t.status === "soon", cover: t.cover, tag: t.tagline,
}));

const quizBlock = (root) => `
<div id="quiz-overlay" hidden>
  <div class="quiz-card" role="dialog" aria-modal="true" aria-label="Find your template quiz">
    <button class="quiz-x" type="button" aria-label="Close">&times;</button>
    <div class="quiz-step" data-step="intro">
      <span class="badge-pill">Not sure which one?</span>
      <h2 class="quiz-h">Find <span class="it">your</span> template</h2>
      <p class="quiz-p">Three quick questions and we'll match you — plus <span class="goldtext quiz-gold">30% off</span> any paid template.</p>
      <button class="pill lg" type="button" data-next>Let's find it</button>
    </div>
    <div class="quiz-step" data-step="name" hidden>
      <p class="quiz-lab">01 — First things first</p>
      <h2 class="quiz-h">What's your <span class="it">name?</span></h2>
      <input id="quiz-name" type="text" autocomplete="off" placeholder="Type your name" maxlength="40">
      <button class="pill lg" type="button" data-next>Next</button>
    </div>
    <div class="quiz-step" data-step="prof" hidden>
      <p class="quiz-lab">02 — About you</p>
      <h2 class="quiz-h">What do you <span class="it">do?</span></h2>
      <div class="quiz-opts">
        <button type="button" data-pick="portfolio">Photographer / creative</button>
        <button type="button" data-pick="hospitality">Host / stays / hospitality</button>
        <button type="button" data-pick="business">Finance / consulting / business</button>
        <button type="button" data-pick="fun">Developer / personal brand</button>
        <button type="button" data-pick="any">Something else</button>
      </div>
    </div>
    <div class="quiz-step" data-step="plan" hidden>
      <p class="quiz-lab">03 — The plan</p>
      <h2 class="quiz-h">What are you <span class="it">building?</span></h2>
      <div class="quiz-opts">
        <button type="button" data-pick="portfolio">A portfolio</button>
        <button type="button" data-pick="business">A business site</button>
        <button type="button" data-pick="hospitality">A stays / booking site</button>
        <button type="button" data-pick="fun">Something fun people remember</button>
      </div>
    </div>
    <div class="quiz-step" data-step="result" hidden>
      <p class="quiz-lab">Your match</p>
      <h2 class="quiz-h" id="quiz-result-h">Made for you.</h2>
      <div class="quiz-matches" id="quiz-matches"></div>
      <div class="quiz-code"><span>30% off any paid template</span><b>PICKED30</b></div>
      ${site.leadWebhook ? `<form id="quiz-lead" novalidate>
        <input id="quiz-email" type="email" placeholder="Your email" autocomplete="email" required>
        <button class="pill" type="submit">Email me the code</button>
      </form>
      <p class="quiz-fine">The code plus new free templates when they drop. No spam, ever.</p>` : ""}
      <a class="textlink" href="${root}/templates/index.html">or browse everything <span class="arr">&rarr;</span></a>
    </div>
  </div>
</div>
<script>
(function () {
  var DATA = ${JSON.stringify(QDATA)};
  var ROOT = "${root}";
  var HOOK = "${site.leadWebhook || ""}";
  var lastMatches = "";
  var ov = document.getElementById("quiz-overlay");
  if (!ov) return;
  var steps = ov.querySelectorAll(".quiz-step");
  var order = ["intro", "name", "prof", "plan", "result"];
  var at = 0;
  var picks = { prof: null, plan: null };
  function show(i) {
    at = i;
    steps.forEach(function (st) { st.hidden = st.dataset.step !== order[i]; });
    if (order[i] === "name") setTimeout(function () { document.getElementById("quiz-name").focus(); }, 60);
  }
  function open() { ov.hidden = false; document.body.style.overflow = "hidden"; show(0); if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-open", title: "Quiz opened", event: true }); }
  function close() { ov.hidden = true; document.body.style.overflow = ""; localStorage.setItem("gs_quiz_seen", "1"); }
  function score() {
    var CAT = { portfolio: "Portfolio", hospitality: "Hospitality", business: "Business" };
    var scored = DATA.map(function (t) {
      var sc = 0;
      ["prof", "plan"].forEach(function (k) {
        var v = picks[k];
        if (!v || v === "any") return;
        if (v === "fun") { if (t.slug === "nostalgia-exe") sc += 2; if (t.cat === "Portfolio") sc += 1; }
        else if (t.cat === CAT[v]) sc += 2;
      });
      if (t.free) sc += 0.5;
      if (t.soon) sc -= 0.75;
      return { t: t, sc: sc };
    }).sort(function (a, b) { return b.sc - a.sc; });
    return scored.slice(0, 2).map(function (x) { return x.t; });
  }
  function finish() {
    var name = (document.getElementById("quiz-name").value || "").trim();
    document.getElementById("quiz-result-h").innerHTML = name
      ? "Made for you, <span class='it'>" + name.replace(/[<>&'\"]/g, "") + ".</span>"
      : "Made <span class='it'>for you.</span>";
    var picked = score();
    lastMatches = picked.map(function (t) { return t.name; }).join(", ");
    document.getElementById("quiz-matches").innerHTML = picked.map(function (t) {
      return "<a class='quiz-match' href='" + ROOT + "/templates/" + t.slug + "/index.html'>" +
        "<img src='" + ROOT + "/" + t.cover + "' alt=''>" +
        "<span class='qm-meta'><b>" + t.name + "</b><i>" + t.cat + " &middot; " + t.price + "</i></span></a>";
    }).join("");
    show(order.indexOf("result"));
    var lf = document.getElementById("quiz-lead");
    if (lf && !lf.dataset.wired) {
      lf.dataset.wired = "1";
      lf.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var em = document.getElementById("quiz-email");
        if (!em.value || em.value.indexOf("@") < 1) { em.focus(); return; }
        var body = new URLSearchParams({
          name: (document.getElementById("quiz-name").value || "").trim(),
          email: em.value.trim(),
          prof: picks.prof || "",
          plan: picks.plan || "",
          matches: lastMatches,
          page: location.pathname,
        });
        fetch(HOOK, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
        lf.outerHTML = "<p class='quiz-sent'>Sent. Check your inbox \u2728</p>";
        if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-lead", title: "Quiz lead captured", event: true });
      });
    }
    localStorage.setItem("gs_quiz_done", "1");
    if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-complete", title: "Quiz completed", event: true });
  }
  ov.addEventListener("click", function (e) {
    if (e.target === ov) { close(); return; }
    if (e.target.closest(".quiz-x")) { close(); return; }
    var nx = e.target.closest("[data-next]");
    if (nx) { show(at + 1); return; }
    var pk = e.target.closest("[data-pick]");
    if (pk) {
      picks[order[at] === "prof" ? "prof" : "plan"] = pk.dataset.pick;
      if (order[at] === "prof") show(at + 1); else finish();
    }
  });
  document.getElementById("quiz-name").addEventListener("keydown", function (e) {
    if (e.key === "Enter") show(order.indexOf("prof"));
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ov.hidden) close(); });
  document.addEventListener("click", function (e) {
    var o = e.target.closest ? e.target.closest("[data-quiz-open]") : null;
    if (o) { e.preventDefault(); open(); }
  });
  if (!localStorage.getItem("gs_quiz_seen") && !localStorage.getItem("gs_quiz_done")) {
    setTimeout(function () { if (ov.hidden) open(); }, 12000);
  }
})();
</script>`;

const page = ({ title, description, body, root = ".", quiz = false, og = "assets/og/home.jpg", jsonld = null, bare = false }) => `<!DOCTYPE html>
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
<meta property="og:image" content="${site.baseUrl}/${og}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${jsonld ? `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>` : ""}
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23f3dc8e'/%3E%3Cstop offset='0.55' stop-color='%23d9b95c'/%3E%3Cstop offset='1' stop-color='%23a8842e'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='64' height='64' rx='15' fill='%23070707'/%3E%3Crect x='0.75' y='0.75' width='62.5' height='62.5' rx='14.4' fill='none' stroke='url(%23g)' stroke-opacity='0.55' stroke-width='1.5'/%3E%3Ctext x='32' y='46' font-family='Georgia,serif' font-size='42' fill='url(%23g)' text-anchor='middle'%3Eg%3C/text%3E%3C/svg%3E">
${FONTS}
<link rel="stylesheet" href="${root}/style.css?v=${VER}">
<script data-goatcounter="https://getsites.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>
</head>
<body>
${bare ? "" : `<nav><div class="wrap">
  <a class="wordmark" href="${root}/index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
  <div class="links">
    <a href="${root}/templates/index.html">Templates</a>
    <a class="pill" href="${root}/templates/index.html">Browse templates</a>
  </div>
</div></nav>`}
${body}
${quiz ? quizBlock(root) : ""}
${bare ? "" : `<footer><div class="wrap">
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
      <a href="${root}/templates/index.html">All templates</a>
      <a href="${root}/index.html#why">Why a template</a>
      <a href="#" data-quiz-open>Find your template (quiz)</a>
    </div>
  </div>
</div></footer>`}
<div id="cursor-chip" aria-hidden="true"></div>
<script>
// cursor-follower price chip on template cards (fine pointers only)
if (matchMedia("(pointer: fine)").matches) {
  const chip = document.getElementById("cursor-chip");
  let card = null;
  document.addEventListener("mousemove", e => {
    const c = e.target.closest ? e.target.closest("[data-cursor]") : null;
    if (c !== card) {
      card = c;
      if (card) {
        chip.textContent = card.dataset.cursor;
        chip.className = "on " + card.dataset.kind;
        document.querySelectorAll(".tcard, .hang").forEach(t => t.classList.toggle("chip-active", t === card));
      } else {
        chip.className = "";
        document.querySelectorAll(".chip-active").forEach(t => t.classList.remove("chip-active"));
      }
    }
    if (card) chip.style.transform = "translate3d(" + (e.clientX + 20) + "px," + (e.clientY + 14) + "px,0)";
  }, { passive: true });
}
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

const tcard = (t, root = ".", ql = false) => `
<a class="tcard reveal" data-free="${t.free}" data-cursor="${t.free ? "Free" : (t.status === "soon" ? "Soon" : esc(t.price))}" data-kind="${t.free ? "free" : "paid"}"${ql ? ` data-name="${esc(t.name)}" data-cat="${esc(t.category)}" data-pricenum="${t.free ? 0 : parseInt(String(t.price).replace(/\D/g, "")) || 0}" data-new="${t.new ? 1 : 0}"` : ""} href="${root}/templates/${t.slug}/index.html">
  <div class="frame"><div class="shot"><img src="${root}/${t.cover}" alt="${esc(t.name)} — website template preview" loading="lazy"></div><span class="ppill ${t.free ? "free" : "paid"}">${t.free ? "Free" : "Paid"}</span>${ql ? `<button class="qlb" type="button" data-ql-demo="${t.demo}" data-ql-name="${esc(t.name)}" data-ql-meta="${esc(t.category)} · ${esc(t.price)}" data-ql-href="${root}/templates/${t.slug}/index.html" data-ql-get="${t.get}">Quick look</button>` : ""}</div>
  <div class="meta">
    <div class="meta-l">
      <span class="cat-line">${esc(t.category)}</span>
      <h3>${esc(t.name)}${t.status === "soon" ? ' <span class="badge soon">Soon</span>' : ""}${t.new ? ' <span class="badge">New</span>' : ""}</h3>
      <p class="line2">${esc(t.tagline)}</p>
    </div>
    <span class="price-r ${t.free ? "free" : ""}">${esc(t.price)}</span>
  </div>
</a>`;

// value-prop cells; icon images appear automatically once art files exist
const WHY = [
  { art: ART.triangle, k: "Live in days, not months", p: "No waiting on a designer's calendar. Take a template today, publish this week." },
  { art: ART.sphere, k: "Looks custom-built", p: "Editorial type, real motion, considered detail. Nobody will guess it started as a template." },
  { art: ART.torus, k: "Actually easy to edit", p: "Click a word, retype it. Click a photo, swap it. If you can edit a slide deck, you can edit this." },
  { art: ART.slab, k: "Free to start", p: "Some templates cost nothing — no signup wall, no watermark. See the quality before spending a cent." },
];

/* ---------------- home ---------------- */
const CATS = [...new Set(sorted.map(t => t.category))].map(c => ({ name: c, n: sorted.filter(t => t.category === c).length }));
const FREE_N = sorted.filter(t => t.free).length;

const home = page({
  title: site.title,
  description: site.description,
  quiz: true,
  bare: true,
  jsonld: { "@context": "https://schema.org", "@type": "WebSite", name: site.name + site.tld, url: site.baseUrl + "/", description: site.description },
  body: `
<div class="shell">
  <aside class="rail">
    <a class="wordmark" href="index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
    <div class="q-wrap"><input id="q" type="search" placeholder="Search" autocomplete="off" aria-label="Search templates"><span class="q-kbd">⌘K</span></div>
    <div class="rail-sec">
      <span class="rail-lab">Browse</span>
      <button class="rail-link on" type="button" data-cat="all"><span class="rl-ic c-gold"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="1.5" width="5.4" height="5.4" rx="1.2"/><rect x="9.1" y="1.5" width="5.4" height="5.4" rx="1.2"/><rect x="1.5" y="9.1" width="5.4" height="5.4" rx="1.2"/><rect x="9.1" y="9.1" width="5.4" height="5.4" rx="1.2"/></svg></span><span class="rl-t">All templates</span><i>${sorted.length}</i></button>
      <button class="rail-link" type="button" data-cat="__free"><span class="rl-ic c-green"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8.6 1.8 14 7.2a1.6 1.6 0 0 1 0 2.3l-4.5 4.5a1.6 1.6 0 0 1-2.3 0L1.8 8.6A1.3 1.3 0 0 1 1.4 7.7V3a1.6 1.6 0 0 1 1.6-1.6h4.7c.34 0 .66.13.9.4Z"/><circle cx="5" cy="5" r="1" fill="currentColor" stroke="none"/></svg></span><span class="rl-t">Free</span><i>${FREE_N}</i></button>
      ${CATS.map((c, ci) => `<button class="rail-link" type="button" data-cat="${esc(c.name)}"><span class="rl-ic c-${ci % 4}"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 4.5h12M2 8h12M2 11.5h8"/></svg></span><span class="rl-t">${esc(c.name)}</span><i>${c.n}</i></button>`).join("\n      ")}
    </div>
    <div class="rail-quiz" data-quiz-open role="button" tabindex="0">
      <span class="rail-quiz-k goldtext">Not sure which one?</span>
      <span class="rail-quiz-p">A 60-second quiz matches you — and takes 30% off any paid template.</span>
      <span class="rail-quiz-cta">Find my template →</span>
    </div>
    <div class="rail-foot mono-sm">© 2026 ${esc(site.name)}${esc(site.tld)}</div>
  </aside>
  <main class="canvas">
    <div class="toolbar">
      <h1 id="grid-title">All templates</h1>
      <div class="tools">
        <div class="sort-wrap">
        <select id="sort" aria-label="Sort templates">
          <option value="default">Free first</option>
          <option value="new">Newest</option>
          <option value="asc">Price: low to high</option>
          <option value="desc">Price: high to low</option>
        </select>
        <svg class="sort-chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M2.5 4.5 6 8l3.5-3.5"/></svg>
        </div>
        <div class="toggle-row">
          <span class="lab">FREE ONLY</span>
          <div class="switch" id="free-switch" role="switch" tabindex="0" aria-label="Show free templates only"></div>
        </div>
      </div>
    </div>
    <div class="grid grid-3" id="tgrid">
      ${sorted.map(t => tcard(t, ".", true)).join("\n")}
    </div>
    <div id="empty" class="grid-empty" hidden>
      <p class="serifline">Nothing hangs <span class="it">here yet.</span></p>
      <p class="sub">No templates match that. Clear the search or pick another category.</p>
    </div>

    <section id="why">
      <div class="sec-head">
        <h2>A premium website, without <span class="it">the premium invoice</span></h2>
        <p class="sub">Because you don't need to spend thousands, or wait months, to look like you did.</p>
      </div>
      <div class="why-grid">
        ${WHY.map(w => `
        <div class="why-cell reveal">
          ${w.art ? `<img class="icon3d" src="${w.art}" alt="" aria-hidden="true">` : ""}
          <h3>${esc(w.k)}</h3>
          <p>${esc(w.p)}</p>
        </div>`).join("\n")}
      </div>
    </section>

    <section class="cta-open split">
      <div class="cta-grid">
      <div class="cta-inner reveal">
        <span class="badge-pill">The 60-second quiz</span>
        <h2>Can't pick <span class="it goldtext">one?</span></h2>
        <p>Answer three quick questions and we'll match you with your template — and take 30% off any paid one.</p>
        <a class="pill lg" href="#" data-quiz-open>Take the quiz</a>
      </div>
      <div class="deck reveal" id="deck" aria-label="Template covers shuffling">
        ${sorted.map(t => `<a class="deck-card" href="templates/${t.slug}/index.html" data-cursor="${t.free ? "Free" : (t.status === "soon" ? "Soon" : esc(t.price))}" data-kind="${t.free ? "free" : "paid"}">
          <img src="${t.cover}" alt="${esc(t.name)} template cover" loading="lazy">
          <span class="deck-cap"><b>${esc(t.name)}</b><i>${esc(t.category)} &middot; ${esc(t.price)}</i></span>
        </a>`).join("\n        ")}
      </div>
      </div>
    </section>

    <div class="canvas-foot mono-sm">
      <span>© 2026 ${esc(site.name)}${esc(site.tld)}</span>
      <a href="#" data-quiz-open>Find your template (quiz)</a>
    </div>
  </main>
</div>

<div id="ql" hidden>
  <div class="ql-box">
    <div class="ql-top">
      <div class="ql-meta"><b id="ql-name"></b><span id="ql-sub" class="mono-sm"></span></div>
      <div class="ql-actions">
        <a id="ql-get" class="pill" href="#" target="_blank" rel="noreferrer">Get this template</a>
        <a id="ql-page" class="textlink" href="#">Details →</a>
        <button class="ql-x" type="button" aria-label="Close quick look">&times;</button>
      </div>
    </div>
    <div class="ql-frame"><iframe id="ql-iframe" title="Live template preview"></iframe></div>
  </div>
</div>

<script>
(function () {
  var state = { q: "", cat: "all", sort: "default", free: false };
  var grid = document.getElementById("tgrid");
  var cards = [].slice.call(grid.querySelectorAll(".tcard"));
  var initial = cards.slice();
  var empty = document.getElementById("empty");
  var title = document.getElementById("grid-title");
  function apply() {
    var vis = 0;
    var list = initial.slice();
    if (state.sort === "asc") list.sort(function (a, b) { return (+a.dataset.pricenum) - (+b.dataset.pricenum); });
    if (state.sort === "desc") list.sort(function (a, b) { return (+b.dataset.pricenum) - (+a.dataset.pricenum); });
    if (state.sort === "new") list.sort(function (a, b) { return (+b.dataset.new) - (+a.dataset.new); });
    list.forEach(function (c) { grid.appendChild(c); });
    cards.forEach(function (c) {
      var okCat = state.cat === "all" || (state.cat === "__free" ? c.dataset.free === "true" : c.dataset.cat === state.cat);
      var okFree = !state.free || c.dataset.free === "true";
      var hay = (c.dataset.name + " " + c.dataset.cat + " " + c.textContent).toLowerCase();
      var okQ = !state.q || hay.indexOf(state.q) !== -1;
      var on = okCat && okFree && okQ;
      c.style.display = on ? "" : "none";
      if (on) vis++;
    });
    empty.hidden = vis !== 0;
    title.textContent = state.q ? 'Results for "' + state.q + '"' : (state.cat === "all" ? "All templates" : (state.cat === "__free" ? "Free templates" : state.cat + " templates"));
  }
  document.getElementById("q").addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); apply(); });
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); document.getElementById("q").focus(); }
  });
  document.querySelectorAll(".rail-link").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".rail-link").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      state.cat = b.dataset.cat;
      apply();
    });
  });
  document.getElementById("sort").addEventListener("change", function () { state.sort = this.value; apply(); });
  var sw = document.getElementById("free-switch");
  sw.addEventListener("click", function () { setTimeout(function () { state.free = sw.classList.contains("on"); apply(); }, 0); });
  sw.addEventListener("keydown", function () { setTimeout(function () { state.free = sw.classList.contains("on"); apply(); }, 0); });

  var ql = document.getElementById("ql");
  var qlf = document.getElementById("ql-iframe");
  function qlClose() { ql.hidden = true; qlf.src = "about:blank"; document.body.style.overflow = ""; }
  document.addEventListener("click", function (e) {
    var b = e.target.closest ? e.target.closest(".qlb") : null;
    if (b) {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("ql-name").textContent = b.dataset.qlName;
      document.getElementById("ql-sub").textContent = b.dataset.qlMeta;
      document.getElementById("ql-get").href = b.dataset.qlGet;
      document.getElementById("ql-page").href = b.dataset.qlHref;
      qlf.src = b.dataset.qlDemo;
      ql.hidden = false;
      document.body.style.overflow = "hidden";
      if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quick-look", title: "Quick look opened", event: true });
      return;
    }
    if (!ql.hidden && (e.target === ql || (e.target.closest && e.target.closest(".ql-x")))) qlClose();
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ql.hidden) qlClose(); });
  document.querySelectorAll(".rail-quiz").forEach(function (el) {
    el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } });
  });

  // shuffling deck
  var deckEl = document.getElementById("deck");
  if (deckEl) {
    var dc = [].slice.call(deckEl.querySelectorAll(".deck-card"));
    var paused = false;
    function layout() {
      dc.forEach(function (c, i) {
        c.style.zIndex = String(dc.length - i);
        c.style.opacity = i < 4 ? "1" : "0";
        c.style.transform = "translate(" + (i * 26) + "px, " + (i * 16) + "px) rotate(" + ((i - 1) * 1.6) + "deg) scale(" + (1 - i * 0.05) + ")";
      });
    }
    layout();
    deckEl.addEventListener("mouseenter", function () { paused = true; });
    deckEl.addEventListener("mouseleave", function () { paused = false; });
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInterval(function () {
        if (paused || document.hidden) return;
        var top = dc.shift();
        top.classList.add("fly");
        setTimeout(function () {
          top.classList.remove("fly");
          dc.push(top);
          layout();
        }, 560);
      }, 2600);
    }
  }
})();
</script>`,
});

/* ---------------- detail pages ---------------- */
const detail = (t) => {
  const related = sorted.filter(x => x.slug !== t.slug).slice(0, 2);
  const price = t.free ? "0" : String(t.price).replace(/[^0-9.]/g, "");
  return page({
    title: `${t.name} — ${t.category.toLowerCase()} website template${t.free ? " (free)" : ""} | ${site.name}${site.tld}`,
    description: t.description,
    root: "../..",
    og: `assets/og/${t.slug}.jpg`,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Product",
      name: t.name,
      description: t.description,
      image: `${site.baseUrl}/assets/og/${t.slug}.jpg`,
      url: `${site.baseUrl}/templates/${t.slug}/`,
      brand: { "@type": "Brand", name: site.name + site.tld },
      offers: { "@type": "Offer", price: price, priceCurrency: "USD", availability: t.status === "soon" ? "https://schema.org/PreOrder" : "https://schema.org/InStock", url: t.get },
    },
    quiz: true,
    body: `
<div class="wrap crumb mono-sm"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <a href="../../index.html#templates">Templates</a> &nbsp;/&nbsp; ${esc(t.name)}</div>
<div class="wrap detail">
  <div class="gallery">
    <div class="main"><div class="shot"><img src="../../${t.cover}" alt="${esc(t.name)} — website template preview"></div><span class="ppill ${t.free ? "free" : "paid"}">${t.free ? "Free" : "Paid"}</span></div>
  </div>
  <div class="info">
    <p class="cat mono">${esc(t.category.toUpperCase())} TEMPLATE${t.status === "soon" ? ' · COMING SOON' : ""}</p>
    <h1>${esc(t.tagline)}</h1>
    <div class="price-row">
      <span class="price">${esc(t.price)}</span>
      ${t.free ? '<span class="vs">100% free — no signup</span>' : '<span class="vs">vs $2,000+ from a designer</span>'}
    </div>
    <p class="desc">${esc(t.description)}</p>
    <div class="actions">
      <a class="btn-primary" href="${t.get}" target="_blank" rel="noreferrer">${t.free ? "Use this template — free" : "Get this template"}</a>
      <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Preview live demo</a>
    </div>
    <p class="quiz-nudge">Not sure it's the one? <a href="#" data-quiz-open>Take the 60-second quiz <span class="arr">&rarr;</span></a></p>
  </div>
</div>
<section class="detail-steps"><div class="wrap">
  <div class="center-head">
    <h2>Make ${esc(t.name)} <span class="it">yours</span></h2>
    <p class="sub">From this page to your own website, in four steps.</p>
  </div>
  <div class="flow-grid">
    <div class="flow-cell reveal">
      <span class="steplab">01</span>
      <h3>${t.free ? "Get it free" : "Buy the template"}</h3>
      <p>${t.free ? `Hit &quot;Use this template&quot; — no signup wall, ${esc(t.name)} is yours in one click.` : `Buy it once and it&#39;s yours forever. ${esc(t.name)} unlocks instantly.`}</p>
    </div>
    <div class="flow-cell reveal">
      <span class="steplab">02</span>
      <h3>Click Remix</h3>
      <p>One click on Remix and ${esc(t.name)} opens in Framer, fully editable, in a free account.</p>
    </div>
    <div class="flow-cell reveal">
      <span class="steplab">03</span>
      <h3>Change it to your details</h3>
      <p>Click any word or photo and swap it. Or tell Framer&#39;s AI agent what you want — it edits ${esc(t.name)} for you.</p>
    </div>
    <div class="flow-cell reveal">
      <span class="steplab">04</span>
      <h3>Publish your site</h3>
      <p>Pick up a domain (or connect one you own) right inside Framer, hit Publish, and ${esc(t.name)} is live as your website.</p>
    </div>
  </div>
</div></section>
<section style="padding-top:0"><div class="wrap">
  <div class="head"><div><h2>You might <span class="it">also like</span></h2></div></div>
  <div class="grid">
    ${related.map(r => tcard(r, "../..")).join("\n")}
  </div>
</div></section>`,
  });
};

/* ---------------- templates browse page ---------------- */
const browse = page({
  title: `All templates | ${site.name}${site.tld}`,
  description: site.description,
  root: "..",
  quiz: true,
  body: `
<section class="browse-top"><div class="wrap">
  <div class="head">
    <div>
      <h1 class="browse-h">Find <span class="it">your</span> template</h1>
      <p class="sub">Every one opens as a real, live site — click around before you take it. The green ones are free.</p>
    </div>
    <div class="toggle-row">
      <span class="lab">FREE ONLY</span>
      <div class="switch" id="free-switch" role="switch" tabindex="0" aria-label="Show free templates only"></div>
    </div>
  </div>
  <div class="grid">
    ${sorted.map(t => tcard(t, "..")).join("\n")}
  </div>
</div></section>`,
});

/* ---------------- write dist ---------------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets", "covers"), { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), home);
fs.writeFileSync(path.join(DIST, "style.css"), fs.readFileSync(path.join(ROOT, "src", "style.css")));
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
for (const f of fs.readdirSync(path.join(ROOT, "assets", "covers"))) {
  fs.copyFileSync(path.join(ROOT, "assets", "covers", f), path.join(DIST, "assets", "covers", f));
}
if (fs.existsSync(path.join(ROOT, "assets", "og"))) {
  fs.mkdirSync(path.join(DIST, "assets", "og"), { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, "assets", "og"))) {
    fs.copyFileSync(path.join(ROOT, "assets", "og", f), path.join(DIST, "assets", "og", f));
  }
}
if (fs.existsSync(path.join(ROOT, "assets", "art"))) {
  fs.mkdirSync(path.join(DIST, "assets", "art"), { recursive: true });
  for (const f of fs.readdirSync(path.join(ROOT, "assets", "art"))) {
    fs.copyFileSync(path.join(ROOT, "assets", "art", f), path.join(DIST, "assets", "art", f));
  }
}
fs.mkdirSync(path.join(DIST, "templates"), { recursive: true });
fs.writeFileSync(path.join(DIST, "templates", "index.html"), browse);
for (const t of templates) {
  const dir = path.join(DIST, "templates", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detail(t));
}
const urls = [site.baseUrl + "/", site.baseUrl + "/templates/", ...templates.map(t => `${site.baseUrl}/templates/${t.slug}/`)];
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n") + "\n</urlset>");
fs.writeFileSync(path.join(DIST, "404.html"), page({
  title: `Page not found | ${site.name}${site.tld}`,
  description: site.description,
  root: "/framer-templates",
  body: `
<section class="notfound"><div class="wrap">
  <p class="badge-pill">404</p>
  <h1 class="nf-h">This page <span class="it">wandered off.</span></h1>
  <p class="nf-p">The templates are all still here, though.</p>
  <a class="pill lg" href="/framer-templates/templates/index.html">Browse the templates</a>
</div></section>`,
}));
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
console.log("built:", ["index.html", ...templates.map(t => `templates/${t.slug}/`)].join(", "));
