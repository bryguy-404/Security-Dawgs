# Security Dawgs

Six-page Astro marketing website, hosted as a static site on Cloudflare Pages.

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

Live client preview: **https://security-dawgs-preview.pages.dev/**

The `security-dawgs-preview` project uses Direct Upload. GitHub pushes do not automatically update this preview. To publish a revision after checking it locally:

```sh
npm run build
npx wrangler@4.151.3 pages deploy dist --project-name security-dawgs-preview --branch main
```

Use the Cloudflare account that owns `security-dawgs-preview`. The source remains in `bryguy-404/Security-Dawgs`. Cloudflare rejected the initial Git-connected project with an account-linking error; that integration can be resolved separately. Native Git integration would use a separate Pages project, as [Direct Upload projects cannot be converted to Git integration](https://developers.cloudflare.com/pages/get-started/direct-upload/).

Build settings for a future Git-connected project:

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
| Asset Intelligence | `/asset-intelligence/` |
| Managed Detection & Response | `/mdr/` |
| Compliance Advisory | `/compliance/` |
| Human Risk | `/awareness-training/` |
| Industries | `/industries/` |

## Content and design

- `src/data/content.json`: retained client-supplied MDR, compliance, and human-risk copy.
- `src/data/feedback.json`: client-supplied October 26 messaging, Asset Intelligence copy, and eight industry write-ups.
- `src/data/site.ts`: contact destination and service-specific email subjects.
- `src/styles/global.css`: responsive design system and page styling.
- `src/styles/motion.css`: hero entrances and interaction transitions.
- `src/scripts/motion.ts`: one-time scroll reveals with reduced-motion and keyboard-focus handling.
- `src/components/ServiceArt.astro`: lightweight CSS/SVG service illustrations.
- `src/components/AssetDiscovery.astro`: illustrative asset map with accessible inventory/connection controls; the figures are supplied examples, not a live network scan.
- `src/components/DependencyPath.astro`: the supplied example connecting a server to business services and facilities.
- `public/images/security-dawgs.webp`: optimized copy of the original transparent crest.

The site uses locally bundled Inter fonts, red/cream/black sections, yellow accents, the original crest, native expandable service and industry details, and a mobile menu that supports Escape dismissal. The October 26 revision removes decorative small labels and section numbering, leads with asset visibility and blast radius, and keeps meaningful example figures. Industry deep links automatically open their matching disclosure. Hero entrances settle after a short sequence; sections reveal once as they enter the viewport. Motion respects reduced-motion preferences, and page content remains readable without JavaScript.

All request buttons open an email to `luke@wyckoffconsulting.com`, as Bryan approved. They do not send automatically. No form or Resend integration has been added.

Domain setup is deliberately deferred. When a final hostname is selected, canonical URLs, absolute social-preview URLs, and a sitemap can be configured together.
