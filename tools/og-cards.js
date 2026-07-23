// One-off: render 1200x630 share cards per template -> assets/og/<slug>.jpg
const fs = require("fs");
const path = require("path");
const { chromium } = require("/Users/pragadees.xd/.config/carmy/framer-bot/node_modules/playwright-core");
const ROOT = path.join(__dirname, "..");
const { site, templates } = JSON.parse(fs.readFileSync(path.join(ROOT, "templates.json"), "utf8"));

const cardHtml = (t) => `<!DOCTYPE html><html><head><style>
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #000; color: #fff; font-family: "Figtree", sans-serif; overflow: hidden; position: relative; }
body::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 70% at 30% 30%, rgba(70,56,180,0.4) 0%, rgba(0,0,0,0) 70%); }
.left { position: absolute; left: 72px; top: 0; bottom: 0; width: 430px; display: flex; flex-direction: column; justify-content: center; gap: 26px; z-index: 2; }
.wm { font-family: "Instrument Serif", serif; font-size: 30px; }
.wm i { color: #8a8a8a; }
h1 { font-family: "Instrument Serif", serif; font-weight: 400; font-size: 64px; line-height: 1.0; letter-spacing: -0.02em; }
.price { display: inline-flex; align-self: flex-start; align-items: center; gap: 10px; border: 1px solid rgba(116,92,255,0.5); background: rgba(116,92,255,0.15); color: #cfc4ff; border-radius: 100px; padding: 12px 24px; font-size: 22px; font-weight: 600; }
.price .dot { width: 10px; height: 10px; border-radius: 50%; background: ${t.free ? "#21c45d" : "#745cff"}; }
.tag { color: #a3a3a3; font-size: 22px; font-weight: 400; max-width: 400px; line-height: 1.4; }
.shot { position: absolute; right: -140px; top: 70px; width: 760px; height: 560px; border-radius: 18px; overflow: hidden; box-shadow: 0 0 0 1px rgba(255,255,255,0.14), 0 40px 120px rgba(0,0,0,0.7); transform: rotate(-3deg); }
.shot img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet">
</head><body>
<div class="left">
  <div class="wm">${site.name}<i>${site.tld}</i></div>
  <h1>${t.name}</h1>
  <p class="tag">${t.tagline}</p>
  <div class="price"><span class="dot"></span>${t.free ? "Free template" : t.price + " · Framer template"}</div>
</div>
<div class="shot"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(ROOT, t.cover)).toString("base64")}"></div>
</body></html>`;

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const t of templates) {
    if (t.gallery) { console.log("og: " + t.slug + " (skipped, uses marketing image directly)"); continue; }
    await p.setContent(cardHtml(t), { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(ROOT, "assets", "og", t.slug + ".jpg"), type: "jpeg", quality: 88 });
    console.log("og:", t.slug);
  }
  // home card — globe-led brand card
  const globe64 = fs.readFileSync(path.join(ROOT, "assets", "brand", "globe-round.png")).toString("base64");
  await p.setContent(`<!DOCTYPE html><html><head><style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #08090c; color: #fff; font-family: "Geist", sans-serif; overflow: hidden; position: relative; }
  body::before { content: ""; position: absolute; inset: 0; background: radial-gradient(55% 65% at 72% 40%, rgba(116,92,255,0.22) 0%, rgba(0,0,0,0) 70%), radial-gradient(40% 50% at 30% 20%, rgba(67,199,255,0.1) 0%, rgba(0,0,0,0) 72%); }
  .left { position: absolute; left: 84px; top: 0; bottom: 0; width: 560px; display: flex; flex-direction: column; justify-content: center; gap: 28px; z-index: 2; }
  .wm { font-family: "Averia Serif Libre", serif; font-size: 30px; color: #f1f0ec; }
  h1 { font-family: "Instrument Serif", serif; font-weight: 400; font-size: 66px; line-height: 1.02; letter-spacing: -0.015em; }
  h1 i { font-style: italic; }
  .tag { color: #a9a7b3; font-size: 23px; line-height: 1.45; max-width: 520px; }
  .globe { position: absolute; right: 60px; top: 50%; transform: translateY(-50%); width: 470px; height: 470px; }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Averia+Serif+Libre&family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&display=swap" rel="stylesheet">
  </head><body>
  <div class="left">
    <div class="wm">${site.name}${site.tld}</div>
    <h1>A production-ready website in <i>ten minutes.</i></h1>
    <p class="tag">Premium Framer templates with a point of view. Pick one, swap the copy, publish.</p>
  </div>
  <img class="globe" src="data:image/png;base64,${globe64}">
  </body></html>`, { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(ROOT, "assets", "og", "home.jpg"), type: "jpeg", quality: 88 });
  console.log("og: home");
  await b.close();
})();
