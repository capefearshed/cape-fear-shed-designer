# Cape Fear Shed — Part 4, 2026-10-31b

## Implemented

The bundled catalog now matches the live version 2026-10-31b. Morning options, colors, model appearance and Archivo font are preserved. The catalog maps codes rather than removing designer choices. The full morning size grid is present. Lean-to and dormer are selectable subject to their size rules. Dormers use 6/8/10-foot sizes for lengths 10–12/14–16/18–20 and are unavailable at 22/24 feet. Gable pitches are 5–8/12; lean-to sends roofAngle:10 with no roofPitch; dormer sends roofPitch:7 and shingles.

Door rules remain: 6×7 roll-up, width ≥10 feet, walls ≥7 feet, structural gable end only (left/right); residential, French and sliding glass require 8-foot walls. Openings retain 7½-inch corner clearance, 4-inch gaps, automatic spacing and left/right ordering. Window shutters affect physical fit. Payload dimensions remain nominal catalog sizes while visual assemblies keep morning measured sizes.

Ramps default OFF and are emitted only when selected for an eligible door. Anchors default OFF and emit one anchors-hurricane element when selected; the app determines the count. Floor/slab are explicit choices. The designer emits no paint items, prices, estimate or price requests. Selected loft/workbench promotion marks one free, with loft winning. Surf racks include wall and 12/18/24-inch dowel length. Every element has id/code/label/qty and applicable placement. Colors and custom-color metadata are preserved; colors.json contains the full retained palette.

## Connection and pictures

All transport is in src/api.js. getCatalog() currently returns the bundled catalog; its commented replacement enables the live catalog in one line. Submission is REAL to POST https://app.capefearshed.com/api/form?designer=submit, currently the app's TEST account. The app domain uses API_BASE=""; preview builds use the app domain explicitly. VITE_DESIGNER_STUB=true is the explicit offline override. No customer messages are sent by the live test endpoint.

Required contact fields validate before rendering/sending. Errors preserve the design for retry. Thank-you and error copy follow the packet. The send flow prepares all five pictures before posting, reuses the latest customer-made photo matching the current design, or requests a new auto photo. Pictures are ordered render/front/left/back/right, JPEG 1500×1000. Wall pictures use the approved interactive perspective view and plain #F3F4F1 background with no UI/logos (see Dan's later camera decision below). Compression lowers quality without changing dimensions; total body must stay below 3,900,000 bytes.

Claude: deploy /api/backyard-preview and its existing badge/backdrop assets alongside /design/. It requires the server-only image-generation key. The app domain currently returns 404 for that route; a static dist upload alone will leave automatic rendering blocked. Keep the key on the server. The catalog/submit routes are already live; load remains future work.

## Verified

- 52 automated tests pass, covering geometry, codes, style and door restrictions, spacing, colors, optional extras, payload validation and image framing.
- Phone-width browser flow selected dormer and lean-to, changed gable pitch, changed slab/floor, selected a 24-inch rack dowel, and completed the contact/send flow. The photo and submit services were mocked for this UI check. All five captured JPEGs were 1500×1000; payload approximately 435 KB. This does not verify the actual photo provider.
- A separate REAL test POST returned HTTP 200, ok:true, test:true, quoteNumber:"2021". Its notes identify it as an integration probe with software image fixtures, not a finished sample.
- npm run build:handoff builds with base /design/. Main remains unmerged.

## Quote camera approved by Dan after visual review

Dan rejected the flat orthographic exports and requested the appearance of the interactive designer wall view. Quote wall pictures now use the SAME wallCameraFit, 39-degree perspective camera, model orientation, original viewer lights and model shadows as the interactive wall view. Only UI, contact-shadow overlay and unrelated scene objects are excluded. Export color conversion and multisample smoothing remain corrected. Shed geometry, roof pitch and options are unchanged.

This explicitly supersedes Part 4's orthographic-image requirement for these quote pictures. They are perspective views and are no longer guaranteed to have the same pixel-to-inch scale across walls. Claude: use the design's exact dimensions for dimension labels; do not derive measurements from these images. If permit drawings need orthographic elevations, keep those as a separate technical output rather than changing Dan's quote pictures back.

All four images remain 1500×1000 JPEGs with a plain background. Existing quotes require a fresh capture/submission. The realistic main render service is separate and still has the verification gaps below.

## Still required before calling the entire packet finished

1. Verify real photo generation on the protected preview. Google sign-in failed with “Wrong password”; no automatic retry or protection bypass was used.
2. Produce and inspect the THREE required real sample JSON submissions with all five pictures, including customer-made and auto photos. The existing samples/ files are older software fixtures and do NOT satisfy this deliverable.
3. Confirm the exact predefined use/source tag taxonomy from Parts 2/3 and the Oct 29 addendum. Those originals were unavailable. Existing uses/usesOther/source/referral/tracking fields and free-text inputs are retained; do not assume the complete tag menu has been verified.
4. The new example-render.png attachment was unavailable. Existing coastal scene and round badge plus the packet's written description guide rendering; exact visual comparison remains pending.

No additional customer options should be removed or introduced to resolve these remaining integration tasks. Do not add pricing or make the app reject unusual designs; create the draft quote and flag it for Dan.

## Mobile section menu

On phones, section shortcut buttons slide directly beneath the main design tabs as the panel scrolls. The section heading scrolls away, and the shortcut row uses less vertical padding. Verified at 402×874: row top matches the options panel top after scrolling. This is a CSS layout change only.

## Metal color tiles and wall navigation

Metal roof colors now fill the rectangular tile preview area above each label. The openings wall selector stays pinned at the top of the options panel beneath the main tabs while scrolling, in Front → Right → Back → Left order. These are presentation changes only; model materials, palette values, wall identifiers and placement rules are unchanged.
