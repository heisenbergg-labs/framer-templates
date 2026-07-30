/* Guides: answer pages for questions template buyers actually search.
   Each entry becomes /learn/<slug>/. Keep answers direct and honest —
   the first paragraph should fully answer the question on its own.
   Voice: plain, no hype, no em-dashes. Facts stay evergreen (no plan
   prices, no feature claims that churn). */

module.exports = [
  {
    slug: "is-framer-free",
    category: "Basics",
    title: "Is Framer Free?",
    question: "Is Framer free to use?",
    description: "What Framer's free plan includes, what paid plans add, and what a template site actually costs to run.",
    answer: "Yes, Framer is free to start. You can design a full website and publish it on a free framer.app address without paying anything. You pay for a plan when you want your own domain, more CMS items, or higher traffic limits.",
    body: `
<h2>What the free plan covers</h2>
<p>The free tier is a real working plan, not a trial. You can remix a template, edit everything on the canvas, and publish a live site on a framer.app subdomain. It shows a small Framer badge and skips custom domains, but nothing about the design is locked.</p>
<h2>When you need a paid plan</h2>
<p>The practical trigger is a custom domain. The moment you want yoursite.com instead of yoursite.framer.app, you move to a paid site plan. Paid tiers also raise CMS and bandwidth limits. Current prices are on <a href="https://www.framer.com/pricing" target="_blank" rel="noreferrer">framer.com/pricing</a>; the entry plan costs about as much as two coffees a month.</p>
<h2>What a template site really costs</h2>
<p>A typical setup is: template (free to $149, one time), a domain (around $10 a year), and a Framer site plan. There is no separate hosting bill. Framer hosting, SSL and the CDN are part of the plan.</p>`,
    related: ["free", "for-small-businesses"],
  },
  {
    slug: "do-you-need-to-code-to-use-framer",
    category: "Basics",
    title: "Do You Need to Know Code to Use Framer?",
    question: "Do you need to know how to code to use Framer?",
    description: "What building and editing a Framer site involves when you don't write code.",
    answer: "No. Framer is a visual canvas: you edit text by double-clicking it, swap images by replacing them, and move sections by dragging. Code exists in Framer, but it is optional and most template buyers never touch it.",
    body: `
<h2>What editing actually feels like</h2>
<p>Editing a Framer site is closer to editing a slide deck than programming. Text is text, images are images, and layout is drag and drop. If you can use Google Slides, you can edit a well-built Framer template.</p>
<h2>Where code can appear</h2>
<p>Framer supports custom code components for special effects, and developers sometimes use them. A properly built template keeps these optional and decorative, so removing or ignoring them never breaks your content. That is exactly how the templates on this site are built: the essential parts are always native, editable layers.</p>
<h2>The honest limits</h2>
<p>You still make design decisions: what to write, which photos to use, when to stop adjusting. A template solves the hard part by giving you a finished design where your only job is replacing the content.</p>`,
    related: ["for-small-businesses", "free"],
  },
  {
    slug: "what-is-a-framer-template",
    category: "Templates",
    title: "What Is a Framer Template?",
    question: "What is a Framer template and how does it work?",
    description: "How Framer templates work: remixing, editing on the canvas, and publishing to your own domain.",
    answer: "A Framer template is a complete, finished website that copies into your own Framer account with one click. You get every page, layout and animation working from the first second; you replace the words and photos with yours and publish.",
    body: `
<h2>How you get it</h2>
<p>Templates are delivered as a remix link. Opening it copies the entire site into your Framer workspace: pages, styles, breakpoints, animations, CMS content. Nothing to install and no files to upload.</p>
<h2>What you can change</h2>
<p>Everything. Text, images, colors, fonts, sections, whole pages. A good template is built so the everyday edits are easy: double-click any text to rewrite it, click any photo to replace it, duplicate a card to add one more.</p>
<h2>Template vs. starting blank</h2>
<p>Starting blank means making hundreds of design decisions before anything looks right. A template makes those decisions for you, coherently, and leaves you the ones only you can make: your words, your images, your offer. That is the ten-minutes-to-live difference.</p>`,
    related: ["for-small-businesses", "free"],
  },
  {
    slug: "how-to-use-a-framer-template",
    category: "Templates",
    title: "How to Use a Framer Template",
    question: "How do you use a Framer template?",
    description: "The exact steps from buying or picking a template to a live site: remix, edit, connect a domain, publish.",
    answer: "Open the template's remix link, and the whole site copies into your free Framer account. Edit the text and images on the canvas, connect your domain in site settings, and press Publish. For most people that is genuinely under an hour of work.",
    body: `
<h2>The five steps</h2>
<ul>
<li><b>Remix.</b> Open the remix link you received. The full site appears in your Framer dashboard as your own project.</li>
<li><b>Rewrite.</b> Double-click each text block and put your words in. Start with the homepage headline; everything else follows.</li>
<li><b>Replace images.</b> Click an image, choose replace, upload yours. Keep roughly the same orientation and the layout holds.</li>
<li><b>Connect your domain.</b> Site settings, domains, add your domain, follow the two DNS records it shows you.</li>
<li><b>Publish.</b> One button. The site is live on your domain with hosting and SSL handled.</li>
</ul>
<h2>The one mistake to avoid</h2>
<p>Do not copy pages out of the template into a different blank project. Styles and components can detach and things quietly break. Work inside the remixed project itself; it exists to be edited.</p>`,
    related: ["for-small-businesses"],
  },
  {
    slug: "how-to-edit-a-framer-template",
    category: "Templates",
    title: "How to Edit a Framer Template",
    question: "How do you edit a Framer template?",
    description: "Editing text, images, colors, fonts and sections in a Framer template without breaking the design.",
    answer: "Double-click text to rewrite it, click images to replace them, and use the layers panel to duplicate or remove sections. In a well-built template every visible element is a native, editable layer, so normal edits cannot break the design.",
    body: `
<h2>The everyday edits</h2>
<p>Text: double-click, type, click away. Images: select, replace, upload. Cards in a grid: right-click one and duplicate it, then edit the copy. Sections you do not need: select the section frame in the layers panel and delete it; the page closes the gap on its own.</p>
<h2>Changing the look</h2>
<p>Good templates use shared color and text styles. Change a style once and it updates everywhere, which is how you re-skin an entire site in minutes without hunting for every heading. Fonts swap in the same way from the site's font settings.</p>
<h2>If something looks wrong</h2>
<p>Check the breakpoint you are editing. Framer sites have desktop, tablet and phone layouts; make your edit on desktop first, then glance at the phone breakpoint to confirm it reads well there too. Undo is always safe: Framer keeps full version history.</p>`,
    related: ["for-small-businesses"],
  },
  {
    slug: "how-to-connect-a-domain-in-framer",
    category: "Publishing",
    title: "How to Connect a Domain in Framer",
    question: "How do you connect a custom domain to a Framer site?",
    description: "Connecting a domain you own to your Framer site: settings, the two DNS records, and how long it takes.",
    answer: "In your Framer project open Site Settings, go to Domains, and add your domain. Framer shows you two DNS records to add wherever you bought the domain. Add them, wait for verification, publish, and the site is live on your domain with SSL included.",
    body: `
<h2>The exact flow</h2>
<ul>
<li>Buy a domain anywhere (Namecheap, GoDaddy, Cloudflare, Google-transferred registrars all work).</li>
<li>In Framer: Site Settings, then Domains, then add your domain. It shows an A record and a CNAME (for www).</li>
<li>In your registrar's DNS panel, add those two records exactly as shown.</li>
<li>Back in Framer, wait for the checkmarks. This usually takes minutes, occasionally a few hours.</li>
<li>Publish. HTTPS certificates are issued automatically; there is nothing to configure.</li>
</ul>
<h2>If verification stalls</h2>
<p>Nearly every stall is an old conflicting record: a previous A record or a parking-page CNAME sitting on the same name. Delete the leftovers so only Framer's records remain, and check again. If your DNS provider proxies traffic (orange cloud on Cloudflare), turn the proxy off for these records.</p>`,
    related: ["for-small-businesses"],
  },
  {
    slug: "does-framer-host-your-website",
    category: "Publishing",
    title: "Does Framer Host Your Website?",
    question: "Does Framer host your website, or do you need separate hosting?",
    description: "How Framer hosting works: what is included, performance, SSL, and whether you ever need a separate host.",
    answer: "Framer hosts your site for you; there is no separate hosting to buy or configure. Publishing puts your site on Framer's global CDN with SSL, and that is included in the site plan.",
    body: `
<h2>What is included</h2>
<p>Hosting on a global CDN, automatic HTTPS certificates, and publishing built into the editor. When you press Publish, the live site updates within seconds. There is no server to manage, no updates to install, and no separate hosting bill.</p>
<h2>Why this matters for template buyers</h2>
<p>The classic small-site stack (hosting account, CMS install, theme, plugins, updates) is where sites rot and bills accumulate. The Framer model collapses it: template plus plan, and the infrastructure part of running a website stops being your job.</p>
<h2>The trade-off</h2>
<p>You are inside Framer's platform: you cannot export the site and run it elsewhere as-is. For a marketing site, portfolio or venue site, that trade is almost always worth it; the entire maintenance burden disappears.</p>`,
    related: ["for-small-businesses"],
  },
  {
    slug: "is-framer-good-for-seo",
    category: "SEO",
    title: "Is Framer Good for SEO?",
    question: "Is Framer good for SEO?",
    description: "How Framer sites perform in search: speed, semantics, metadata, sitemaps, and what still depends on you.",
    answer: "Yes. Framer sites are fast, served from a CDN, and give you the controls Google cares about: titles, descriptions, semantic tags, automatic sitemaps, and clean URLs. The platform will not hold you back; rankings then depend on your content, like on any platform.",
    body: `
<h2>What Framer handles for you</h2>
<p>Published Framer sites are static and fast, which serves Core Web Vitals well. Every page has editable titles and meta descriptions, images take alt text, headings can be proper h1/h2 semantic tags, and the sitemap regenerates on publish.</p>
<h2>What still depends on you</h2>
<p>Search engines rank pages that answer things people search for. A beautiful five-page site with generic copy ranks for its brand name and little else. Write pages in the words your customers use, one topic per page, and let the platform do the technical part.</p>
<h2>Templates and SEO</h2>
<p>A template neither helps nor hurts rankings by itself; Google does not know or care that a design started as a template. What matters is that the template uses semantic headings and proper structure, which is part of how the templates here are built and reviewed.</p>`,
    related: ["for-small-businesses", "for-consultants"],
  },
  {
    slug: "can-you-build-an-online-store-in-framer",
    category: "Commerce",
    title: "Can You Build an Online Store in Framer?",
    question: "Can you build an online store or sell products with Framer?",
    description: "What selling on a Framer site looks like: checkout links, embeds, and when a dedicated store platform is the better tool.",
    answer: "Yes, with the right shape. Framer is excellent at the storefront: product pages, lookbooks, drops, links straight to checkout. The checkout itself typically runs through a payment service like Stripe, Lemon Squeezy, Polar or Gumroad, linked or embedded from your Framer pages.",
    body: `
<h2>The pattern that works</h2>
<p>Design the product experience in Framer, where you have full visual control, and point every buy button at a hosted checkout. Payment providers give you a secure checkout page per product; buyers tap through, pay, and get their receipt. No cart plugin to maintain and PCI compliance stays the provider's problem.</p>
<h2>When you want a dedicated store platform</h2>
<p>If you need a large multi-item cart, inventory sync, shipping rates and tax tables across hundreds of physical products, a dedicated commerce platform is the better tool. Framer shines up to that point: digital products, services, drops, bookings and small catalogs.</p>
<h2>For creators specifically</h2>
<p>A creator storefront (your products, your links, your content on your own domain) is exactly this pattern, and it is what our creator templates are built for.</p>`,
    related: ["for-creators", "linktree-alternative"],
  },
  {
    slug: "framer-vs-wordpress",
    category: "Compare",
    title: "Framer vs WordPress for a Small Site",
    question: "Should you use Framer or WordPress for a small website?",
    description: "An honest comparison for a portfolio, venue or small-business site: maintenance, speed, editing, and cost shape.",
    answer: "For a portfolio, venue or small-business site, Framer is usually the calmer choice: no hosting setup, no plugin updates, no security patching, and editing happens on a visual canvas. WordPress still wins when you need its ecosystem: complex plugins, huge blogs, or full ownership of the stack.",
    body: `
<h2>The real difference: maintenance</h2>
<p>A WordPress site is software you run: hosting, updates, plugins, backups, security. Some people are happy running it; many small-site owners are not, and pay someone monthly to do it. A Framer site has no stack to maintain. Publish and it stays published.</p>
<h2>Editing experience</h2>
<p>WordPress editing happens in an admin dashboard one step removed from the design. Framer editing happens on the design itself: what you click is what changes. For a non-technical owner updating a menu or swapping photos, that difference is the whole game.</p>
<h2>Where WordPress is still right</h2>
<p>Content operations at scale (a publication with thousands of posts), heavy plugin needs (memberships, LMS, forums), or a hard requirement to self-host. Those are real cases; a five-page business site is not one of them.</p>`,
    related: ["for-small-businesses"],
  },
  {
    slug: "framer-vs-webflow-templates",
    category: "Compare",
    title: "Framer vs Webflow for Templates",
    question: "Framer or Webflow: which is better if you're starting from a template?",
    description: "How the two platforms compare specifically for someone buying a template and editing it themselves.",
    answer: "If you are buying a template and editing it yourself, Framer's editing model is simpler: it behaves like a design canvas, while Webflow behaves like a visual CSS editor. Webflow rewards people who think in boxes and classes; Framer rewards people who just want to change the words and pictures.",
    body: `
<h2>The learning curve difference</h2>
<p>Webflow exposes the mechanics of CSS: classes, combo classes, cascading styles. Powerful, and genuinely loved by developers who want that control. But a template buyer editing text at 11pm does not want a cascade; they want double-click and type. That is Framer's model.</p>
<h2>Both are legitimate</h2>
<p>Both platforms host fast sites, handle SEO basics properly, and have real template ecosystems. Teams with a dedicated web person do great on either. The distinction is who has to touch the site day to day: if the answer is "the owner", Framer templates tend to stay maintained and Webflow templates tend to fossilize.</p>
<h2>Our position, plainly</h2>
<p>We build on Framer because the people who buy templates from us edit the sites themselves. Every template here is built native-first so those edits stay safe.</p>`,
    related: ["for-small-businesses", "for-freelancers"],
  },
  {
    slug: "what-is-the-framer-cms",
    category: "CMS",
    title: "What Is the Framer CMS?",
    question: "What is the Framer CMS and when do you need it?",
    description: "How Framer's CMS works in plain terms: collections, fields, and what template buyers use it for.",
    answer: "The Framer CMS is a built-in content database for things that repeat: blog posts, projects, menu items, listings. Instead of designing each one, you design the layout once and fill in a form per item. Adding your tenth project takes a minute, not an afternoon.",
    body: `
<h2>How it works</h2>
<p>A collection is a list (Projects, Posts, Rooms). Each item has fields you define: title, image, price, description. Pages then display the collection through a designed layout, and detail pages generate automatically for every item. Add an item, publish, and it appears everywhere it should.</p>
<h2>When you actually need it</h2>
<p>The threshold is repetition. Three services on a homepage can be plain cards on the canvas. Thirty portfolio pieces, a weekly blog, or a menu that changes seasonally belong in the CMS. Many good templates mix both, and that is the right instinct.</p>
<h2>In our templates</h2>
<p>Where a template ships with CMS collections (projects in CUT, products in The Collection), the layouts are pre-connected. Your job is filling in items, not wiring anything.</p>`,
    related: ["for-creators", "for-video-editors"],
  },
  {
    slug: "how-much-does-a-framer-website-cost",
    category: "Basics",
    title: "How Much Does a Framer Website Cost?",
    question: "How much does it cost to build and run a website with Framer?",
    description: "The full, honest cost shape of a template-based Framer site: template, domain, plan, and what you are not paying for.",
    answer: "A template-based Framer site has three costs: the template (free to around $150, once), a domain (about $10 a year), and a Framer site plan (a modest monthly fee that includes hosting). Compare that to a few thousand for a custom design, plus hosting, plus a maintenance retainer.",
    body: `
<h2>The three line items</h2>
<ul>
<li><b>Template:</b> one-time. Free templates exist (including here); premium ones typically run $49 to $149 and buy you a design a studio labored over.</li>
<li><b>Domain:</b> roughly $10 to $20 a year from any registrar.</li>
<li><b>Framer plan:</b> monthly, includes hosting, SSL and publishing. Exact tiers are on framer.com/pricing.</li>
</ul>
<h2>What is missing from the list</h2>
<p>Hosting bills, plugin licenses, security services, and the designer's invoice. The template replaces the design engagement; the platform replaces the infrastructure. That is why the total cost of a serious-looking site dropped from thousands to dinner-for-two per month.</p>
<h2>When custom is worth it</h2>
<p>If your product IS the website (a startup differentiating on brand), custom design earns its price. For a portfolio, venue, practice or storefront, a well-chosen template gets you 95% of the result for 2% of the cost.</p>`,
    related: ["free", "for-small-businesses"],
  },
  {
    slug: "can-you-blog-in-framer",
    category: "CMS",
    title: "Can You Blog in Framer?",
    question: "Can you run a blog on a Framer website?",
    description: "Blogging on Framer: how posts work through the CMS, what writing feels like, and the practical limits.",
    answer: "Yes. Blogs in Framer run on the CMS: each post is a CMS item with a rich-text body, and the blog index and post pages generate from layouts you design once. For a personal or business blog publishing a few posts a month, it works cleanly.",
    body: `
<h2>How posting works</h2>
<p>You write in a rich-text field: headings, images, links, embeds. Publish and the post appears on the index, gets its own URL, and inherits the design. No plugins, and the post pages are as fast as the rest of the site.</p>
<h2>The practical limits</h2>
<p>CMS item counts are limited by plan tier, and there is no multi-author editorial workflow with drafts-and-review queues. A solo writer or a small business publishing steadily will not hit these walls; a magazine with five editors will.</p>
<h2>Why bother blogging at all</h2>
<p>Search traffic. Pages that answer questions your customers search for compound over months into free, permanent traffic. It is the same reason this guide section exists.</p>`,
    related: ["for-consultants", "for-personal-brands"],
  },
];
