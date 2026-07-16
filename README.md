# getsites.co — template storefront

Zero-dependency static site. `templates.json` is the whole catalog; `build.js` bakes `dist/`; GitHub Actions deploys on push to main (~30s).

## Add a template
1. Add one entry to `templates.json` (copy an existing one: slug/name/tagline/description/category/tags/price/free/new/featured/status/cover/demo/get).
2. Drop a cover at `assets/covers/<slug>.jpg` (1600×1000 screenshot of the live demo).
3. Generate its share card: `node tools/og-cards.js` (needs Chrome; writes `assets/og/<slug>.jpg`).
4. `node build.js` to check locally, then commit + push. Done — home, /templates/, the detail page, the wire, the quiz matching, sitemap and OG cards all update from the JSON.

## When the domain (getsites.co) is bought
1. Set Pages custom domain in repo settings (Settings → Pages → Custom domain) — this commits a `CNAME` file.
2. Change `site.baseUrl` in `templates.json` to `https://getsites.co` and push.
3. DNS: `A` records to GitHub Pages IPs or `CNAME` → `heisenbergg-labs.github.io`.

## Notes
- Fonts: Instrument Serif + Figtree (Google Fonts). Gold shimmer = `.goldtext`.
- Quiz: client-side matching; discount code shown is `PICKED30` — must exist in Polar.
- Analytics: GoatCounter (`getsites.goatcounter.com`) — pageviews + `quiz-open` / `quiz-complete` events.
- The 4 value-prop icons live in `assets/art/{triangle,sphere,torus,slab}.png`.
