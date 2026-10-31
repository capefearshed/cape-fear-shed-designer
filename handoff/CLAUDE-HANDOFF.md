# Cape Fear Shed designer — October 31 replacement contract

## Ready for test

This branch implements the replacement Part 4 requirements: no displayed prices, no estimate payload, no price API call, app-owned paint/anchors, unchanged approved colors, and “Send my design.” Submission remains a test stub, as requested: it logs the JSON with the owner token redacted, downloads a copy, and shows a clearly labeled test thank-you. No lead or quote is created.

All quote choices come from `src/catalog.sample.json`. The prior catalog prices were removed from the browser bundle. Door placement metadata retains the approved 8ft residential/French restriction and the 6x7 roll-up restriction (10ft minimum width, 7ft minimum sidewalls, gable ends only). Catalog availability/owner flags are respected; unavailable styles remain visible but disabled. Existing geometry has not been changed.

`src/colorPalette.js` preserves all existing paint, shingle and metal colors. Factory-primer and standard-trim classifications remain in color objects so the app can price paint. Custom colors retain their name with null code/hex and `custom:true`. Vinyl doors default to Snowscape and allow an override.

The payload keeps format/designId/revision/mode/context/catalogVersion/timestamps/customer/uses/usesOther/source/shed/colors/elements/images/tracking. Each element carries id, code, label, qty and applicable placement. Nominal catalog dimensions are used in the payload, while approved measured dimensions are retained in the visual models. Ramps are added per eligible door, independently removable, and removed with their door. One selected loft/workbench is marked free; loft wins if both are selected. Paint and hurricane-anchor elements are never emitted.

## Pictures

Five images, in this order: `render`, `front`, `left`, `back`, `right`. Each has `type:"image/jpeg"` and a data URL in `data`. All are 1500×1000. Browser JPEG quality starts at 0.85; if necessary only quality decreases to keep the submission below 3,900,000 UTF-8 bytes and each image below 1 MB.

The render reuses the last completed backyard picture matching the current design, or automatically frames a perspective. Four wall shots are orthographic, show the full shed ground-to-ridge, use one shared world-unit scale (maximum dimension at 80% frame), and use a plain #F3F4F1 background. They contain no contact/cast shadows, landscaping, guides, logos, text or UI. Capture temporarily isolates the exterior model and restores the user's view afterward, including when exporting from the interior tab.

Three JSON sample submissions and companion JPEGs are in `samples/`. `colors.json` contains the retained palette. Software fallback fixtures come from the same assembled Shed component, but omit WebGL textures and reflections. These should not be used as customer marketing images.

## App activation

`API_BASE` is empty for same-origin `/api/form?designer=...`. `getCatalog()` currently returns the bundled catalog plus approved colors. Live catalog can later be loaded with `applyApprovedColors(await request('catalog'))`.

`submitDesign()` validates five ordered pictures and the body limit. After the app implements and validates `POST /api/form?designer=submit`, switch `API_MODE` to live. The app must authenticate owner sessions, validate selections, add authoritative paint/anchor lines and compute prices. Do not trust `?mode=owner` as authentication. `loadDesign()` is reserved for later and not wired to the UI. Context preserves quoteId/customerId/owner token; test logs redact the token.

The existing backyard API remains separate and requires its server-only image-generation key. Nothing in this update sends a new request to that paid generation endpoint automatically.

## Delivery and verification

`npm test` checks geometry, opening eligibility, catalog contract, colors, ramps, promotions, API test mode, body size and shared-scale image framing. `npm run build` creates the standalone bundle. `npm run build:handoff` creates `handoff/dist` for `/design/` hosting. The preview branch is `v1-2-foundation-accuracy`; main remains unmerged.

The full original Parts 2/3 and Oct 29 form addendum could not be recovered in this session. Existing free-text use/source/referral inputs and payload fields are retained; exact predefined use/source tags and any additional requirements from those documents remain unverified. Do not represent the test stub as a working live app integration.
