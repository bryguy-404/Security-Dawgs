# Implementation verification

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
