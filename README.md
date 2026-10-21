# Security Dawgs

Four-page Astro marketing website, ready for static hosting on Cloudflare Pages.

## Local development

Use Node 24.19.0 (pinned in `.node-version` and `.nvmrc`).

```sh
npm ci
npm run dev
```

Astro prints the local URL; it selects another port if the default is occupied. Astro 7 may run the development server as a background process. Use `npx astro dev status`, `npx astro dev logs`, or `npx astro dev stop` from this project to manage it.

```sh
npm run check
npm run build
npm run preview
```

## Cloudflare Pages

- Framework preset: Astro
- Build command: `npm run build`
- Build output directory: `dist`
- Node version: `24.19.0` (set `NODE_VERSION` in the build environment if needed)
- No runtime adapter, database, API key, or environment secret is required.

For a direct upload, build locally and upload the contents of `dist`. Do not upload the project root; it contains development files.

The generated `404.html` gives Cloudflare Pages a proper fallback page rather than treating the site as a single-page app. `public/_headers` supplies basic response headers and caches hashed build assets.

## Pages

| Page | Route |
| --- | --- |
| Home | `/` |
| Managed Detection & Response | `/mdr/` |
| Compliance Advisory | `/compliance/` |
| Security Awareness Training | `/awareness-training/` |

## Content and design

- `src/data/content.json`: client-supplied page copy, extracted from the original document and preserved as requested.
- `src/data/site.ts`: contact destination and service-specific email subjects.
- `src/styles/global.css`: responsive design system and page styling.
- `src/components/ServiceArt.astro`: lightweight CSS/SVG service illustrations.
- `public/images/security-dawgs.webp`: optimized copy of the original transparent crest.

The site uses locally bundled Inter fonts, red/cream/black sections, yellow accents, a large unmodified crest, native expandable service details, and a mobile menu that supports Escape dismissal. Decorative radar motion respects reduced-motion preferences.

All request buttons open an email to `luke@wyckoffconsulting.com`, as Bryan approved. They do not send automatically. No form or Resend integration has been added.

Domain setup is deliberately deferred. When a final hostname is selected, canonical URLs, absolute social-preview URLs, and a sitemap can be configured together.
