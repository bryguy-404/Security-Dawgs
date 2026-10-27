# Implementation verification

Current production site: https://security-dawgs.pages.dev/. The older preview address redirects here. The October 26 contact-form verification below supersedes the earlier email-link-only flow.

Completed October 21, 2026.

The visitor flow is homepage → service page → email request to Luke. This is a static marketing site with no API, database, or form submission.

- `npm run check`: 12 Astro files, zero errors, warnings, or hints.
- `npm run build`: four marketing pages plus a 404 page generated successfully.
- Copy audit: all 111 content values from the supplied copy model appear in the corresponding generated pages.
- Link audit: 97 links across the four pages resolve to generated routes, existing section IDs, or the approved email address with a subject.
- Browser checks: all four pages at widths of 320px, 768px, and 1440px; no horizontal overflow or unloaded images. One H1 per page.
- Visual review: homepage, MDR, compliance, and awareness-training desktop layouts; homepage and compliance mobile layouts.
- Interaction checks: homepage services navigation, mobile menu open/close, Escape dismissal with focus returned to the summary, mobile navigation to MDR, and expanding a service reason.
- Browser warning/error log: empty at final verification.
- No forms were introduced. Email destinations and subjects were inspected without sending messages.
- Original DOCX/PDF attachments are absent from the production output. Cloudflare `_headers` and `404.html` are present.
- Production output totals approximately 551 KB, including the optimized transparent crest and bundled fonts.
- The deployment ZIP contains only the generated static files, with `index.html` at its root.

The initial local build was handed off before deployment. The subsequent Cloudflare preview deployment is recorded below.

## Motion and hero refinement

- Reworked the tilted crest panel's spacing: the caption has 25–32px of clearance in the checked desktop, tablet, and mobile layouts.
- Added staggered headline entrances, a short crest entrance and light sweep, diagonal background accents, one-time scroll reveals, and hover/disclosure transitions.
- `npm run check`: 13 files, zero errors, warnings, or hints. Static production build succeeded.
- Browser layout checks: home at 320px, 390px, 768px, 1024px, and 1440px; all three service pages at 320px, 768px, and 1440px. No horizontal overflow or clipped headings.
- Verified the services anchor, mobile menu Escape dismissal with focus restoration, and expanded service details. No browser warnings or errors after the changes loaded.
- CSS disables animations/transitions for reduced motion; the scroll observer also honors that preference and cancels active reveals when focus enters a control. Scroll content has no default hidden state.

## Cloudflare Pages preview deployment

- Public URL: https://security-dawgs-preview.pages.dev/
- Deployment: `9efd9dfc-e4a7-4766-9956-3fcfcc420b52`, built from website commit `44cac63`.
- Cloudflare reports deployment stage `deploy` with status `success`.
- Uploaded 15 static assets plus `_headers`; private source attachments were not uploaded.
- Visited all four public routes in a browser; correct headings, styling, and approved email destinations were present. The hero crest loaded, and browser warning/error logs were empty.
- A separate Python HTTP probe received HTTP 403; browser access to the public URL worked without authentication.
- This is a Direct Upload project. GitHub auto-deployment is not enabled: Cloudflare rejected Git integration with error `8000093` (repository associated with a different Cloudflare account).

## Client feedback revision — October 26, 2026

The revised visitor flow is homepage asset-discovery illustration → Asset Intelligence, an existing service, or a named industry → an email request to Luke. The demonstration uses the client's illustrative figures and does not scan a visitor's network.

- Implemented the supplied homepage messaging, visual cleanup, Asset Intelligence page, Human Risk navigation label, and all eight industry write-ups. Preserved the existing awareness-training URL.
- Used the explicitly designated top-of-page headline and CTA. Used the alternate visibility headline below the hero and organized the industry copy on one page with accessible disclosures.
- Removed decorative small labels and section numbering. Replaced the free threat-assessment offer; retained the separately supplied compliance-review and phishing-test offers.
- `npm run check`: 17 files, zero errors, warnings, or hints.
- `npm run build`: six marketing pages and `404.html` built successfully.
- Copy audit: every supplied Asset Intelligence content line and industry passage appears in its generated page; all retained service-copy values and the homepage questions are present. Comparison normalizes case, punctuation, and whitespace.
- Link audit: all 176 links resolve to a generated route, an existing section ID, or the approved Luke email destination. One H1 per page and no forms.
- Browser layout checks: all six routes at 1440px, 768px, and 320px. Fixed the narrow Industries headline and disclosure-name overflow, then verified that route again at 320px with no overflow or clipped headings. No broken images were reported.
- Visual review: desktop home, Asset Intelligence, and compliance; mobile home, asset map, and expanded healthcare content.
- Interaction checks: both map states and pressed/status updates; homepage-to-healthcare deep link opens the correct disclosure; disclosure mouse and Enter interactions; mobile menu opens and Escape returns focus to its summary; Asset Intelligence question disclosure; assessment email destination.
- Browser warning/error log: empty during local verification.
- Reduced-motion CSS disables entrance/transition animation; the existing scroll observer honors that setting and keyboard focus. Content is visible by default without JavaScript.
- Production output: 18 static files, approximately 658 KB. No original client documents or private correspondence in the build output.

### Published revision

- Website commit: `6cf6753`.
- Immutable deployment: https://1f315a85.security-dawgs-preview.pages.dev/
- Existing public URL updated: https://security-dawgs-preview.pages.dev/
- Wrangler reported deployment success; uploaded eight changed assets, reused nine assets, and uploaded `_headers`.
- Verified all six public routes, current titles/headlines, styles, original crest, and Luke email destinations. No desktop overflow or broken images were reported.
- Verified the built JavaScript on the public site: both asset-map states work and the healthcare deep link opens its disclosure.
- Browser warning/error log remained empty during public-route verification.

## Contact form — October 26, 2026

The current visitor flow is any contact or assessment CTA → shared contact form → server-side Turnstile verification → Resend notification → confirmation message. The existing approved page copy and button labels remain intact.

- Added the five transcript-requested fields: name, email, phone, company name, and company size. Company size uses employee ranges. All five fields are required.
- The Git-connected `security-dawgs` Pages project deploys from `main`. Form implementation commit `60433ae` deployed successfully at https://9aaaae9d.security-dawgs.pages.dev/.
- The sending subdomain is verified in Resend. The replacement API key is restricted to sending from that domain; both it and the Turnstile secret are encrypted production secrets in Cloudflare.
- Eight handler tests pass, covering validation, body limits, origin checks, honeypot behavior, missing credentials, Turnstile failures and hostname/action checks, fixed recipient and Reply-To, HTML escaping, idempotency, and provider failures.
- Astro check: 24 files, zero errors, warnings, or hints. Production build: seven pages plus a 404. Pages Function bundle compiled successfully.
- Content/link audit: all approved copy retained; 200 links resolve; one H1 on each page; one form.
- Local visual checks at desktop and 390px/320px mobile widths. The Turnstile widget switches to compact below 300px of available form width; the 320px page has no horizontal overflow. Live desktop layout also has no horizontal overflow.
- Live browser submission passed the real managed Turnstile challenge, reached the Pages Function, and displayed “Request received.” Resend confirmed delivery to Luke. The user-approved separate test copy to Bryan was also confirmed delivered. Ongoing submissions are fixed to Luke, with the visitor's address as Reply-To.
- Live empty-form submission focuses the Name field and sends nothing. Separate HTTP checks returned 405 for GET, 403 for a foreign origin, and 400 for a missing security token.
- No application errors were observed. Turnstile's third-party iframe emits opaque console diagnostics during rendering/expiration; its actual challenge and submission flow succeeded.
- Added an explicit application User-Agent to the Resend API request as required by its API documentation; reran all eight handler tests successfully.
- The older preview project now serves a static redirect (deployment `f5b68e68`) to the Git-connected site. Verified HTTP 302 redirects for home, contact including its interest query, and industries, preserving paths and query strings. No secrets or Functions are deployed to the legacy redirect project.
- Private credentials and source correspondence are absent from Git and the static build output.
