# Cape Fear Shed designer — integration handoff

This is a **test-mode integration**, not a live lead/quote endpoint deployment.

## Included

- `source/`: complete designer source, server-side image-preview function, approved models, assets and tests.
- `dist/`: production bundle built with `base: "/design/"`. Serve its contents at `/design/` on app.capefearshed.com.
- `samples/sample-1.json`, `sample-2.json`, `sample-3.json`: actual contract payloads with embedded JPEG views; companion JPEGs allow easy inspection.
- The three estimates are **$5,515**, **$10,738**, and **$25,039**. The required painted 12x16 example is exactly **$10,738**.

## Contract and behavior

All quote sizes, option labels, codes, prices and owner-only flags come from bundled `src/catalog.sample.json`. The bundled catalog's prices/codes have not been changed. Owner-approved placement metadata was added to residential/French doors (8ft minimum walls) and the 6x7 roll-up (minimum 10ft width, minimum 7ft walls, gable ends only). `designerNotes` records the nominal/model distinction.

**Dan explicitly overrode the catalog colors.** `src/colorPalette.js` retains the existing 33-color paint palette, five approved shingle colors and 21 metal roof colors, including Galvalume as the default metal finish. `getCatalog()` applies this overlay; do not replace it with the abbreviated sample catalog colors.

The retained Outerbanks factory-primer color has `unpainted: true`, and Snowscape trim has `standard: true`. These fields are carried in the color objects. **The app's price recomputation must honor these classifications** (Outerbanks primer does not incur siding paint; Snowscape is standard trim). Vinyl white/Snowscape doors are free to paint. Other automatic paint rules follow Part 4, including the exemption when a door matches a separately painted trim color. Keep names/codes as sent. Custom colors have name, null code, null hex and `custom: true`.

Payload opening sizes are the catalog's nominal dimensions (e.g. 72in wood-door height and 18x27 windows). The already-approved 3D models preserve measured visual dimensions (73.5in door leaves, 19.75x28.5 window assembly). Do not substitute catalog nominal dimensions into those approved visual models.

Automatic ramps are attached by `for`, are independently removable and disappear with their door. Anchors use max(4, round(length/5)*2), customer-visible in the estimate, owner-removable. One selected loft/workbench is free; when both are selected the loft wins. Linear-foot rates are calculated only for `alongGable` pieces using shed width. Slab and other linear-foot items remain `amount: null` and `estimate.pending: true`, with “priced on your quote” shown. No sales tax is added.

Unrecognized options are offered by their label/group/kind with a generic control, preserved under their exact code, and safely marked pending if their price math is not defined. Unsupported 3D profiles use an approximate visual; quotation data is retained.

## API switching

`src/api.js` owns all quote transport. `API_BASE` is `""` for same-origin `/api/form?designer=...`; no credentials are embedded. `getCatalog()` currently returns the bundle with the approved color overlay. Replace its return with `applyApprovedColors(await request('catalog'))` to use the live catalog (one line).

`API_MODE` is `"stub"`. Price returns the designer estimate. Submit logs the test JSON with ownerToken redacted, returns a stub response, and the UI explicitly says no quote was sent. The completed submission is downloaded. Bodies are limited to **3,900,000 UTF-8 bytes**; model captures are compressed 1200px JPEGs. The app must recompute authoritative pricing.

After implementing and testing live price/submit responses, change `API_MODE` to `"live"`. The current designer calls the price stub when preparing submission; live price response handling and field validation must be reconciled with Parts 2/3 before activation. `loadDesign()` exists but saved-design loading/revision recovery is not connected to the UI yet (Part 4 says later).

The existing `/api/backyard-preview` is a separate Node/Vercel function using the existing **server-only** OPENAI_API_KEY. It must be hosted by the app if that feature is retained. Its source assets must remain available server-side at `public/backyards` and `public/brand`; public display assets are included in dist under `/design/`. Do not put the key in browser code.

## Owner mode and pending information

`?mode=owner` exposes **owner test controls only while API_MODE is stub**. It is not authentication. Do not enable production owner tools from query parameters. Bind owner mode to a server-verified owner session/load token before release. Submitted context preserves quoteId/customerId/t from the URL; tokens are not printed by the stub logger.

The provided catalog marks lean-to and dormer styles unavailable and residential/French/roll-up doors owner-only. These flags are honored. Their approved models remain intact. There is **no sliding-door catalog code**, so it cannot be sent as a correctly priced quote option; its model remains in source. Please add/enable the intended codes and flags in the app catalog when ready.

Parts 2, 3 and the Oct 29 addendum were not supplied in this handoff turn. `uses`, `usesOther`, `source`, `tracking`, context and revision fields are retained; the customer form captures free-text uses/source/referrer information. The missing predefined use/source code lists and any additional validation, signature, edit/load or authentication requirements must be reconciled before public quote submission.

## Verification and captures

Automated checks cover the exact $10,738 estimate, auto paint/ramps/anchors, free-item priority, owner-only options, unknown codes, foundation rules, placed-opening fit and existing model regressions. Build with `npm run build` for the standalone preview, or `npm run build:handoff` for /design/.

Sample JPEGs are software captures of the **same assembled Shed React/Three component used by the designer**, with correct geometry/colors and a depth buffer. The available testing browser has WebGL disabled; these captures omit WebGL textures, shadows and reflections and are for API fixtures, not sales imagery. The owner test Review tab also provides “Export three pictured sample submissions” to replace them with full WebGL captures in a supported browser. Full mobile/touch/WebGL acceptance testing still needs a supported device.

No production branch was merged or promoted by this handoff.
