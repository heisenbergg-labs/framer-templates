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
    await p.setContent(cardHtml(t), { waitUntil: "networkidle" });
    await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(ROOT, "assets", "og", t.slug + ".jpg"), type: "jpeg", quality: 88 });
    console.log("og:", t.slug);
  }
  // home card
  await p.setContent(cardHtml({ name: "Premium templates, easy to make yours.", tagline: site.description.slice(0, 90) + "…", price: "", free: true, cover: "assets/covers/aubrey.jpg", slug: "home" }).replace('Free template', 'getsites.co'), { waitUntil: "networkidle" });
  await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(ROOT, "assets", "og", "home.jpg"), type: "jpeg", quality: 88 });
  console.log("og: home");
  await b.close();
})();
