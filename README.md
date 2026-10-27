# Security Dawgs

Seven-page Astro marketing website on Cloudflare Pages, with a Pages Function for contact submissions.

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

Current Git-connected website: **https://security-dawgs.pages.dev/**

The `security-dawgs` project in Arambula722@gmail.com's Cloudflare account deploys automatically from `main` in `bryguy-404/Security-Dawgs`. Build command: `npm run build`; output: `dist`. Cloudflare also compiles the root `functions/` directory. `public/_routes.json` limits function requests to `/api/*`, keeping the marketing pages static.

The older **https://security-dawgs-preview.pages.dev/** project is a separate Direct Upload preview in another account. Updating GitHub does not update that older address.

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
- No Astro runtime adapter or database is required. The form requires the private secrets documented below.

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
| Contact | `/contact/` |

## Content and design

- `src/data/content.json`: retained client-supplied MDR, compliance, and human-risk copy.
- `src/data/feedback.json`: client-supplied October 26 messaging, Asset Intelligence copy, and eight industry write-ups.
- `src/data/site.ts`: contact links with service context carried to the shared form.
- `src/styles/global.css`: responsive design system and page styling.
- `src/styles/motion.css`: hero entrances and interaction transitions.
- `src/scripts/motion.ts`: one-time scroll reveals with reduced-motion and keyboard-focus handling.
- `src/components/ServiceArt.astro`: lightweight CSS/SVG service illustrations.
- `src/components/AssetDiscovery.astro`: illustrative asset map with accessible inventory/connection controls; the figures are supplied examples, not a live network scan.
- `src/components/DependencyPath.astro`: the supplied example connecting a server to business services and facilities.
- `public/images/security-dawgs.webp`: optimized copy of the original transparent crest.

The site uses locally bundled Inter fonts, red/cream/black sections, yellow accents, the original crest, native expandable service and industry details, and a mobile menu that supports Escape dismissal. The October 26 revision removes decorative small labels and section numbering, leads with asset visibility and blast radius, and keeps meaningful example figures. Industry deep links automatically open their matching disclosure. Hero entrances settle after a short sequence; sections reveal once as they enter the viewport. Motion respects reduced-motion preferences, and page content remains readable without JavaScript.

## Contact form

All contact/assessment request buttons open `/contact/`. The form collects the client's five requested fields: name, email, phone, company name, and company size (employee ranges). The originating call to action is included in the email without adding a visible field.

`functions/api/contact.js` validates the request, verifies Turnstile on the server (including hostname and action), and sends the notification through Resend. Delivery is fixed to `luke@wyckoffconsulting.com`; the sender is `Security Dawgs <website@forms.securitydawgs.com>`, and Reply-To is the visitor's email. The verified sending subdomain does not change the website's address or the recipient's mailbox.

Production secrets, stored encrypted in Cloudflare Pages settings:

- `RESEND_API_KEY`: sending-only permission scoped to `forms.securitydawgs.com`.
- `TURNSTILE_SECRET_KEY`: secret for the Security Dawgs Contact Form widget.

The public widget key is in `src/data/form.ts`; `PUBLIC_TURNSTILE_SITE_KEY` can override it for development using Cloudflare's documented test site key. The production widget is restricted to the two Security Dawgs Pages hostnames, including their deployment subdomains. Localhost is intentionally not allowed by the production widget. Preview environments need their own configured secrets before submissions will work.

The handler enforces same-origin requests, bounded input and body sizes, a honeypot, fixed email destinations, HTML escaping, provider timeouts, and Resend idempotency. It returns success only after Resend accepts the message. The browser preserves entered details on failure and resets expired/consumed challenges for retries. No CRM, database, attachment upload, or automatic visitor email is included.

Run `npm test` for focused handler tests, `npm run check` for Astro/TypeScript diagnostics, and `npm run build` for the site. `wrangler pages functions build` checks the Pages Function bundle. A live browser submission is needed to verify production Turnstile and email delivery end to end.

Domain setup is deliberately deferred. When a final hostname is selected, canonical URLs, absolute social-preview URLs, and a sitemap can be configured together.
