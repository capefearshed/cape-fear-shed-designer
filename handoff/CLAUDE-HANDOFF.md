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

- 56 automated tests pass, covering geometry, codes, style and door restrictions, spacing, colors, optional extras, payload validation and image framing.
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

## Quote popup and immediate thank-you screen

Review now has a Get quote button that opens the required contact form in a native modal dialog (keyboard focus and Escape supported). A valid Submit immediately closes the dialog and displays a new branded thank-you screen with the Cape Fear Shed logo, team follow-up message and call/text links. The model remains mounted invisibly while the existing five-picture pipeline and real TEST POST finish. The receipt distinguishes sending, received and error states; failures provide retry and preserve the design/contact fields. It no longer forces a JSON download on successful submission.

This is an immediate UI transition, not a durable background job after closing the browser. While pending, the screen asks customers to keep the page open. Received is shown only after the server confirms success. Same catalog/submit endpoints and payload contract remain in use.

Dan confirmed info@capefearshed.com; it is now the default email (VITE_CONTACT_EMAIL can override it). A single Call/Text 910-839-8589 control expands to separate call and SMS actions.

## Faster preparation and returning visitors

Opening Get quote now starts image preparation while the customer fills out their contact form. Submit reuses the in-flight/completed preparation for the exact same design instead of generating a second render. A changed design or a new customer-made render invalidates the old preparation; failures can retry. The five-image contract and acknowledgement check remain intact. This reduces the post-submit wait when preparation finishes during form entry; it does not make the current image-generation service instantaneous.

A normal customer visit automatically saves the design state in localStorage (no customer contact information or owner tokens). On the next visit to the SAME browser/origin, a Welcome back dialog offers Continue my design or Start new design. Size, style, colors, openings and extras are restored after contract/placement validation. Corrupt, blocked-storage and incompatible-catalog cases fall back safely. Test sample/owner-token/quote-linked URLs do not overwrite normal drafts. Preview URLs on different origins do not share drafts; the production /design/ origin will stay consistent.

## Claude backend change required for safe immediate exit

Current POST /api/form?designer=submit requires every photo to exist before sending. The browser cannot safely continue generating/uploading photos after a customer closes the tab. A thank-you overlay alone does not solve that risk.

Please implement a durable acceptance step on the app backend:
1. Accept and persist customer details plus the complete coded design immediately, with an idempotency/submission key. Create the draft quote and record images as pending.
2. Return a confirmed design/quote ID as soon as that durable write succeeds. The designer can then truthfully say the request is received and the customer may leave.
3. Enqueue a durable worker to generate/attach the five pictures from the saved design (including a retained customer-made render when present). This needs server-side model capture or an agreed image-service upload/job contract; do not rely on a browser page staying alive. Retry failures and flag incomplete images for Dan.
4. Make quotes/PDFs/plans show pending image status until ready. Preserve all designer options and rules; pricing remains app-owned.

Coordinate the revised accepted/pending response and image-job schema with this frontend BEFORE enabling that path. This release continues using the existing live TEST submit contract; it does not send incomplete designs to that endpoint or claim durable background processing exists.

## Required quote questions — Dan's latest choices

The form requires at least one shed-use choice and exactly one source choice. Referral reveals a required referredBy field. Other reveals a required explanation (usesOther or source.other). All contact fields and text consent are required. Additional info maps to customer.notes and is optional. The honeypot remains blank intentionally.

| Shed-use label | uses[] code |
|---|---|
| Yard tools | use-yard |
| General storage | use-general-storage |
| Home office | use-home-office |
| Garage | use-garage |
| Golf cart | use-golf-cart |
| Storage | use-storage |
| Mixed use | use-mixed |
| Other | use-other |

| Source label | source.code |
|---|---|
| Google | google |
| Vehicle wrap | vehicle-wrap |
| Yard sign | yard-sign |
| Social media | social-media |
| Referral | referral |
| Other | other |

Claude: ensure the app maps all these labels/codes and retains usesOther, source.other and source.referredBy. The new labels/codes live in src/quoteChoices.js; they are not catalog pricing options. Yard tools keeps the existing use-yard contract example code. The remaining newly specified tag mappings need confirming in the app; do not silently discard unknown answers. General storage and Storage are deliberately separate choices because both were requested.
