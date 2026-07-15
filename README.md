# framer-templates

Carmy Studio's template storefront — a zero-dependency static site.

- `templates.json` — the whole catalog. Add a template = add an entry + a cover in `assets/covers/`, push. Done.
- `build.js` — bakes `dist/` (home + one SEO page per template) from the JSON. `node build.js` to build locally.
- Deploys automatically to GitHub Pages on push to `main`.

Buy CTAs point at Framer Marketplace listings (or a live demo's buy button until a listing exists). Update the `get` field per template.
