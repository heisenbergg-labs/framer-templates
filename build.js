// Zero-dependency static build: templates.json -> dist/
// getsites v3 — curated template studio. Usage: node build.js
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DIST = path.join(ROOT, "dist");
const data = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));
const { site, templates } = data;

const VER = Date.now().toString(36);
const META_PIXEL_ID = "1817397522974878";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// free first, then paid cheapest-first (browsing order)
const sorted = [...templates]; // curated order = templates.json order
const live = sorted.filter(t => t.status !== "soon");
const upcoming = sorted.filter(t => t.status === "soon");
const featured = templates.find(t => t.slug === "cut");
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
    <a href="${root}/templates/cut/index.html">Featured template</a>
    <a href="#" data-letter-open>Studio</a>
    <a class="pill" href="#" data-quiz-open>Find my template</a>
  </div>
  <button class="nav-burger" type="button" aria-label="Menu" aria-expanded="false"><span></span><span></span></button>
</div>
<div class="nav-sheet" hidden>
  <a href="${root}/templates/index.html">Templates</a>
  <a href="${root}/templates/cut/index.html">Featured template</a>
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
      <a href="${root}/templates/cut/index.html">Featured template</a>
      <a href="${root}/index.html#signature">Upcoming release</a>
    </div>
    <div class="foot-col">
      <span class="mono-sm">TEMPLATES FOR</span>
      <a href="${root}/templates/for-photographers/index.html">Photographers</a>
      <a href="${root}/templates/for-video-editors/index.html">Video editors</a>
      <a href="${root}/templates/for-restaurants-and-bars/index.html">Restaurants &amp; bars</a>
      <a href="${root}/templates/for-hotels-and-rentals/index.html">Stays &amp; rentals</a>
      <a href="${root}/templates/for-finance-and-consulting/index.html">Finance &amp; consulting</a>
      <a href="${root}/templates/for-creators/index.html">Creators</a>
      <a href="${root}/templates/free/index.html">Free templates</a>
    </div>
    <div class="foot-col">
      <span class="mono-sm">HELP</span>
      <a href="${root}/learn/index.html">Framer, answered</a>
      <a href="${root}/support/index.html">Support</a>
      <a href="${root}/support/index.html#framer">Framer setup</a>
      <a href="mailto:support@getsites.co">support@getsites.co</a>
      <a href="${root}/license/index.html">Licensing</a>
      <a href="${root}/license/index.html#refunds">Refunds</a>
      <a href="${root}/privacy/index.html">Privacy</a>
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

/* ---------------- concept preview (unpublished templates only) ---------------- */
const conceptPreview = (t) => `
<div id="cpv" hidden>
  <div class="ql-box" role="dialog" aria-modal="true" aria-label="Concept preview">
    <div class="ql-top">
      <div class="ql-meta"><b>${esc(t.name)}</b><span class="mono-sm">${esc(t.category)} &middot; Coming soon &middot; ${esc(t.tagline)}</span></div>
      <div class="ql-actions">
        <button class="ql-view on" type="button" data-view="desktop">Desktop</button>
        <button class="ql-view" type="button" data-view="mobile">Mobile</button>
        <button class="ql-x" type="button" aria-label="Close preview">&times;</button>
      </div>
    </div>
    <div class="ql-frame" id="cpv-wrap"><iframe id="cpv-iframe" title="Concept preview" data-src="${t.demo}"></iframe></div>
  </div>
</div>
<script>
(function () {
  var cp = document.getElementById("cpv");
  if (!cp) return;
  var fr = document.getElementById("cpv-iframe");
  var wrap = document.getElementById("cpv-wrap");
  function open() {
    if (!fr.src) fr.src = fr.dataset.src;
    wrap.classList.remove("as-phone");
    cp.querySelectorAll(".ql-view").forEach(function (v) { v.classList.toggle("on", v.dataset.view === "desktop"); });
    cp.hidden = false;
    document.body.style.overflow = "hidden";
    if (window.goatcounter && goatcounter.count) goatcounter.count({ path: "concept-preview", title: "Concept preview", event: true });
  }
  function close() { cp.hidden = true; document.body.style.overflow = ""; }
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest("[data-concept-open]")) { e.preventDefault(); open(); return; }
    if (cp.hidden) return;
    var v = e.target.closest ? e.target.closest("#cpv .ql-view") : null;
    if (v) {
      cp.querySelectorAll(".ql-view").forEach(function (x) { x.classList.remove("on"); });
      v.classList.add("on");
      wrap.classList.toggle("as-phone", v.dataset.view === "mobile");
      return;
    }
    if (e.target === cp || e.target.closest("#cpv .ql-x")) close();
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !cp.hidden) close(); });
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
    <div class="quiz-step" data-step="result" hidden>
      <h2 class="quiz-h" id="quiz-result-h">Made <span class="it">for you.</span></h2>
      <div class="quiz-matches" id="quiz-matches"></div>
      <p class="quiz-offer">Use <button class="qc-chip sm" type="button" id="qc-copy">SITES25</button> at checkout, 25% off this template.</p>
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
  var order = ["intro", "contact", "build", "feel", "matters", "result"];
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
      "<span class='qm-meta'><b>" + top.name + " <em>Recommended</em></b><i>" + top.cat + " \u00b7 " + top.price + "</i><span class='qm-cta'>View " + top.name + " \u2192</span></span></a>";
    if (alt) html += "<a class='quiz-alt' href='" + ROOT + "/templates/" + alt.slug + "/index.html'>Also fits: <b>" + alt.name + "</b> \u00b7 " + alt.cat + " \u00b7 " + alt.price + " <span class='arr'>\u2192</span></a>";
    document.getElementById("quiz-matches").innerHTML = html;
    show(order.indexOf("result"));
    if (window.gsPing) gsPing("quiz-complete", { recommended: picked[0].name, building: picks.build || "", email: lead.email || "" });
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
    if (window.gsPing) gsPing("lead", { name: lead.name, email: lead.email });
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
  var qc = document.getElementById("qc-copy");
  if (qc) qc.addEventListener("click", function () {
    var done = function () { qc.textContent = "Copied \u2713"; setTimeout(function () { qc.textContent = "SITES25"; }, 1600); };
    if (window.gsPing) gsPing("code-reveal", { email: lead.email || "" });
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText("SITES25").then(done, done); else done();
  });

  // shared email capture: quiz save, newsletter, waitlist -> one webhook
  document.addEventListener("submit", function (ev) {
      var f = ev.target.closest ? ev.target.closest("form[data-capture]") : null;
      if (!f) return;
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
      if (window.gsPing && (f.dataset.capture === "newsletter" || f.dataset.capture === "waitlist")) {
        gsPing(f.dataset.capture, { email: em.value.trim(), template: f.dataset.tpl || "" });
      }
      var done = document.createElement("p");
      done.className = "quiz-sent";
      done.textContent = f.dataset.capture === "waitlist" ? "You're on the list." : "Sent. Watch your inbox.";
      f.replaceWith(done);
      if (window.goatcounter && goatcounter.count) goatcounter.count({ path: f.dataset.capture + "-lead", title: "Lead: " + f.dataset.capture, event: true });
  }, true);

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
const page = ({ title, description, body, root = ".", og = "assets/og/home.jpg", jsonld = null, navDelay = false, product = null }) => `<!DOCTYPE html>
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
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');
${product ? `window.gsProduct=${JSON.stringify(product)};
fbq('track','ViewContent',{content_ids:[${JSON.stringify(product.id)}],content_type:'product',content_name:${JSON.stringify(product.name)},content_category:${JSON.stringify(product.category)},value:${Number(product.price) || 0},currency:'USD'});` : ""}
</script>
<noscript><img height="1" width="1" style="display:none" alt="" src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"></noscript>
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
  // hover-video preview: cover image at rest, muted loop while hovered
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".tcard img[data-vid]").forEach(img => {
      const src = img.dataset.vid;
      if (!src) return;
      const card = img.closest(".tcard");
      let v = null;
      card.addEventListener("mouseenter", () => {
        if (!v) {
          v = document.createElement("video");
          v.muted = true; v.loop = true; v.playsInline = true; v.preload = "auto";
          v.src = src;
          v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:top;opacity:0;transition:opacity 0.25s ease;pointer-events:none";
          img.parentElement.appendChild(v);
        }
        v.currentTime = 0;
        v.play().then(() => { v.style.opacity = "1"; }).catch(() => {});
      });
      card.addEventListener("mouseleave", () => { if (v) { v.pause(); v.style.opacity = "0"; } });
    });
  }
  document.querySelectorAll(".tcard img[data-gal]").forEach(img => {
    if (img.dataset.vid) return; // video preview owns this card's hover
    const gal = (img.dataset.gal || "").split(",").filter(Boolean);
    if (gal.length < 2) return;
    let idx = 0, timer = null, loaded = false;
    const card = img.closest(".tcard");
    const show = i => {
      idx = i;
      img.style.opacity = "0.35";
      setTimeout(() => { img.src = gal[idx]; img.style.opacity = "1"; }, 130);
    };
    card.addEventListener("mouseenter", () => {
      if (!loaded) { gal.forEach(u => { const p = new Image(); p.src = u; }); loaded = true; }
      timer = setInterval(() => show((idx + 1) % gal.length), 1100);
    });
    card.addEventListener("mouseleave", () => {
      clearInterval(timer); timer = null;
      if (idx !== 0) show(0);
    });
    img.style.transition = "opacity 0.22s ease";
  });
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
<script>
window.gsPing = function (e, d) {
  try { navigator.sendBeacon("https://getsites-pings.pragadeesigns.workers.dev/", JSON.stringify({ e: e, d: d || {}, p: location.pathname })); } catch (err) {}
};
document.addEventListener("click", function (ev) {
  var a = ev.target.closest && ev.target.closest('a[href*="buy.polar.sh/"], a[href*="polar.sh/checkout/"]');
  if (!a) return;
  gsPing("buy-click", { template: (document.title.split(",")[0] || "").slice(0, 60) });
  try {
    if (window.fbq) {
      var p = window.gsProduct;
      fbq("track", "InitiateCheckout", p
        ? { content_ids: [p.id], content_type: "product", content_name: p.name, value: Number(p.price) || 0, currency: "USD", num_items: 1 }
        : { content_type: "product", content_name: (document.title.split(",")[0] || "").slice(0, 60), currency: "USD", num_items: 1 });
    }
  } catch (err) {}
}, true);
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var TTL = 30 * 24 * 60 * 60 * 1000;
  try {
    var qs = new URLSearchParams(location.search);
    var found = {};
    KEYS.forEach(function (k) { var v = qs.get(k); if (v) found[k] = v; });
    if (Object.keys(found).length) localStorage.setItem("gs_utm", JSON.stringify({ p: found, t: Date.now() }));
    var raw = localStorage.getItem("gs_utm");
    var d = null;
    if (raw) {
      d = JSON.parse(raw);
      if (!d || !d.p || Date.now() - d.t > TTL) { localStorage.removeItem("gs_utm"); d = null; }
    }
    document.querySelectorAll('a[href*="buy.polar.sh/"], a[href*="polar.sh/checkout/"]').forEach(function (a) {
      try {
        var u = new URL(a.href);
        if (d && d.p) KEYS.forEach(function (k) { if (d.p[k] && !u.searchParams.has(k)) u.searchParams.set(k, d.p[k]); });
        if (!u.searchParams.has("utm_term")) u.searchParams.set("utm_term", "via-getsites");
        a.href = u.toString();
      } catch (e) {}
    });
  } catch (e) {}
})();
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
      <img src="${root}/${t.cover}?v=${VER}" alt="${esc(t.name)} website template" loading="lazy" data-vid="${t.preview || ""}" data-gal="${(t.gallery && t.gallery.length > 1) ? t.gallery.map(g => root + "/" + g + "?v=" + VER).join(",") : ""}">
    </a>
  </div>
  <div class="meta">
    <div class="meta-l">
      <h3><a href="${root}/templates/${t.slug}/index.html">${esc(t.name)}</a>${statusBadge(t)}</h3>
      <p class="line2">${esc(t.category)} &middot; ${t.free ? "Free" : esc(t.price)}${t.featured ? '&ensp;<span class="feat-chip">&#9733; Featured</span>' : ""}</p>
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
    <p class="statement">Pick one, change the words and photos, connect your domain. Live today, no code.</p>
    <div class="ctas">
      <a class="pill lg" href="#" data-quiz-open>Find my template</a>
      <a class="textlink" href="#" data-quiz-open>Not sure? 3 questions, 25% off <span class="arr">&rarr;</span></a>
    </div>
    <div class="proof-strip">
      <span class="proof-avatars">
        <span class="pav">T</span><span class="pav">L</span><span class="pav">K</span><span class="pav">N</span><span class="pav you">You?</span>
      </span>
      <span class="proof-text"><span class="proof-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span> so far &middot; Used by businesses in 5 countries</span>
    </div>
    ${HERO_VISUAL ? `<div class="hero-visual"><img src="${HERO_VISUAL}" alt="A getsites template on screen"></div>` : ""}
  </div>
</header>

${collectionSec(".")}

<section class="idemo-sec"><div class="wrap">
  <div class="sec-head">
    <h2 class="serif">Try one, <span class="it">right now.</span></h2>
    <p class="idemo-sub">This is ${esc(featured.name)}, live. Click, scroll, open its pages. Every demo on this site is the real template.</p>
  </div>
  <div class="idemo reveal" id="idemo" data-demo="${esc(featured.demo)}">
    <div class="idemo-bar"><span class="dot r"></span><span class="dot y"></span><span class="dot g"></span><span class="idemo-url">${esc(featured.demo.replace("https://", ""))}</span></div>
    <div class="idemo-body">
      <img src="assets/covers/${featured.slug}.jpg?v=${VER}" alt="${esc(featured.name)} template preview">
      <button class="pill lg idemo-go" type="button">Try it live</button>
    </div>
  </div>
</div></section>
<script>
(function () {
  var box = document.getElementById("idemo");
  if (!box) return;
  var btn = box.querySelector(".idemo-go");
  btn.addEventListener("click", function () {
    var body = box.querySelector(".idemo-body");
    var f = document.createElement("iframe");
    f.src = box.dataset.demo;
    f.setAttribute("title", "Live template demo");
    f.setAttribute("loading", "eager");
    body.innerHTML = "";
    body.appendChild(f);
    if (window.gsPing) gsPing("demo-click", { template: box.dataset.demo });
  });
})();
</script>

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
      <p class="pc-price"><span class="pc-from">From</span> $${Math.min(...live.filter(t => !t.free && t.status !== "soon").map(t => Number(String(t.price).replace(/[^0-9.]/g, "")) || Infinity))}</p>
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
      <a class="sig-shot" href="templates/${t.slug}/index.html"><img src="${t.cover}?v=${VER}" alt="${esc(t.name)} concept preview"></a>
      <button class="qlb sig-ql" type="button" data-concept-open>Preview the concept</button>
    </div>
  </article>`).join("")}
</div></section>${conceptPreview(upcoming[0])}` : ""}

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
    product: { id: t.slug, name: t.name, category: t.category, price: price },
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
    <div class="pd-main" id="pd-main"><img id="pd-img" src="../../${(t.gallery && t.gallery[0]) || t.cover}?v=${VER}" alt="${esc(t.name)} website template preview"></div>
    ${(() => { const g = t.gallery || [t.cover, inner, page2].filter(Boolean); const items = g.map((src, i) => `<button class="pd-th${i === 0 ? " on" : ""}" type="button" data-src="../../${src}?v=${VER}"><img src="../../${src}?v=${VER}" alt="" loading="lazy"></button>`); if (t.video) items.push(`<button class="pd-th pd-th-video" type="button" data-video="${t.video}"><img src="../../${(t.gallery && t.gallery[0]) || t.cover}" alt=""><span class="pd-play">&#9654;</span></button>`); return items.length > 1 ? `<div class="pd-thumbs">\n      ${items.join("\n      ")}\n    </div>` : ""; })()}
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
           </form>
           <button class="btn-secondary" type="button" data-concept-open>Preview the concept</button>`
        : `<a class="btn-primary" href="${buyHref}" target="_blank" rel="noreferrer">${t.free ? "Get free template" : `Get this template &middot; ${esc(t.price)}`}</a>
           <a class="btn-secondary" href="${t.demo}" target="_blank" rel="noreferrer">Preview live demo</a>`}
    </div>
    ${soon ? conceptPreview(t) : `<p class="pd-trust mono-sm">FREE UPDATES &nbsp;&middot;&nbsp; ONE-SITE LICENSE &nbsp;&middot;&nbsp; REMIX LINK AFTER CHECKOUT</p>`}
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


const privacyPage = page({
  title: `Privacy | ${site.name}${site.tld}`,
  description: "What getsites collects, why, and how to get your data removed.",
  root: "..",
  body: `
<section class="doc-sec"><div class="wrap doc">
  <span class="mono gold">LEGAL</span>
  <h1 class="serif">Privacy policy</h1>
  <p>Plain language, because that is how we would want it explained to us. Last updated July 24, 2026.</p>

  <h2 class="serif">What we collect, and when</h2>
  <ul class="check-list">
    <li><b>Nothing, by default.</b> Browsing ${esc(site.name)}${esc(site.tld)} requires no account and sets no advertising cookies.</li>
    <li><b>Anonymous analytics.</b> We use GoatCounter, a privacy-focused counter that records page views and events without cookies or personal profiles. We cannot identify you from it.</li>
    <li><b>What you type into our forms.</b> The template quiz asks for your name and email. The newsletter and waitlist forms ask for your email. We store these in a private spreadsheet we control and use them only to send what you asked for: your match, your discount code, release notes, or early access.</li>
    <li><b>Campaign tags.</b> If you arrive from a link with campaign parameters (for example from Pinterest), we keep those tags in your browser's local storage for up to 30 days so a purchase can be credited to the right campaign. They stay on your device and are only attached to a checkout if you buy.</li>
  </ul>

  <h2 class="serif">Purchases</h2>
  <p>Checkout runs on <b>Polar</b> (polar.sh), our merchant of record. Your payment details go to Polar and its payment processors, never to us. We receive your email and order details so we can deliver the template and honor the license. Polar's own privacy policy applies to the payment itself.</p>

  <h2 class="serif">Email</h2>
  <p>We send email through Brevo. Every marketing email has an unsubscribe link that works immediately. Replying to any email reaches a human.</p>

  <h2 class="serif">What we never do</h2>
  <ul class="check-list">
    <li>No selling or renting your data, to anyone, ever.</li>
    <li>No ad networks, no tracking pixels, no fingerprinting.</li>
    <li>No spam. You only hear from us about things you signed up for.</li>
  </ul>

  <h2 class="serif">Your rights</h2>
  <p>Want your data shown to you, corrected, or deleted? Email <a href="mailto:support@getsites.co">support@getsites.co</a> and it is done within a few days, no questions asked. If you are in the EU/EEA, UK, or California, this covers your access, deletion, and portability rights.</p>

  <h2 class="serif">Third parties we rely on</h2>
  <p>GitHub Pages (hosting), Cloudflare (DNS and email routing), GoatCounter (analytics), Google Sheets (form storage), Brevo (email), Polar (checkout), Framer (template delivery). Each processes only what is needed for its job.</p>

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

/* ---------------- niche landing pages (SEO) ---------------- */
/* Tag-driven: a template appears on a niche page when any of its tags (or its
   category) matches the niche's tag list — new catalog entries place themselves. */
const NICHES = [
  {
    slug: "for-photographers",
    label: "Photographers",
    title: "Framer Templates for Photographers",
    h1: `Framer templates <span class="it">for photographers.</span>`,
    description: "Portfolio templates for photographers, built in Framer. Galleries that let the photos do the talking, easy image swaps, no code.",
    intro: [
      "A photography site has one job: get out of the way of the pictures. These templates are built around galleries, big images and quiet type, so the work carries the page.",
      "Every image is a native Framer image fill. Swap the demo shots for your own by double-clicking, connect your domain, and the site is live.",
    ],
    tags: ["photography", "art", "creative"],
  },
  {
    slug: "for-video-editors",
    label: "Video editors",
    title: "Framer Templates for Video Editors and Filmmakers",
    h1: `Framer templates <span class="it">for video editors.</span>`,
    description: "Showreel and portfolio templates for video editors, filmmakers and colorists. Built in Framer, video-first, no code.",
    intro: [
      "Clients hire editors off the reel. These templates put your work front and center, with layouts built for motion, stills from your grade, and space for the credits that matter.",
      "Everything is editable on the Framer canvas: replace the reel, retitle the projects, publish. No code, no plugins.",
    ],
    tags: ["video editor", "filmmaker", "videographer", "showreel"],
  },
  {
    slug: "for-restaurants-and-bars",
    label: "Restaurants & bars",
    title: "Framer Templates for Restaurants, Bars and Clubs",
    h1: `Framer templates for <span class="it">restaurants and bars.</span>`,
    description: "Website templates for restaurants, bars, clubs and member venues. Built in Framer, easy menu edits, no code.",
    intro: [
      "A venue site needs atmosphere and answers: what it feels like, what is on the menu, how to book. These templates handle all three without a designer on retainer.",
      "Menus, hours and photos are plain text and image layers on the Framer canvas. Your staff can update tonight's menu without calling anyone.",
    ],
    tags: ["restaurant", "club", "bar", "membership"],
  },
  {
    slug: "for-hotels-and-rentals",
    label: "Stays & rentals",
    title: "Framer Templates for Hotels, Stays and Rentals",
    h1: `Framer templates for <span class="it">stays and rentals.</span>`,
    description: "Website templates for boutique hotels, guest houses and vacation rentals. Built in Framer, booking-ready, no code.",
    intro: [
      "Guests book places they can already picture themselves in. These templates sell the stay with big photography, warm type and a clear path to the booking link.",
      "Swap the photos, write your own welcome, point the button at your booking system. Live in an afternoon.",
    ],
    tags: ["rental", "stay", "travel", "hospitality"],
  },
  {
    slug: "for-finance-and-consulting",
    label: "Finance & consulting",
    title: "Framer Templates for Finance and Consulting Firms",
    h1: `Framer templates for <span class="it">finance firms.</span>`,
    description: "Website templates for finance, wealth management, advisory and consulting firms. Built in Framer, credible by default, no code.",
    intro: [
      "In finance, the website is a credibility check before the first call. These templates are built to pass it: restrained type, quiet color, and copy structure that reads established.",
      "Every line of text is editable on the canvas. Replace the demo firm with yours, connect your domain, done.",
    ],
    tags: ["finance", "consulting", "business", "luxury"],
  },
  {
    slug: "for-creators",
    label: "Creators",
    title: "Framer Templates for Creators, a Linktree Alternative",
    h1: `Framer templates <span class="it">for creators.</span>`,
    description: "Creator storefront templates built in Framer. A real website instead of a link-in-bio page: products, links and content in one place you own.",
    intro: [
      "A link-in-bio page rents your audience a hallway. These templates give you the whole house: your products, your links, your content, on a domain you own.",
      "Cards and products live in the Framer CMS, so adding a new drop is filling in a form, not redesigning a page.",
    ],
    tags: ["creator", "linktree alternative", "storefront", "personal brand"],
  },
  {
    slug: "free",
    label: "Free templates",
    title: "Free Framer Templates",
    h1: `Free Framer <span class="it">templates.</span>`,
    description: "Free Framer website templates from getsites.co. Complete sites, commercial use allowed, no attribution required.",
    intro: [
      "Free here means the full site, not a teaser. Same license as the paid templates: one site, commercial use allowed, no attribution required.",
      "Remix the demo into your own Framer account, make it yours, publish. If you outgrow it, the paid collection is one step up.",
    ],
    tags: ["free"],
    match: (t) => t.free,
  },
  {
    slug: "for-wedding-photographers",
    label: "Wedding photographers",
    title: "Framer Templates for Wedding Photographers",
    h1: `Framer templates for <span class="it">wedding photographers.</span>`,
    description: "Portfolio templates for wedding photographers, built in Framer. Gallery-first layouts couples can fall in love with, no code.",
    intro: [
      "Couples pick a wedding photographer from the galleries, not the about page. These templates lead with full-width image sets and keep the type quiet, so your best weddings do the convincing.",
      "Each gallery is a native Framer image grid. Drop in a new wedding by replacing images on the canvas, publish, and the portfolio is current again.",
    ],
    slugs: ["still"], tags: ["photography"],
  },
  {
    slug: "for-artists",
    label: "Artists",
    title: "Framer Templates for Artists",
    h1: `Framer templates <span class="it">for artists.</span>`,
    description: "Portfolio templates for artists and illustrators, built in Framer. Work-first layouts with room for series and statements, no code.",
    intro: [
      "An artist site should feel like a room your work hangs in, not a feed it scrolls past in. These templates give each piece space, with layouts that suit series, editions and statements.",
      "Images are native fills and every caption is an editable text layer, so updating for a new body of work takes minutes.",
    ],
    slugs: ["still"], tags: ["art", "creative"],
  },
  {
    slug: "for-designers",
    label: "Designers",
    title: "Framer Templates for Designers",
    h1: `Framer templates <span class="it">for designers.</span>`,
    description: "Portfolio templates for graphic and digital designers, built in Framer. Case-study-ready layouts with taste, no code.",
    intro: [
      "A designer's portfolio gets judged on its own design before anyone opens a case study. These templates hold that bar: disciplined type, deliberate spacing, nothing decorative for its own sake.",
      "Projects are cards on the canvas or CMS entries, so adding work is routine, not a redesign.",
    ],
    slugs: ["still", "cut"], tags: ["portfolio"],
  },
  {
    slug: "for-freelancers",
    label: "Freelancers",
    title: "Framer Templates for Freelancers",
    h1: `Framer templates <span class="it">for freelancers.</span>`,
    description: "Website templates for freelancers, built in Framer. Show the work, state the offer, capture the inquiry. No code.",
    intro: [
      "A freelancer site has three jobs: show the work, state what you do, and make contacting you effortless. Every template here is structured around those three, whatever your craft.",
      "You own the domain and the site. No page builder subscriptions stacked on retainers, just Framer and your work.",
    ],
    slugs: ["still", "cut", "the-collection"], tags: [],
  },
  {
    slug: "for-filmmakers",
    label: "Filmmakers",
    title: "Framer Templates for Filmmakers",
    h1: `Framer templates <span class="it">for filmmakers.</span>`,
    description: "Portfolio templates for filmmakers and directors, built in Framer. Cinematic layouts built around the work, no code.",
    intro: [
      "A filmmaker's site should feel like a screening, not a brochure. These templates are dark, cinematic and built around full-bleed stills and reels.",
      "Projects, credits and stills are all editable on the Framer canvas. Swap the demo films for yours and publish.",
    ],
    slugs: ["cut"], tags: ["filmmaker"],
  },
  {
    slug: "for-videographers",
    label: "Videographers",
    title: "Framer Templates for Videographers",
    h1: `Framer templates <span class="it">for videographers.</span>`,
    description: "Portfolio templates for videographers, built in Framer. Reel-first layouts that book client work, no code.",
    intro: [
      "Clients booking a videographer want the reel, the range and the contact button. These templates put all three above the fold and let the footage sell the rest.",
      "Video embeds, project cards and rates are plain layers on the canvas, editable without touching code.",
    ],
    slugs: ["cut"], tags: ["videographer"],
  },
  {
    slug: "for-colorists",
    label: "Colorists",
    title: "Framer Templates for Colorists",
    h1: `Framer templates <span class="it">for colorists.</span>`,
    description: "Portfolio templates for film and video colorists, built in Framer. Dark, grade-friendly layouts, no code.",
    intro: [
      "A colorist's portfolio lives or dies on how the frames look on screen. These templates are dark by design, so your grades read true instead of fighting a white page.",
      "Before-and-after stills, reels and credits all sit in native layers you edit on the canvas.",
    ],
    slugs: ["cut"], tags: ["colorist"],
  },
  {
    slug: "for-motion-designers",
    label: "Motion designers",
    title: "Framer Templates for Motion Designers",
    h1: `Framer templates for <span class="it">motion designers.</span>`,
    description: "Portfolio templates for motion designers and animators, built in Framer. Layouts that move like your work does, no code.",
    intro: [
      "Motion designers get hired off feel, and a static portfolio undersells you. These templates carry real motion in the layout itself: scroll-driven sections, hover states, momentum.",
      "The animation is native Framer interaction, so it stays editable and never breaks when you swap in your own work.",
    ],
    slugs: ["cut"], tags: ["motion"],
  },
  {
    slug: "for-youtubers",
    label: "YouTubers",
    title: "Framer Templates for YouTubers",
    h1: `Framer templates <span class="it">for YouTubers.</span>`,
    description: "Website templates for YouTubers and video creators, built in Framer. A home base for videos, sponsors and merch, no code.",
    intro: [
      "A channel is rented space. A site is where sponsors, press and merch actually land. These templates give a video creator both: a reel-quality showcase and a storefront for everything around it.",
      "Videos embed natively, and links, products and featured uploads are CMS entries you update like a form.",
    ],
    slugs: ["cut", "the-collection"], tags: [],
  },
  {
    slug: "for-airbnb-hosts",
    label: "Airbnb hosts",
    title: "Framer Templates for Airbnb Hosts",
    h1: `Framer templates for <span class="it">Airbnb hosts.</span>`,
    description: "Direct-booking website templates for Airbnb and vacation rental hosts, built in Framer. Keep the platform fee, no code.",
    intro: [
      "Every direct booking is a platform fee you keep. A simple site with your photos, your story and a booking link turns repeat guests into direct guests.",
      "Point the button at your booking system or a direct-booking service, swap the photos, publish. The whole thing is an afternoon.",
    ],
    slugs: ["fern-hollow"], tags: ["rental"],
  },
  {
    slug: "for-bed-and-breakfasts",
    label: "B&Bs & guest houses",
    title: "Framer Templates for Bed and Breakfasts",
    h1: `Framer templates for <span class="it">B&amp;Bs and guest houses.</span>`,
    description: "Website templates for bed and breakfasts and guest houses, built in Framer. Warm, booking-ready, no code.",
    intro: [
      "Small stays win on warmth, and most booking-platform pages strip it out. These templates put it back: your rooms, your breakfast table, your corner of the map, told your way.",
      "Rooms, rates and seasonal notes are text and image layers anyone at the front desk can edit.",
    ],
    slugs: ["fern-hollow"], tags: ["stay"],
  },
  {
    slug: "for-private-clubs",
    label: "Private clubs",
    title: "Framer Templates for Private Clubs and Members Venues",
    h1: `Framer templates for <span class="it">private clubs.</span>`,
    description: "Website templates for private clubs, member venues and societies, built in Framer. Discreet by design, no code.",
    intro: [
      "A members venue should say just enough. These templates trade the usual hospitality hard-sell for atmosphere, a short story and a single invitation to apply.",
      "Membership copy, events and imagery are editable layers, so the site stays current without a designer on call.",
    ],
    slugs: ["the-aubrey"], tags: ["membership", "club"],
  },
  {
    slug: "for-cafes",
    label: "Cafés",
    title: "Framer Templates for Cafés and Coffee Shops",
    h1: `Framer templates <span class="it">for caf&eacute;s.</span>`,
    description: "Website templates for cafés and coffee shops, built in Framer. Menu, hours, atmosphere, no code.",
    intro: [
      "People check a café's site for three things: is it open, what's on, and does it look like my kind of place. These templates answer all three in one scroll.",
      "The menu is plain text on the canvas. New pastry, new price, new hours: edit, publish, done.",
    ],
    slugs: ["the-aubrey"], tags: ["restaurant"],
  },
  {
    slug: "for-wealth-management",
    label: "Wealth management",
    title: "Framer Templates for Wealth Management Firms",
    h1: `Framer templates for <span class="it">wealth management.</span>`,
    description: "Website templates for wealth management and advisory firms, built in Framer. Quiet money, properly presented. No code.",
    intro: [
      "Clients trusting you with wealth read restraint as competence. These templates are built on that: serif discipline, muted palettes, and copy structure that presents rather than pitches.",
      "Team, philosophy and disclosures are editable text layers, so compliance edits never wait on a developer.",
    ],
    slugs: ["brookmere"], tags: ["finance"],
  },
  {
    slug: "for-consultants",
    label: "Consultants",
    title: "Framer Templates for Consultants",
    h1: `Framer templates <span class="it">for consultants.</span>`,
    description: "Website templates for consultants and advisory practices, built in Framer. Credible in one visit, no code.",
    intro: [
      "A consultant's site is checked once, before the first call, usually from a phone. These templates make that one visit count: who you help, how, and the proof, in a page that reads established.",
      "Services and case notes are canvas text. Reposition the practice in an evening, not a project.",
    ],
    slugs: ["brookmere"], tags: ["consulting"],
  },
  {
    slug: "for-law-firms",
    label: "Law firms",
    title: "Framer Templates for Law Firms",
    h1: `Framer templates <span class="it">for law firms.</span>`,
    description: "Website templates for law firms and independent practices, built in Framer. Sober, credible, current. No code.",
    intro: [
      "Legal clients are choosing judgment, and the website is the first exhibit. These templates keep it sober: clear practice areas, real bios, nothing gimmicky.",
      "Attorneys, practice areas and notices are editable layers, so the site stays accurate without IT tickets.",
    ],
    slugs: ["brookmere"], tags: [],
  },
  {
    slug: "for-creative-agencies",
    label: "Creative agencies",
    title: "Framer Templates for Creative Agencies and Studios",
    h1: `Framer templates for <span class="it">creative agencies.</span>`,
    description: "Website templates for creative agencies and studios, built in Framer. Portfolio-grade craft at template speed, no code.",
    intro: [
      "An agency site has to prove taste before the deck ever gets opened. These templates hold portfolio-grade craft in type, motion and spacing, without a six-week internal project nobody has time for.",
      "Case studies are cards and CMS entries. New win, new card, published the same day.",
    ],
    slugs: ["cut", "still"], tags: [],
  },
  {
    slug: "for-small-businesses",
    label: "Small businesses",
    title: "Framer Templates for Small Businesses",
    h1: `Framer templates for <span class="it">small businesses.</span>`,
    description: "Website templates for small businesses, built in Framer. A real site without agency prices, live in a day. No code.",
    intro: [
      "Most small businesses get quoted agency prices for a five-page site and settle for a page builder that looks like it. These templates are the third option: designed properly, owned outright, live in a day.",
      "Words, photos, prices and hours are all editable on the canvas. The person who runs the business can run the site.",
    ],
    slugs: ["brookmere", "the-aubrey", "fern-hollow"], tags: ["business"],
  },
  {
    slug: "for-influencers",
    label: "Influencers",
    title: "Framer Templates for Influencers",
    h1: `Framer templates <span class="it">for influencers.</span>`,
    description: "Website templates for influencers, built in Framer. Your links, partnerships and shop on a domain you own, no code.",
    intro: [
      "Brands vet influencers off a link, and a bio page with ten buttons reads amateur next to a real site. These templates make the professional impression: media kit energy, shoppable links, your name on the domain.",
      "Links and products are CMS entries. New drop, new partnership, updated from your phone.",
    ],
    slugs: ["the-collection"], tags: ["personal brand"],
  },
  {
    slug: "for-fashion-and-beauty",
    label: "Fashion & beauty",
    title: "Framer Templates for Fashion and Beauty Creators",
    h1: `Framer templates for <span class="it">fashion and beauty.</span>`,
    description: "Website templates for fashion and beauty creators, built in Framer. Editorial looks, shoppable everything, no code.",
    intro: [
      "Fashion and beauty audiences expect editorial polish; anything less undercuts the content. These templates borrow magazine structure: strong covers, lookbook grids, credits done properly.",
      "Looks and products live in the CMS, so a new haul or edit is a form fill, not a layout job.",
    ],
    slugs: ["the-collection"], tags: ["fashion", "beauty"],
  },
  {
    slug: "linktree-alternative",
    label: "Linktree alternative",
    title: "Linktree Alternative Built in Framer",
    h1: `A Linktree alternative <span class="it">you actually own.</span>`,
    description: "A Linktree alternative built in Framer: your links, products and content on your own domain, designed like a real site. No code.",
    intro: [
      "Link-in-bio tools rent you a list of buttons on their domain, with their branding and their limits. A Framer template gives you the same one-tap convenience on a site that is actually yours.",
      "Same job, better impression: your links and products in a designed storefront, your domain on the address bar, no monthly link-tool subscription.",
    ],
    slugs: ["the-collection"], tags: ["linktree alternative"],
  },
  {
    slug: "for-personal-brands",
    label: "Personal brands",
    title: "Framer Templates for Personal Brands",
    h1: `Framer templates for <span class="it">personal brands.</span>`,
    description: "Website templates for personal brands, built in Framer. One page that says who you are and where everything lives, no code.",
    intro: [
      "A personal brand scattered across five platforms needs one address that ties it together. These templates are that address: your work, your writing, your offers, one coherent page.",
      "Everything is editable on the Framer canvas, so the site evolves as fast as the brand does.",
    ],
    slugs: ["the-collection", "still"], tags: ["personal brand"],
  },
  {
    slug: "for-musicians-and-djs",
    label: "Musicians & DJs",
    title: "Framer Templates for Musicians and DJs",
    h1: `Framer templates for <span class="it">musicians and DJs.</span>`,
    description: "Website templates for musicians, DJs and acts, built in Framer. Dates, releases, merch and bookings in one place, no code.",
    intro: [
      "An act needs one page that promoters, fans and venues can all use: the dates, the latest release, the booking contact, the merch. These templates put that in one scroll with atmosphere to spare.",
      "Releases and dates are CMS entries, embeds are native, and the booking button is yours to point anywhere.",
    ],
    slugs: ["the-collection", "the-aubrey"], tags: [],
  },
];

const nicheMatch = (n, t) => n.match ? n.match(t) : (
  (n.slugs || []).includes(t.slug) ||
  (t.tags || []).concat(t.category).some((x) => (n.tags || []).map((s) => s.toLowerCase()).includes(String(x).toLowerCase()))
);

const nicheChips = (root, current) => `
<div class="niche-links">
  <span class="mono-sm">TEMPLATES BY PROFESSION</span>
  <div class="niche-chiprow">
    ${NICHES.filter((n) => n.slug !== current).map((n) => `<a class="chip" href="${root}/templates/${n.slug}/index.html">${esc(n.label)}</a>`).join("")}
  </div>
</div>`;

const nichePage = (n) => {
  const hits = live.filter((t) => nicheMatch(n, t));
  const rest = live.filter((t) => !nicheMatch(n, t));
  const root = "../..";
  return page({
    title: `${n.title} | ${site.name}${site.tld}`,
    description: n.description,
    root,
    body: `
<section class="collection-sec standalone niche-sec"><div class="wrap">
  <div class="col-head"><div>
    <p class="badge-pill">${esc(site.name)}${esc(site.tld)} collection</p>
    <h1 class="serif">${n.h1}</h1>
  </div></div>
  <div class="niche-intro">${n.intro.map((p) => `<p>${esc(p)}</p>`).join("")}</div>
  <div class="grid">
    ${hits.map((t) => card(t, root)).join("\n")}
  </div>
  ${rest.length ? `<div class="niche-more">
    <h2 class="serif">The rest of the <span class="it">collection.</span></h2>
    <div class="grid">${rest.map((t) => card(t, root)).join("\n")}</div>
  </div>` : ""}
  <div class="ctas niche-ctas">
    <a class="pill lg" href="#" data-quiz-open>Not sure? Take the 30-second quiz</a>
    <a class="textlink" href="${root}/templates/index.html">Browse everything <span class="arr">&rarr;</span></a>
  </div>
  ${nicheChips(root, n.slug)}
</div></section>`,
  });
};

/* ---------------- learn / guides (SEO answer pages) ---------------- */
const GUIDES = require(path.join(ROOT, "src", "guides.js"));

const guideCard = (g, root) => `
<a class="guide-card reveal" href="${root}/learn/${g.slug}/index.html">
  <span class="mono-sm">${esc(g.category.toUpperCase())}</span>
  <h3>${esc(g.title)}</h3>
  <p>${esc(g.answer.split(". ")[0])}.</p>
  <span class="gc-cta">Read the answer <span class="arr">&rarr;</span></span>
</a>`;

const guidePage = (g) => {
  const root = "../..";
  const rel = (g.related || []).map((slug) => NICHES.find((n) => n.slug === slug)).filter(Boolean);
  return page({
    title: `${g.title} | ${site.name}${site.tld}`,
    description: g.description,
    root,
    jsonld: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: g.question, acceptedAnswer: { "@type": "Answer", text: g.answer } }],
    },
    body: `
<section class="guide-sec"><div class="wrap">
  <p class="badge-pill">${esc(g.category)}</p>
  <h1 class="serif">${esc(g.title.replace(/\?$/, ""))}<span class="it">${g.title.endsWith("?") ? "?" : ""}</span></h1>
  <p class="guide-answer">${esc(g.answer)}</p>
  <div class="guide-body">${g.body}</div>
  ${rel.length ? `<div class="guide-rel">
    <span class="mono-sm">TEMPLATES FOR THIS</span>
    <div class="niche-chiprow">${rel.map((n) => `<a class="chip" href="${root}/templates/${n.slug}/index.html">${esc(n.label)}</a>`).join("")}</div>
  </div>` : ""}
  <div class="guide-more">
    <span class="mono-sm">MORE ANSWERS</span>
    <div class="guide-grid">${GUIDES.filter((x) => x.slug !== g.slug).slice(0, 3).map((x) => guideCard(x, root)).join("")}</div>
    <a class="textlink" href="${root}/learn/index.html">All guides <span class="arr">&rarr;</span></a>
  </div>
</div></section>`,
  });
};

const learnIndex = page({
  title: `Framer, answered | ${site.name}${site.tld}`,
  description: "Plain answers to the questions people ask before building a website with Framer: cost, code, domains, SEO, templates.",
  root: "..",
  body: `
<section class="guide-sec learn-index"><div class="wrap">
  <p class="badge-pill">Guides</p>
  <h1 class="serif">Framer, <span class="it">answered.</span></h1>
  <p class="guide-answer">The questions people ask before they build. Plain answers, no jargon, and the honest limits included.</p>
  <div class="guide-grid">${GUIDES.map((g) => guideCard(g, "..")).join("")}</div>
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
for (const n of NICHES) {
  const dir = path.join(DIST, "templates", n.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), nichePage(n));
}
fs.mkdirSync(path.join(DIST, "learn"), { recursive: true });
fs.writeFileSync(path.join(DIST, "learn", "index.html"), learnIndex);
for (const g of GUIDES) {
  const dir = path.join(DIST, "learn", g.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), guidePage(g));
}
for (const [name, html] of [["support", supportPage], ["license", licensePage], ["privacy", privacyPage]]) {
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
const urls = [site.baseUrl + "/", site.baseUrl + "/templates/", site.baseUrl + "/support/", site.baseUrl + "/license/", site.baseUrl + "/privacy/", ...templates.map(t => `${site.baseUrl}/templates/${t.slug}/`), ...NICHES.map(n => `${site.baseUrl}/templates/${n.slug}/`), site.baseUrl + "/learn/", ...GUIDES.map(g => `${site.baseUrl}/learn/${g.slug}/`)];
fs.writeFileSync(path.join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u => `  <url><loc>${u}</loc></url>`).join("\n") + "\n</urlset>");
fs.writeFileSync(path.join(DIST, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
console.log("v3 built:", ["index", "support", "license", "404", ...templates.map(t => t.slug)].join(", "));
