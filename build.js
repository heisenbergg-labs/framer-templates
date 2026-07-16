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

const page = ({ title, description, body, root = ".", quiz = false, og = "assets/og/home.jpg", jsonld = null }) => `<!DOCTYPE html>
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
<nav><div class="wrap">
  <a class="wordmark" href="${root}/index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
  <div class="links">
    <a href="${root}/templates/index.html">Templates</a>
    <a href="${root}/index.html#how">How it works</a>
    <a class="pill" href="${root}/templates/index.html">Browse templates</a>
  </div>
</div></nav>
${body}
${quiz ? quizBlock(root) : ""}
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
      <a href="${root}/templates/index.html">All templates</a>
      <a href="${root}/index.html#why">Why a template</a>
      <a href="${root}/index.html#how">How it works</a>
      <a href="#" data-quiz-open>Find your template (quiz)</a>
    </div>
  </div>
</div></footer>
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

const tcard = (t, root = ".") => `
<a class="tcard reveal" data-free="${t.free}" data-cursor="${t.free ? "Free" : (t.status === "soon" ? "Soon" : esc(t.price))}" data-kind="${t.free ? "free" : "paid"}" href="${root}/templates/${t.slug}/index.html">
  <div class="frame"><div class="shot"><img src="${root}/${t.cover}" alt="${esc(t.name)} — website template preview" loading="lazy"></div><span class="ppill ${t.free ? "free" : "paid"}">${t.free ? "Free" : "Paid"}</span></div>
  <div class="meta">
    <h3>${esc(t.name)}${t.status === "soon" ? ' <span class="badge soon">Soon</span>' : ""}${t.new ? ' <span class="badge">New</span>' : ""}</h3>
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
  quiz: true,
  jsonld: { "@context": "https://schema.org", "@type": "WebSite", name: site.name + site.tld, url: site.baseUrl + "/", description: site.description },
  body: `
<header>
  <p class="eyebrow"><svg class="laurel" width="26" height="40" viewBox="0 0 26 44" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lgl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8a6a26"/><stop offset="0.45" stop-color="#e6c46a"/><stop offset="0.75" stop-color="#f9edbb"/><stop offset="1" stop-color="#c9a04b"/></linearGradient></defs><g fill="url(#lgl)"><path d="M22 42 C12 36 7 26 8 12" fill="none" stroke="url(#lgl)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 12 C7.5 7 9 3 12 0 C13.5 4 12.5 9 8 12 Z"/><path d="M9 16 C5 14 2.5 10.5 2.5 6 C7 7.5 9.5 11 9 16 Z"/><path d="M9.5 16.5 C13.5 15.5 17.5 16.5 20 19.5 C15.5 21 11.5 20 9.5 16.5 Z"/><path d="M10.5 24 C6.5 23.5 3.5 21 2 17 C6.5 17 10 20 10.5 24 Z"/><path d="M11 24.5 C15 24.5 18.5 26.5 20.5 30 C15.5 30.5 12 28.5 11 24.5 Z"/><path d="M13.5 31.5 C9.5 32 6 30.5 3.5 27.5 C8 26.5 12 28 13.5 31.5 Z"/><path d="M14 32 C17.5 33.5 20 36.5 20.5 40.5 C16 39.5 13.5 36.5 14 32 Z"/><path d="M17.5 38.5 C13.5 40 9.5 39.5 6.5 37 C10.5 35 15 35.5 17.5 38.5 Z"/></g></svg><span class="goldtext">Premium Framer templates</span><svg class="laurel r" width="26" height="40" viewBox="0 0 26 44" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="lgr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#8a6a26"/><stop offset="0.45" stop-color="#e6c46a"/><stop offset="0.75" stop-color="#f9edbb"/><stop offset="1" stop-color="#c9a04b"/></linearGradient></defs><g fill="url(#lgr)"><path d="M22 42 C12 36 7 26 8 12" fill="none" stroke="url(#lgr)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 12 C7.5 7 9 3 12 0 C13.5 4 12.5 9 8 12 Z"/><path d="M9 16 C5 14 2.5 10.5 2.5 6 C7 7.5 9.5 11 9 16 Z"/><path d="M9.5 16.5 C13.5 15.5 17.5 16.5 20 19.5 C15.5 21 11.5 20 9.5 16.5 Z"/><path d="M10.5 24 C6.5 23.5 3.5 21 2 17 C6.5 17 10 20 10.5 24 Z"/><path d="M11 24.5 C15 24.5 18.5 26.5 20.5 30 C15.5 30.5 12 28.5 11 24.5 Z"/><path d="M13.5 31.5 C9.5 32 6 30.5 3.5 27.5 C8 26.5 12 28 13.5 31.5 Z"/><path d="M14 32 C17.5 33.5 20 36.5 20.5 40.5 C16 39.5 13.5 36.5 14 32 Z"/><path d="M17.5 38.5 C13.5 40 9.5 39.5 6.5 37 C10.5 35 15 35.5 17.5 38.5 Z"/></g></svg></p>
  <h1>Premium templates<br><span class="it">easy to make yours.</span></h1>
  <p class="statement">Websites that look custom-built and edit like a slide deck. Copy one, put your words in, go live today.</p>
  <div class="ctas">
    <a class="pill lg" href="templates/index.html">Browse templates</a>
    <a class="textlink" href="#" data-quiz-open>Take the 60-second quiz <span class="arr">→</span></a>
  </div>
  <div class="hero-visual reveal">
    <img src="assets/covers/aubrey.jpg" alt="A premium website template, live in the browser">
  </div>
</header>

<section id="how" class="flow"><div class="wrap">
  <div class="flow-grid">
    <div class="flow-cell reveal">
      ${ART.triangle ? '<img class="icon3d" src="' + ART.triangle + '" alt="" aria-hidden="true">' : '<span class="icon3d icon3d-ph" aria-hidden="true"></span>'}
      <span class="steplab">01</span>
      <h3>Get a template</h3>
      <p>Buy one, or take a free one. It copies straight into your Framer account.</p>
    </div>
    <div class="flow-cell reveal">
      ${ART.sphere ? '<img class="icon3d" src="' + ART.sphere + '" alt="" aria-hidden="true">' : '<span class="icon3d icon3d-ph" aria-hidden="true"></span>'}
      <span class="steplab">02</span>
      <h3>Make it yours</h3>
      <p>Change the words, the photos, the colors. Everything edits by clicking on it.</p>
    </div>
    <div class="flow-cell reveal">
      ${ART.torus ? '<img class="icon3d" src="' + ART.torus + '" alt="" aria-hidden="true">' : '<span class="icon3d icon3d-ph" aria-hidden="true"></span>'}
      <span class="steplab">03</span>
      <h3>Connect your domain</h3>
      <p>Point your own domain at it in Framer's settings, or stay on the free link.</p>
    </div>
    <div class="flow-cell reveal">
      ${ART.slab ? '<img class="icon3d" src="' + ART.slab + '" alt="" aria-hidden="true">' : '<span class="icon3d icon3d-ph" aria-hidden="true"></span>'}
      <span class="steplab">04</span>
      <h3>Publish with Framer</h3>
      <p>One click and you're live. Hosting, speed and SSL are Framer's problem, not yours.</p>
    </div>
  </div>
</div></section>


<section id="templates" class="tight-top"><div class="wrap">
  <div class="head">
    <div>
      <h2>Find <span class="it">your</span> template</h2>
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
    <h2>A premium website, without<br><span class="it">the premium invoice</span></h2>
    <p class="sub">Because you don't need to spend thousands, or wait months, to look like you did.</p>
  </div>
  <div class="why-grid">
    ${WHY.map(w => `
    <div class="why-cell reveal">
      <h3>${esc(w.k)}</h3>
      <p>${esc(w.p)}</p>
    </div>`).join("\n")}
  </div>
</div></section>



<section><div class="wrap">
  <div class="center-head">
    <span class="badge-pill">Fair questions</span>
    <h2>Questions? <span class="it">Answers.</span></h2>
  </div>
  <div class="props">
    <div class="prop reveal"><div class="k">Are some really free?</div><p>The ones with the green badge — completely. No signup wall, no watermark, no "free trial". Take it and go.</p></div>
    <div class="prop reveal"><div class="k">Do I need to know code?</div><p>No. If you can edit a slide deck, you can edit these. Everything changes by clicking on it.</p></div>
    <div class="prop reveal"><div class="k">Why give any away free?</div><p>So you can see the quality is real before spending anything. The free ones are built to the same standard as the paid ones.</p></div>
    <div class="prop reveal"><div class="k">What do the paid ones cost?</div><p>One flat price, yours forever, use it as long as you like. Cheaper than one hour of a designer's time.</p></div>
  </div>
</div></section>

<section class="cta-open"><div class="wrap">
  <div class="cta-inner reveal">
    <h2>Can't pick <span class="it goldtext">one?</span></h2>
    <p>Answer three quick questions and we'll match you with your template — and take 30% off any paid one.</p>
    <a class="pill lg" href="#" data-quiz-open>Take the quiz</a>
  </div>
  <div class="wire-scene reveal">
    <svg class="wireline" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28 C 300 118, 900 118, 1200 28" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="2"/></svg>
    ${sorted.map((t, i) => {
      const L = [3, 22.25, 41.5, 60.75, 80];
      const T = [56, 86, 96, 86, 56];
      const R = [-2.4, 1.8, -1.2, 2.2, -1.8];
      const D = [5.4, 6.2, 4.8, 5.8, 6.6];
      const n = i % 5;
      return `<a class="hang" data-cursor="${t.free ? "Free" : (t.status === "soon" ? "Soon" : esc(t.price))}" data-kind="${t.free ? "free" : "paid"}" href="templates/${t.slug}/index.html" style="--l:${L[n]}%;--t:${T[n]}px;--tilt:${R[n]}deg;--d:${D[n]}s">
      <span class="peg"></span>
      <img src="${t.cover}" alt="${esc(t.name)} template hanging on the line" loading="lazy">
      <span class="cap">${esc(t.name)}</span>
    </a>`;
    }).join("\n    ")}
  </div>
</div></section>`,
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
