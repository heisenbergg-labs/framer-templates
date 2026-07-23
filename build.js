// Zero-dependency static build: templates.json -> dist/
// getsites v3 — curated template studio. Usage: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));
const { site, templates } = data;

const VER = Date.now().toString(36);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// free first, then paid cheapest-first (browsing order)
const sorted = [...templates]; // curated order = templates.json order
const live = sorted.filter(t => t.status !== "soon");
const upcoming = sorted.filter(t => t.status === "soon");
const featured = templates.find(t => t.slug === "still");
const CATS = [...new Set(sorted.map(t => t.category))];

const shot = (slug, kind) => {
  for (const ext of ["jpg", "png", "webp"]) {
    if (fs.existsSync(path.join(ROOT, "assets", "shots", `${slug}-${kind}.${ext}`))) return `assets/shots/${slug}-${kind}.${ext}`;
  }
  return null;
};

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Averia+Serif+Libre&family=Mrs+Saint+Delafield&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;1,8..60,400&display=swap" rel="stylesheet">`;

const QDATA = sorted.map(t => ({
  name: t.name, slug: t.slug, cat: t.category, price: t.price, free: !!t.free,
  soon: t.status === "soon", cover: t.cover, tag: t.tagline, bestFor: t.bestFor || [],
}));

/* ---------------- shared chrome ---------------- */
const NAV = (root, navDelay) => `
<nav><div class="wrap nav-row">
  <a class="wordmark" href="${root}/index.html">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></a>
  <div class="links">
    <a href="${root}/templates/index.html">Templates</a>
    <a href="${root}/templates/still/index.html">Featured template</a>
    <a href="#" data-letter-open>Studio</a>
    <a class="pill" href="#" data-quiz-open>Find my template</a>
  </div>
  <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
</div>
<div class="nav-sheet" hidden>
  <a href="${root}/templates/index.html">Templates</a>
  <a href="${root}/templates/still/index.html">Featured template</a>
  <a href="#" data-letter-open>Studio</a>
  <a class="pill" href="#" data-quiz-open>Find my template</a>
</div></nav>`;

const FOOT = (root) => `
<footer><div class="wrap">
  <div class="news-band">
    <div>
      <p class="news-k">New templates, released occasionally.</p>
      <p class="news-p">No weekly filler. One email when a release ships.</p>
    </div>
    <form class="news-form" data-capture="newsletter" novalidate>
      <input type="email" name="email" placeholder="Your email" autocomplete="email" required aria-label="Email for release notes">
      <button class="pill" type="submit">Get releases</button>
    </form>
  </div>
  <div class="foot-grid">
    <div class="foot-brand">
      <span class="wordmark">${esc(site.name)}<span class="tld">${esc(site.tld)}</span></span>
      <p>Original Framer websites<br>with a point of view.</p>
      <span class="mono-sm">© 2026 ${esc(site.name)}${esc(site.tld)}</span>
    </div>
    <div class="foot-col">
      <span class="mono-sm">SHOP</span>
      <a href="${root}/index.html#collection">All templates</a>
      <a href="${root}/index.html?cat=__free#collection">Free templates</a>
      <a href="${root}/templates/still/index.html">Featured template</a>
      <a href="${root}/index.html#signature">Upcoming release</a>
    </div>
    <div class="foot-col">
      <span class="mono-sm">HELP</span>
      <a href="${root}/support/index.html">Support</a>
      <a href="${root}/support/index.html#framer">Framer setup</a>
      <a href="mailto:support@getsites.co">support@getsites.co</a>
      <a href="${root}/license/index.html">Licensing</a>
      <a href="${root}/license/index.html#refunds">Refunds</a>
    </div>
    <div class="foot-col">
      <span class="mono-sm">STUDIO</span>
      <a href="#" data-letter-open>A letter from Carmy</a>
      <a href="#" data-quiz-open>Find your template</a>
      <a href="${root}/license/index.html">License agreement</a>
    </div>
  </div>
</div></footer>`;


/* ---------------- letter from Carmy ---------------- */
const letterBlock = (root) => `
<div id="letter" class="letter-ov" hidden role="dialog" aria-modal="true" aria-label="A letter from Carmy">
  <div class="letter-back" data-letter-close></div>
  <article class="letter-paper">
    <button class="letter-x" type="button" data-letter-close aria-label="Close letter">&times;</button>
    <div class="letter-head">
      <span class="letter-eyebrow">A LETTER FROM THE STUDIO</span>
      <svg class="letter-seal" width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="sealg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#c3b6ff"/><stop offset="0.55" stop-color="#8f7bff"/><stop offset="1" stop-color="#5b43d6"/></linearGradient></defs><circle cx="32" cy="32" r="30" fill="none" stroke="url(#sealg)" stroke-width="1.6"/><circle cx="32" cy="32" r="24.5" fill="none" stroke="url(#sealg)" stroke-width="0.8" stroke-dasharray="2.4 3"/><text x="32" y="42" font-family="Georgia,serif" font-size="28" fill="url(#sealg)" text-anchor="middle">C</text></svg>
    </div>
    <div class="letter-body">
      <p class="letter-hello">Hello,</p>
      <p>Before I started this studio, I watched the same thing happen over and over. A small business needs a website, gets quoted an agency price, and settles for something that looks like everyone else&rsquo;s. The tools were never the problem. Taste and time were.</p>
      <p>${site.name}${site.tld} exists to close that gap. Complete websites, designed with a point of view, that a normal person can open, edit and publish in a day. Your work deserves a site that actually converts, not just one that exists.</p>
      <p>Every template here is a site I would ship for a paying client. If it is not good enough for that, it does not get listed.</p>
      <p>Make something good with it.</p>
    </div>
    <div class="letter-sign">
      <span class="letter-script">Carmy</span>
      <span class="letter-role">The studio behind ${site.name}${site.tld}</span>
    </div>
    <a class="letter-cta" href="${root}/templates/index.html">Browse the templates <span class="arr">&rarr;</span></a>
  </article>
</div>
<script>
(function () {
  var ov = document.getElementById("letter");
  var last = null;
  function open() {
    last = document.activeElement;
    ov.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { ov.classList.add("in"); });
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "letter-open", event: true });
  }
  function close() {
    ov.classList.remove("in");
    document.body.style.overflow = "";
    setTimeout(function () { ov.hidden = true; }, 260);
    if (last && last.focus) last.focus();
  }
  document.addEventListener("click", function (e) {
    var o = e.target.closest ? e.target.closest("[data-letter-open]") : null;
    if (o) { e.preventDefault(); open(); return; }
    var c = e.target.closest ? e.target.closest("[data-letter-close]") : null;
    if (c && !ov.hidden) close();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !ov.hidden) close();
  });
})();
</script>`;

/* ---------------- quiz (match-first, no discount) ---------------- */
const quizBlock = (root) => `
<div id="quiz-overlay" hidden>
  <div class="quiz-card" role="dialog" aria-modal="true" aria-label="Find your template">
    <button class="quiz-x" type="button" aria-label="Close">&times;</button>
    <div class="quiz-step" data-step="intro">
      <span class="badge-pill">Not sure which one?</span>
      <h2 class="quiz-h">Find <span class="it">your</span> template</h2>
      <p class="quiz-p">Three quick questions. We match you with the right design and tell you why.</p>
      <button class="pill lg" type="button" data-next>Start matching</button>
    </div>
    <div class="quiz-step" data-step="contact" hidden>
      <p class="quiz-lab">Before we start</p>
      <h2 class="quiz-h">Where do we send <span class="it">your match?</span></h2>
      <form id="quiz-contact" novalidate>
        <input id="qcn" type="text" placeholder="Your name" autocomplete="name" required aria-label="Name">
        <input id="qce" type="email" placeholder="Your email" autocomplete="email" required aria-label="Email">
        <button class="pill lg" type="submit">Continue</button>
      </form>
      <p class="quiz-fine">Your match and the 25% code land here too. No spam, ever.</p>
    </div>
    <div class="quiz-step" data-step="build" hidden>
      <p class="quiz-lab">01 of 03</p>
      <h2 class="quiz-h">What are you <span class="it">building?</span></h2>
      <div class="quiz-opts">
        <button type="button" data-pick="portfolio">A portfolio</button>
        <button type="button" data-pick="hospitality">A stay, club or restaurant site</button>
        <button type="button" data-pick="business">A business site</button>
        <button type="button" data-pick="fun">Something people will remember</button>
      </div>
    </div>
    <div class="quiz-step" data-step="feel" hidden>
      <p class="quiz-lab">02 of 03</p>
      <h2 class="quiz-h">How should it <span class="it">feel?</span></h2>
      <div class="quiz-opts">
        <button type="button" data-pick="warm">Warm and personal</button>
        <button type="button" data-pick="lux">Quiet and luxurious</button>
        <button type="button" data-pick="editorial">Editorial and precise</button>
        <button type="button" data-pick="playful">Playful and surprising</button>
      </div>
    </div>
    <div class="quiz-step" data-step="matters" hidden>
      <p class="quiz-lab">03 of 03</p>
      <h2 class="quiz-h">What matters <span class="it">most?</span></h2>
      <div class="quiz-opts">
        <button type="button" data-pick="photos">My photos doing the talking</button>
        <button type="button" data-pick="credibility">Looking established</button>
        <button type="button" data-pick="content">Publishing events or journal posts</button>
        <button type="button" data-pick="standout">Standing out completely</button>
      </div>
    </div>
    <div class="quiz-step" data-step="reward" hidden>
      <p class="quiz-lab">Your reward</p>
      <h2 class="quiz-h">A little <span class="it">thank you.</span></h2>
      <div class="reveal-code blurred" id="reveal-code" role="button" tabindex="0" aria-label="Discount code">SITES25</div>
      <p class="quiz-p" id="reveal-note">Use this code at checkout. 25% off any template.</p>
      <button class="pill lg" type="button" id="reveal-btn">Reveal my code</button>
      <button class="pill lg" type="button" data-next hidden id="reveal-next">See the recommended template <span class="arr">&rarr;</span></button>
    </div>
    <div class="quiz-step" data-step="result" hidden>
      <h2 class="quiz-h" id="quiz-result-h">Made <span class="it">for you.</span></h2>
      <div class="quiz-matches" id="quiz-matches"></div>
      <p class="quiz-why" id="quiz-why"></p>
      <div class="quiz-code">
        <button class="qc-chip" type="button" id="qc-copy">SITES25</button>
        <span class="qc-note">25% off at checkout &middot; tap to copy</span>
      </div>
      <a class="textlink" href="${root}/index.html#collection">or browse everything <span class="arr">&rarr;</span></a>
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
  var order = ["intro", "contact", "build", "feel", "matters", "reward", "result"];
  var at = 0;
  var picks = { build: null, feel: null, matters: null };
  var lead = { name: "", email: "" };
  function show(i) { at = i; steps.forEach(function (st) { st.hidden = st.dataset.step !== order[i]; }); ov.scrollTop = 0; }
  function open() { ov.hidden = false; document.body.style.overflow = "hidden"; show(0); trapOn(ov); if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-open", title: "Quiz opened", event: true }); }
  function close() { ov.hidden = true; document.body.style.overflow = ""; trapOff(); localStorage.setItem("gs_quiz_seen", "1"); }
  function score() {
    var scored = DATA.map(function (t) {
      var sc = 0;
      var b = picks.build, f = picks.feel, m = picks.matters;
      if (b === "portfolio" && t.cat === "Portfolio") sc += 3;
      if (b === "hospitality" && t.cat === "Hospitality") sc += 3;
      if (b === "business" && t.cat === "Business") sc += 3;
      if (b === "fun" && t.slug === "nostalgia-exe") sc += 4;
      if (f === "warm" && t.slug === "fern-hollow") sc += 2;
      if (f === "lux" && (t.slug === "the-aubrey" || t.slug === "brookmere")) sc += 2;
      if (f === "editorial" && (t.slug === "still" || t.slug === "brookmere")) sc += 2;
      if (f === "playful" && t.slug === "nostalgia-exe") sc += 3;
      if (m === "photos" && (t.slug === "still" || t.slug === "fern-hollow")) sc += 2;
      if (m === "credibility" && t.slug === "brookmere") sc += 2;
      if (m === "content" && t.slug === "the-aubrey") sc += 2;
      if (m === "standout" && t.slug === "nostalgia-exe") sc += 3;
      if (t.soon) sc -= 1;
      return { t: t, sc: sc };
    }).sort(function (a, b) { return b.sc - a.sc; });
    return scored.slice(0, 2).map(function (x) { return x.t; });
  }
  function finish() {
    var picked = score();
    lastMatches = picked.map(function (t) { return t.name; }).join(", ");
    var top = picked[0], alt = picked[1];
    var html = "<a class='quiz-match hero' href='" + ROOT + "/templates/" + top.slug + "/index.html'>" +
      "<img src='" + ROOT + "/" + top.cover + "' alt=''>" +
      "<span class='qm-meta'><b>" + top.name + " <em>Recommended</em></b><i>" + top.cat + " \u00b7 " + top.price + "</i><span class='qm-cta'>Open " + top.name + " \u2192</span></span></a>";
    if (alt) html += "<a class='quiz-alt' href='" + ROOT + "/templates/" + alt.slug + "/index.html'>Also fits: <b>" + alt.name + "</b> \u00b7 " + alt.cat + " \u00b7 " + alt.price + " <span class='arr'>\u2192</span></a>";
    document.getElementById("quiz-matches").innerHTML = html;
    document.getElementById("quiz-why").textContent = top.name + " is built for " + (top.bestFor[0] || top.cat.toLowerCase()).toLowerCase() + ", matched to your answers.";
    show(order.indexOf("reward"));
    if (HOOK && lead.email) {
      fetch(HOOK, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({
        name: lead.name, email: lead.email, prof: "quiz", plan: picks.build || "", matches: lastMatches, page: location.pathname,
      }).toString() });
      localStorage.setItem("gs_lead_sent", "1");
      if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-lead", title: "Lead: quiz", event: true });
    }
    if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "quiz-complete", title: "Quiz completed", event: true });
  }
  var cf = document.getElementById("quiz-contact");
  if (cf) cf.addEventListener("submit", function (ev) {
    ev.preventDefault();
    var n = document.getElementById("qcn"), em = document.getElementById("qce");
    if (!n.value.trim()) { n.focus(); return; }
    if (!em.value || em.value.indexOf("@") < 1) { em.focus(); return; }
    lead.name = n.value.trim(); lead.email = em.value.trim();
    show(order.indexOf("build"));
  });
  ov.addEventListener("click", function (e) {
    if (e.target === ov) { if (order[at] === "intro") close(); return; }
    if (e.target.closest(".quiz-x")) { close(); return; }
    var nx = e.target.closest("[data-next]");
    if (nx) { show(at + 1); return; }
    var pk = e.target.closest("[data-pick]");
    if (pk) {
      picks[order[at]] = pk.dataset.pick;
      if (order[at] === "matters") finish(); else show(at + 1);
    }
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !ov.hidden) close(); });
  document.addEventListener("click", function (e) {
    var o = e.target.closest ? e.target.closest("[data-quiz-open]") : null;
    if (o) { e.preventDefault(); open(); }
  });
  if (!localStorage.getItem("gs_quiz_seen") && !localStorage.getItem("gs_lead_sent")) {
    setTimeout(function () { if (ov.hidden) open(); }, 12000);
  }
  var rb = document.getElementById("reveal-btn");
  var rc = document.getElementById("reveal-code");
  var rn = document.getElementById("reveal-next");
  if (rb) rb.addEventListener("click", function () {
    rc.classList.remove("blurred");
    rb.hidden = true;
    rn.hidden = false;
    document.getElementById("reveal-note").textContent = "Tap the code to copy it. It works on every template.";
    if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "code-reveal", title: "Code revealed", event: true });
  });
  if (rc) rc.addEventListener("click", function () {
    if (rc.classList.contains("blurred")) return;
    var done = function () {
      var t = rc.querySelector(".copy-toast");
      if (!t) { t = document.createElement("span"); t.className = "copy-toast"; t.textContent = "Copied \u2713"; rc.appendChild(t); }
      requestAnimationFrame(function () { t.classList.add("on"); });
      clearTimeout(t._h);
      t._h = setTimeout(function () { t.classList.remove("on"); }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText("SITES25").then(done, done); else done();
  });
  var qc = document.getElementById("qc-copy");
  if (qc) qc.addEventListener("click", function () {
    var done = function () { qc.textContent = "Copied \u2713"; setTimeout(function () { qc.textContent = "SITES25"; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText("SITES25").then(done, done); else done();
  });

  // shared email capture: quiz save, newsletter, waitlist -> one webhook
  document.querySelectorAll("form[data-capture]").forEach(function (f) {
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var em = f.querySelector("input[type=email]");
      if (!em || !em.value || em.value.indexOf("@") < 1) { if (em) em.focus(); return; }
      if (HOOK) {
        var body = new URLSearchParams({
          name: f.dataset.capture, email: em.value.trim(),
          prof: f.dataset.capture, plan: picks.build || "",
          matches: f.dataset.capture === "quiz" ? lastMatches : (f.dataset.tpl || ""),
          page: location.pathname,
        });
        fetch(HOOK, { method: "POST", mode: "no-cors", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString() });
      }
      localStorage.setItem("gs_lead_sent", "1");
      var done = document.createElement("p");
      done.className = "quiz-sent";
      done.textContent = f.dataset.capture === "waitlist" ? "You're on the list." : "Sent. Watch your inbox.";
      f.replaceWith(done);
      if (window.goatcounter && goatcounter.count) goatcounter.count({ path: f.dataset.capture + "-lead", title: "Lead: " + f.dataset.capture, event: true });
    });
  });

  // minimal focus trap
  var trapped = null;
  function trapOn(el) { trapped = el; }
  function trapOff() { trapped = null; }
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || !trapped || trapped.hidden) return;
    var f = trapped.querySelectorAll("button, a[href], input, select, [tabindex]");
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.gsTrap = { on: trapOn, off: trapOff };

  // mobile nav sheet
  var burger = document.querySelector(".nav-burger");
  var sheet = document.querySelector(".nav-sheet");
  if (burger && sheet) burger.addEventListener("click", function () {
    var open = sheet.hidden;
    sheet.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.classList.toggle("on", open);
  });
})();
</script>`;

/* ---------------- quick look ---------------- */

/* ---------------- page wrapper ---------------- */
const page = ({ title, description, body, root = ".", og = "assets/og/home.jpg", jsonld = null, navDelay = false }) => `<!DOCTYPE html>
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
<link rel="icon" type="image/png" href="/assets/brand/globe-round-96.png">
<link rel="apple-touch-icon" href="/assets/brand/globe-round.png">
${FONTS}
<link rel="stylesheet" href="${root}/style.css?v=${VER}">
<script data-goatcounter="https://getsites.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>
</head>
<body>
<div id="sale-bar" hidden>
  <button class="sb-msg" type="button" data-quiz-open>LAUNCH SALE &middot; Take the 60 second quiz, get <b>25% off</b> your match <span class="arr">&rarr;</span></button>
  <button class="sb-x" type="button" aria-label="Dismiss">&times;</button>
</div>
<script>
(function () {
  var sb = document.getElementById("sale-bar");
  if (!sessionStorage.getItem("gs_sale_x")${navDelay ? " && false" : ""}) sb.hidden = false;
  sb.querySelector(".sb-x").addEventListener("click", function () {
    sb.hidden = true;
    sessionStorage.setItem("gs_sale_x", "1");
  });
})();
</script>
${NAV(root, navDelay)}
${navDelay ? `<script>
(function () {
  var sb = document.getElementById("sale-bar");
  setTimeout(function () {
    if (sb && !sessionStorage.getItem("gs_sale_x")) { sb.hidden = false; sb.classList.add("sb-in"); }
  }, 6000);
})();
</script>` : ""}
${body}
${quizBlock(root)}
${letterBlock(root)}
${FOOT(root)}
<div id="cursor-chip" aria-hidden="true"></div>
<script>
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.1 });
  const pending = [];
  document.querySelectorAll(".reveal").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) { el.classList.add("in"); return; }
    el.classList.add("pre"); io.observe(el); pending.push(el);
  });
  setTimeout(() => { pending.forEach(el => el.classList.add("in")); }, 2500);
}
if (matchMedia("(pointer: fine) and (hover: hover)").matches) {
  const chip = document.getElementById("cursor-chip");
  let card = null;
  document.addEventListener("touchstart", () => { chip.className = ""; }, { passive: true });
  document.addEventListener("mousemove", e => {
    const c = e.target.closest ? e.target.closest("[data-cursor]") : null;
    if (c !== card) {
      card = c;
      if (card) { chip.textContent = card.dataset.cursor; chip.className = "on " + card.dataset.kind; }
      else chip.className = "";
    }
    if (card) chip.style.transform = "translate3d(" + (e.clientX + 20) + "px," + (e.clientY + 14) + "px,0)";
  }, { passive: true });
}
</script>
</body>
</html>`;

/* ---------------- catalog card ---------------- */
const statusBadge = (t) => t.status === "soon" ? '<span class="badge soon">Coming soon</span>' : (t.new ? '<span class="badge">New</span>' : "");
const priceLabel = (t) => t.free ? '<span class="price-r free">Free</span>' : `<span class="price-r">${esc(t.price)}</span>`;

const card = (t, root = ".") => `
<article class="tcard reveal" data-free="${t.free}" data-cat="${esc(t.category)}" data-name="${esc(t.name)}">
  <div class="frame-wrap">
    <a class="frame" href="${root}/templates/${t.slug}/index.html" data-cursor="${t.free ? "Free" : (t.status === "soon" ? "Soon" : esc(t.price))}" data-kind="${t.free ? "free" : "paid"}" aria-label="${esc(t.name)}">
      <img src="${root}/${t.cover}" alt="${esc(t.name)} website template" loading="lazy">
    </a>
  </div>
  <div class="meta">
    <div class="meta-l">
      <h3><a href="${root}/templates/${t.slug}/index.html">${esc(t.name)}</a>${statusBadge(t)}</h3>
      <p class="line2">${esc(t.category)} &middot; ${t.free ? "Free" : esc(t.price)}</p>
    </div>
  </div>
</article>`;

/* ---------------- collection (shared: home + /templates/) ---------------- */
const collectionSec = (root, standalone) => `
<section id="collection" class="collection-sec${standalone ? " standalone" : ""}"><div class="wrap">
  ${standalone ? `<div class="col-head">
    <div>
      <h1 class="serif">The <span class="it">collection</span></h1>
    </div>
    <div class="q-wrap"><input id="q" type="search" placeholder="Search" autocomplete="off" aria-label="Search templates"><span class="q-kbd">⌘K</span></div>
  </div>` : ""}
  <div class="seg" role="tablist" aria-label="Filter templates">
    <button class="seg-b on" type="button" data-cat="all">All</button>
    <button class="seg-b" type="button" data-cat="__free">Free</button>
    <button class="seg-b" type="button" data-cat="__paid">Paid</button>
  </div>
  <div class="grid" id="tgrid">
    ${live.map(t => card(t, root)).join("\n")}
  </div>
  <div id="empty" class="grid-empty" hidden>
    <p class="serifline">Nothing here <span class="it">yet.</span></p>
    <p class="sub">No templates match that filter.</p>
  </div>
</div></section>`;

const collectionScript = `
<script>
(function () {
  var state = { q: "", cat: "all" };
  var grid = document.getElementById("tgrid");
  var cards = [].slice.call(grid.querySelectorAll(".tcard"));
  var empty = document.getElementById("empty");
  function apply() {
    var vis = 0;
    cards.forEach(function (c) {
      var okCat = state.cat === "all" || (state.cat === "__free" ? c.dataset.free === "true" : state.cat === "__paid" ? c.dataset.free === "false" : c.dataset.cat === state.cat);
      var okQ = !state.q || (c.dataset.name + " " + c.dataset.cat + " " + c.textContent).toLowerCase().indexOf(state.q) !== -1;
      var on = okCat && okQ;
      c.style.display = on ? "" : "none";
      if (on) vis++;
    });
    empty.hidden = vis !== 0;
  }
  var q = document.getElementById("q");
  if (q) {
    q.addEventListener("input", function () { state.q = this.value.trim().toLowerCase(); apply(); });
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); q.focus(); }
    });
  }
  document.querySelectorAll(".seg-b").forEach(function (b) {
    b.addEventListener("click", function () {
      document.querySelectorAll(".seg-b").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      state.cat = b.dataset.cat;
      apply();
    });
  });
  var qs = new URLSearchParams(location.search);
  if (qs.get("cat")) {
    state.cat = qs.get("cat");
    document.querySelectorAll(".seg-b").forEach(function (x) { x.classList.toggle("on", x.dataset.cat === state.cat); });
    apply();
  }
})();
</script>`;

/* ---------------- hero visual (optional asset) ---------------- */
const HERO_VISUAL = ["png", "jpg", "webp"].map(e => `assets/brand/hero-visual.${e}`).find(p => fs.existsSync(path.join(ROOT, p))) || null;

/* ---------------- home ---------------- */
const home = page({
  navDelay: true,
  title: site.title,
  description: site.description,
  og: "assets/og/home.jpg",
  jsonld: { "@context": "https://schema.org", "@type": "WebSite", name: site.name + site.tld, url: site.baseUrl + "/", description: site.description },
  body: `
<header class="hero centered">
  <div class="wrap">
    <p class="eyebrow-laurel"><svg class="laurel" width="24" height="37" viewBox="0 0 26 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="lgl" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#463a99"/><stop offset="0.45" stop-color="#8f7bff"/><stop offset="0.75" stop-color="#d9cfff"/><stop offset="1" stop-color="#745cff"/></linearGradient></defs><g fill="url(#lgl)"><path d="M22 42 C12 36 7 26 8 12" fill="none" stroke="url(#lgl)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 12 C7.5 7 9 3 12 0 C13.5 4 12.5 9 8 12 Z"/><path d="M9 16 C5 14 2.5 10.5 2.5 6 C7 7.5 9.5 11 9 16 Z"/><path d="M9.5 16.5 C13.5 15.5 17.5 16.5 20 19.5 C15.5 21 11.5 20 9.5 16.5 Z"/><path d="M10.5 24 C6.5 23.5 3.5 21 2 17 C6.5 17 10 20 10.5 24 Z"/><path d="M11 24.5 C15 24.5 18.5 26.5 20.5 30 C15.5 30.5 12 28.5 11 24.5 Z"/><path d="M13.5 31.5 C9.5 32 6 30.5 3.5 27.5 C8 26.5 12 28 13.5 31.5 Z"/><path d="M14 32 C17.5 33.5 20 36.5 20.5 40.5 C16 39.5 13.5 36.5 14 32 Z"/><path d="M17.5 38.5 C13.5 40 9.5 39.5 6.5 37 C10.5 35 15 35.5 17.5 38.5 Z"/></g></svg><span class="goldtext">Premium Framer templates</span><svg class="laurel r" width="24" height="37" viewBox="0 0 26 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="lgr" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#463a99"/><stop offset="0.45" stop-color="#8f7bff"/><stop offset="0.75" stop-color="#d9cfff"/><stop offset="1" stop-color="#745cff"/></linearGradient></defs><g fill="url(#lgr)"><path d="M22 42 C12 36 7 26 8 12" fill="none" stroke="url(#lgr)" stroke-width="1.6" stroke-linecap="round"/><path d="M8 12 C7.5 7 9 3 12 0 C13.5 4 12.5 9 8 12 Z"/><path d="M9 16 C5 14 2.5 10.5 2.5 6 C7 7.5 9.5 11 9 16 Z"/><path d="M9.5 16.5 C13.5 15.5 17.5 16.5 20 19.5 C15.5 21 11.5 20 9.5 16.5 Z"/><path d="M10.5 24 C6.5 23.5 3.5 21 2 17 C6.5 17 10 20 10.5 24 Z"/><path d="M11 24.5 C15 24.5 18.5 26.5 20.5 30 C15.5 30.5 12 28.5 11 24.5 Z"/><path d="M13.5 31.5 C9.5 32 6 30.5 3.5 27.5 C8 26.5 12 28 13.5 31.5 Z"/><path d="M14 32 C17.5 33.5 20 36.5 20.5 40.5 C16 39.5 13.5 36.5 14 32 Z"/><path d="M17.5 38.5 C13.5 40 9.5 39.5 6.5 37 C10.5 35 15 35.5 17.5 38.5 Z"/></g></svg></p>
    <h1>Your website, ready in <span class="it">ten minutes.</span></h1>
    <p class="statement">Pick a template, change the words and photos, connect your domain. No code, no designer needed.</p>
    <div class="ctas">
      <a class="pill lg" href="#collection">Browse the collection</a>
      <a class="textlink" href="#" data-quiz-open>Find my template <span class="arr">&rarr;</span></a>
    </div>
    ${HERO_VISUAL ? `<div class="hero-visual"><img src="${HERO_VISUAL}" alt="A getsites template on screen"></div>` : ""}
  </div>
</header>

${collectionSec(".")}

<section class="steps-sec"><div class="wrap">
  <div class="sec-head">
    <h2 class="serif">Three steps to <span class="it">yours</span></h2>
  </div>
  <div class="steps3 stepcards">
    <div class="stepcard reveal">
      <div class="sc-top"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a390ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M4 7l1-3h14l1 3M4 7v13h16V7"/><path d="M9 20v-6h6v6"/></svg><span class="mono-sm sc-num">01</span></div>
      <div class="sc-bottom"><h3>Choose your template</h3><p>Browse the collection. Every demo is the real site, click through it before you decide.</p></div>
    </div>
    <div class="stepcard reveal">
      <div class="sc-top"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a390ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg><span class="mono-sm sc-num">02</span></div>
      <div class="sc-bottom"><h3>Customize in Framer</h3><p>The whole site copies into your free Framer account. Swap words, photos and colors. No code.</p></div>
    </div>
    <div class="stepcard reveal">
      <div class="sc-top"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#a390ff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2 0-2.8a2 2 0 0 0-3-.2Z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.9 12.9 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.4 22.4 0 0 1-4 2Z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg><span class="mono-sm sc-num">03</span></div>
      <div class="sc-bottom"><h3>Publish and launch</h3><p>Connect your domain and hit publish. Hosting, speed and SSL are handled by Framer.</p></div>
    </div>
  </div>
</div></section>

${site.bundle && site.bundle.checkout ? `<section id="pricing" class="pricing-sec"><div class="wrap">
  <div class="sec-head"><h2 class="serif">One template, or <span class="it">all of them.</span></h2></div>
  <div class="price-grid">
    <div class="price-card reveal">
      <h3>One template</h3>
      <p class="pc-sub">Pick the one that fits. Perfect for a single website.</p>
      <p class="pc-price"><span class="pc-from">From</span> $24</p>
      <a class="pill" href="#collection">Choose your template</a>
      <ul class="check-list">
        <li>One complete website</li>
        <li>One-site license, commercial use</li>
        <li>Free updates through your remix link</li>
      </ul>
    </div>
    <div class="price-card dark reveal">
      <h3>${esc(site.bundle.name)}</h3>
      <p class="pc-sub">${esc(site.bundle.note)}</p>
      <p class="pc-price">${esc(site.bundle.price)}</p>
      <a class="pill light" href="${site.bundle.checkout}" target="_blank" rel="noreferrer">Get all access</a>
      <ul class="check-list">${site.bundle.includes.map(i => `<li>${esc(i)}</li>`).join("")}</ul>
    </div>
  </div>
</div></section>` : ""}

${upcoming.length ? `<section id="signature" class="sig-sec"><div class="wrap">
  ${upcoming.map(t => `
  <article class="sig-card reveal">
    <div class="sig-info">
      <span class="mono gold">SIGNATURE RELEASE 01</span>
      <h2 class="serif big">${esc(t.name)}</h2>
      <p class="sig-tag">${esc(t.tagline)}</p>
      <ul class="ind-list">${(t.features || []).slice(0, 3).map(f => `<li>${esc(f)}</li>`).join("")}</ul>
      <form class="news-form sig-form" data-capture="waitlist" data-tpl="${esc(t.name)}" novalidate>
        <input type="email" name="email" placeholder="Your email" autocomplete="email" required aria-label="Email for early access">
        <button class="pill" type="submit">Join early access</button>
      </form>
    </div>
    <div class="sig-shot-wrap">
      <a class="sig-shot" href="templates/${t.slug}/index.html"><img src="${t.cover}" alt="${esc(t.name)} concept preview"></a>
    </div>
  </article>`).join("")}
</div></section>` : ""}

${site.bundle && site.bundle.checkout ? `<div id="feat-nudge" class="bundle-nudge" hidden>
  <button class="fn-x" type="button" aria-label="Dismiss">&times;</button>
  <button class="fn-body" type="button" id="bundle-nudge-open">
    <span class="fn-txt">
      <span class="mono gold">ALL ACCESS</span>
      <b>Every template &middot; ${esc(site.bundle.price)}</b>
      <span class="fn-sub">${esc(site.bundle.note)}</span>
    </span>
    <span class="fn-covers">
      ${live.filter(t => !t.free).slice(0, 3).map(t => `<img src="${t.cover}" alt="">`).join("")}
      ${upcoming.slice(0, 1).map(t => `<img src="${t.cover}" alt="">`).join("")}
    </span>
  </button>
</div>

<div id="bundle-modal" hidden role="dialog" aria-modal="true" aria-label="All access bundle">
  <div class="bm-back" data-bm-close></div>
  <div class="bm-card">
    <button class="bm-x" type="button" data-bm-close aria-label="Close">&times;</button>
    <span class="mono gold">ALL ACCESS</span>
    <h2 class="serif">Everything, <span class="it">one payment.</span></h2>
    <div class="bm-covers">
      ${live.filter(t => !t.free).map(t => `<figure><img src="${t.cover}" alt="${esc(t.name)}"><figcaption>${esc(t.name)} &middot; ${esc(t.price)}</figcaption></figure>`).join("")}
      ${upcoming.slice(0, 1).map(t => `<figure class="bm-flag"><img src="${t.cover}" alt="${esc(t.name)}"><figcaption>${esc(t.name)} &middot; <em>Upcoming flagship, included</em></figcaption></figure>`).join("")}
    </div>
    <ul class="check-list bm-list">${(site.bundle.includes || []).map(i => `<li>${esc(i)}</li>`).join("")}</ul>
    <div class="bm-cta">
      <span class="bm-price">${esc(site.bundle.price)}</span>
      <a class="pill lg" href="${site.bundle.checkout}" target="_blank" rel="noreferrer">Get all access</a>
    </div>
  </div>
</div>
<script>
(function () {
  var n = document.getElementById("feat-nudge");
  var bm = document.getElementById("bundle-modal");
  if (!n || !bm) return;
  var quiz = document.getElementById("quiz-overlay");
  function show() {
    if (quiz && !quiz.hidden) { setTimeout(show, 8000); return; }
    n.hidden = false;
    requestAnimationFrame(function () { n.classList.add("in"); });
  }
  if (!sessionStorage.getItem("gs_feat_x")) setTimeout(show, 18000);
  n.querySelector(".fn-x").addEventListener("click", function () {
    n.classList.remove("in");
    sessionStorage.setItem("gs_feat_x", "1");
    setTimeout(function () { n.hidden = true; }, 300);
  });
  function openModal() {
    bm.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(function () { bm.classList.add("in"); });
    if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "bundle-modal", title: "Bundle modal", event: true });
  }
  function closeModal() {
    bm.classList.remove("in");
    document.body.style.overflow = "";
    setTimeout(function () { bm.hidden = true; }, 250);
  }
  document.getElementById("bundle-nudge-open").addEventListener("click", function () { n.classList.remove("in"); openModal(); });
  bm.addEventListener("click", function (e) { if (e.target.closest("[data-bm-close]")) closeModal(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !bm.hidden) closeModal(); });
})();
</script>` : ""}

${collectionScript}`,
});

/* ---------------- templates page ---------------- */
const templatesPage = page({
  title: `Templates | ${site.name}${site.tld}`,
  description: "The full getsites collection of original Framer templates.",
  root: "..",
  og: "assets/og/home.jpg",
  body: `
${collectionSec("..", true)}

${collectionScript}`,
});

/* ---------------- detail pages ---------------- */
const TIERS = {
  Free: "A complete starter design, free forever. Judge the quality before spending anything.",
  Standard: "A focused template. Core pages, responsive components and free updates.",
  Premium: "A complete business template. More pages, CMS collections and richer interactions.",
  Signature: "An experimental concept with custom interactions and extensive components.",
};

const detail = (t) => {
  const related = live.filter(x => x.slug !== t.slug && x.category === t.category)
    .concat(live.filter(x => x.slug !== t.slug && x.category !== t.category)).slice(0, 3);
  const price = t.free ? "0" : String(t.price).replace(/[^0-9.]/g, "");
  const soon = t.status === "soon";
  const inner = shot(t.slug, "inner"), page2 = shot(t.slug, "page2"), mobile = shot(t.slug, "mobile");
  const buyHref = t.checkout || t.get;
  return page({
    title: `${t.name}, ${t.category.toLowerCase()} website template${t.free ? " (free)" : ""} | ${site.name}${site.tld}`,
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
      offers: { "@type": "Offer", price: price, priceCurrency: "USD", availability: soon ? "https://schema.org/PreOrder" : "https://schema.org/InStock", url: buyHref },
    },
    body: `
<div class="wrap crumb mono-sm"><a href="../../index.html">Home</a> &nbsp;/&nbsp; <a href="../../templates/index.html">Templates</a> &nbsp;/&nbsp; ${esc(t.name)}</div>
<div class="wrap pd">
  <div class="pd-gallery">
    <div class="pd-main" id="pd-main"><img id="pd-img" src="../../${(t.gallery && t.gallery[0]) || t.cover}" alt="${esc(t.name)} website template preview"></div>
    ${(() => { const g = t.gallery || [t.cover, inner, page2].filter(Boolean); const items = g.map((src, i) => `<button class="pd-th${i === 0 ? " on" : ""}" type="button" data-src="../../${src}"><img src="../../${src}" alt="" loading="lazy"></button>`); if (t.video) items.push(`<button class="pd-th pd-th-video" type="button" data-video="${t.video}"><img src="../../${(t.gallery && t.gallery[0]) || t.cover}" alt=""><span class="pd-play">&#9654;</span></button>`); return items.length > 1 ? `<div class="pd-thumbs">\n      ${items.join("\n      ")}\n    </div>` : ""; })()}
  </div>
  <div class="pd-info">
    <p class="cat mono">${esc(t.name.toUpperCase())} &middot; ${esc(t.category.toUpperCase())} TEMPLATE FOR FRAMER</p>
    <h1 class="serif">${esc(t.tagline)}</h1>
    <p class="desc">${esc(t.description)}</p>
    <div class="pd-div"></div>
    <div class="price-row">
      <span class="price">${esc(t.price)}</span>
      ${t.free || soon ? "" : `<a class="textlink pd-quiz" href="#" data-quiz-open>Take the quiz, get 25% off <span class="arr">&rarr;</span></a>`}
    </div>
    <div class="actions pd-actions">
      ${soon
        ? `<form class="news-form" data-capture="waitlist" data-tpl="${esc(t.name)}" novalidate>
             <input type="email" name="email" placeholder="Your email" autocomplete="email" required aria-label="Email for early access">
             <button class="pill" type="submit">Join early access</button>
           </form>`
        : `<a class="btn-primary" href="${buyHref}" target="_blank" rel="noreferrer">${t.free ? "Get free template" : `Get this template &middot; ${esc(t.price)}`}</a>
           <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Preview live demo</a>`}
    </div>
    ${soon ? "" : `<p class="pd-trust mono-sm">FREE UPDATES &nbsp;&middot;&nbsp; ONE-SITE LICENSE &nbsp;&middot;&nbsp; REMIX LINK AFTER CHECKOUT</p>`}
  </div>
</div>
<script>
document.querySelectorAll(".pd-th").forEach(function (b) {
  b.addEventListener("click", function () {
    var main = document.getElementById("pd-main");
    if (b.dataset.video) {
      main.innerHTML = "<video src='" + b.dataset.video + "' controls autoplay muted playsinline loop></video>";
    } else {
      main.innerHTML = "<img id='pd-img' src='" + b.dataset.src + "' alt=''>";
    }
    document.querySelectorAll(".pd-th").forEach(function (x) { x.classList.remove("on"); });
    b.classList.add("on");
  });
});
</script>

<section class="more-sec"><div class="wrap">
  <div class="more-head">
    <h2 class="serif">More <span class="it">templates</span></h2>
    <a class="textlink" href="../../templates/index.html">See all <span class="arr">&rarr;</span></a>
  </div>
  <div class="grid rel3">
    ${related.map(r => card(r, "../..")).join("\n")}
  </div>
</div></section>
`,
  });
};

/* ---------------- studio pages ---------------- */

const supportPage = page({
  title: `Support | ${site.name}${site.tld}`,
  description: "Setup help, Framer guidance and support for getsites templates.",
  root: "..",
  body: `
<section class="doc-sec"><div class="wrap doc">
  <span class="mono gold">HELP</span>
  <h1 class="serif">Support</h1>
  <p>Every template is built to be edited without code. This page covers the common questions. Anything else, email <a href="mailto:support@getsites.co">support@getsites.co</a> and a human answers.</p>
  <h2 class="serif" id="framer">Framer setup</h2>
  <ul class="check-list">
    <li><b>Do I need Framer?</b> Yes. Templates open and edit in a free Framer account.</li>
    <li><b>Do I need a paid Framer plan?</b> Only to connect a custom domain and remove Framer's badge. Editing and free-link publishing work on the free plan.</li>
    <li><b>How do I get the template?</b> Free templates: open the live site and hit Use for free. Paid templates: buy from the live site, the remix link arrives with your receipt.</li>
    <li><b>How do I edit?</b> Click any text or image on the canvas and change it. Or open Framer's AI agent and describe what you want changed.</li>
    <li><b>Fonts and images?</b> Fonts are free Google Fonts, loaded automatically. Demo photography is licensed for the demo; replace it with your own before launch.</li>
  </ul>
  <h2 class="serif">Updates</h2>
  <p>When a template is improved, the remix link serves the newest version. Your published site never changes unless you republish it.</p>
  <h2 class="serif">Licensing and refunds</h2>
  <p>One website per purchase, commercial use allowed. Full terms and the refund policy live on the <a href="../license/index.html">license page</a>.</p>
  <h2 class="serif" id="contact">Contact</h2>
  <p>Support and setup questions: <a href="mailto:support@getsites.co">support@getsites.co</a>. Anything else: <a href="mailto:hello@getsites.co">hello@getsites.co</a>. Replies within a day, usually much faster.</p>
  <div class="ctas"><a class="pill lg" href="../index.html#collection">Back to the collection</a></div>
</div></section>`,
});

const licensePage = page({
  title: `License | ${site.name}${site.tld}`,
  description: "The getsites template license: one website per purchase, commercial use allowed.",
  root: "..",
  body: `
<section class="doc-sec"><div class="wrap doc">
  <span class="mono gold">LEGAL</span>
  <h1 class="serif">License agreement</h1>
  <p>Plain-language terms for every ${esc(site.name)}${esc(site.tld)} template.</p>
  <h2 class="serif">What a purchase allows</h2>
  <ul class="check-list">
    <li>Build and publish <b>one website</b> per purchased license, personal or commercial.</li>
    <li>Modify anything: layout, copy, images, fonts, colors, code.</li>
    <li>Use the site for yourself or for one client project.</li>
  </ul>
  <h2 class="serif">What it does not allow</h2>
  <ul class="check-list">
    <li>Reselling, redistributing or sharing the template or remix link.</li>
    <li>Publishing the template as your own template product.</li>
    <li>Using one purchase for multiple separate websites. Buy one license per site.</li>
  </ul>
  <h2 class="serif">Free templates</h2>
  <p>Free templates carry the same terms, including commercial use on one site, at no cost. No attribution required.</p>
  <h2 class="serif">Assets</h2>
  <p>Fonts are free Google Fonts. Demo photography is licensed for demonstration; replace it with imagery you have rights to before launching.</p>
  <h2 class="serif" id="refunds">Refunds</h2>
  <p>Templates are digital goods you can fully preview before buying: every demo is the complete live site. Because of that, sales are final once the remix link is delivered. If a template is materially broken and we cannot fix it, you get your money back. Something wrong? <a href="../support/index.html">Tell us</a> first.</p>
  <div class="ctas"><a class="pill lg" href="../index.html#collection">Back to the collection</a></div>
</div></section>`,
});

/* ---------------- write dist ---------------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, "assets", "covers"), { recursive: true });
fs.writeFileSync(path.join(DIST, "index.html"), home);
fs.writeFileSync(path.join(DIST, "style.css"), fs.readFileSync(path.join(ROOT, "src", "style.css")));
fs.writeFileSync(path.join(DIST, ".nojekyll"), "");
fs.writeFileSync(path.join(DIST, "CNAME"), "getsites.co\n");
for (const dir of ["covers", "og", "shots", "brand"]) {
  const src = path.join(ROOT, "assets", dir);
  if (!fs.existsSync(src)) continue;
  fs.mkdirSync(path.join(DIST, "assets", dir), { recursive: true });
  for (const f of fs.readdirSync(src)) fs.copyFileSync(path.join(src, f), path.join(DIST, "assets", dir, f));
}
for (const t of templates) {
  const dir = path.join(DIST, "templates", t.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), detail(t));
}
fs.mkdirSync(path.join(DIST, "templates"), { recursive: true });
fs.writeFileSync(path.join(DIST, "templates", "index.html"), templatesPage);
for (const [name, html] of [["support", supportPage], ["license", licensePage]]) {
  fs.mkdirSync(path.join(DIST, name), { recursive: true });
  fs.writeFileSync(path.join(DIST, name, "index.html"), html);
}
fs.writeFileSync(path.join(DIST, "404.html"), page({
  title: `Page not found | ${site.name}${site.tld}`,
  description: site.description,
  root: "",
  body: `
<section class="notfound"><div class="wrap">
  <p class="badge-pill">404</p>
  <h1 class="nf-h">This page <span class="it">wandered off.</span></h1>
  <p class="nf-p">The templates are all still here, though.</p>
  <a class="pill lg" href="/index.html#collection">Browse the collection</a>
</div></section>`,
}));
const urls = [site.baseUrl + "/", site.baseUrl + "/templates/", site.baseUrl + "/support/", site.baseUrl + "/license/", ...templates.map(t => `${site.baseUrl}/templates/${t.slug}/`)];
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n") + "\n</urlset>");
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
console.log("v3 built:", ["index", "support", "license", "404", ...templates.map(t => t.slug)].join(", "));
