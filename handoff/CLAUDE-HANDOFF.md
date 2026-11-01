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

- 60 automated tests pass, covering geometry, codes, style and door restrictions, spacing, colors, optional extras, payload validation and image framing.
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

The form requires at least one of the seven shed-use choices and exactly one source choice. Referral reveals a required referredBy field. Other reveals a required explanation (usesOther or source.other). All contact fields and text consent are required. Additional info maps to customer.notes and is optional. The honeypot remains blank intentionally.

| Shed-use label | uses[] code |
|---|---|
| Yard tools | use-yard |
| General storage | use-general-storage |
| Home office | use-home-office |
| Garage | use-garage |
| Golf cart | use-golf-cart |
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

Claude: ensure the app maps all these labels/codes and retains usesOther, source.other and source.referredBy. The new labels/codes live in src/quoteChoices.js; they are not catalog pricing options. Yard tools keeps the existing use-yard contract example code. The remaining newly specified tag mappings need confirming in the app; do not silently discard unknown answers. Dan subsequently removed the duplicate Storage choice; keep only General storage.

## Hidden technical elevations — latest submission extension

Every export/submission now appends four technical images AFTER the unchanged five customer pictures: elev-front, elev-left, elev-back, elev-right. Each has hidden:true, pxPerFt, groundY, type:image/jpeg and its data URL. These are generated from the same model using orthographic cameras square to the corresponding unrotated wall axes. All four use the same pixel-to-foot scale. groundY is a fractional pixel row measured DOWN from the top, at the lowest modeled foundation/base elevation. pxPerFt is 800 divided by the camera's vertical span in feet. No dimension labels or lines are drawn into these images.

Technical images are 1200×800 JPEG, starting at quality 0.8, with a pure-white background and cast shadows disabled. Scenery, contact-shadow overlays, UI, logos and labels remain excluded. Customer camera, lighting, dimensions and initial JPEG quality are unchanged. Original rotation, visibility, renderer target/background and shadow settings are restored after capture.

Compression tries lower technical quality first, before reducing customer quality under the existing fallback. Capture keeps images below 3.6 MB to reserve room for the envelope; submitDesign checks the complete JSON body is below 3,900,000 UTF-8 bytes. Submissions now require nine correctly ordered images and positive finite pxPerFt plus an in-frame groundY on technical images.

Claude: accept all nine entries in images. Filter hidden:true entries OUT of every customer-facing carousel, quote picture gallery and portal. Use the elev-* entries ONLY in the HOA sheet/permit-plan workflow; never infer exact measurements from the five perspective customer pictures. Use the supplied pxPerFt/groundY to locate dimension lines. This frontend does not control the app's galleries, so that filtering must be applied in the app.

## Quote form cleanup

Shed uses are now compact, aligned two-column checkbox tiles with consistent gaps and selected-state styling. The duplicate Storage/use-storage choice is removed; General storage/use-general-storage remains. Existing other options, required validation and quote behavior are unchanged.

## Render gating, sending screen, and reference fidelity — latest changes

The customer always has the interactive 3D designer. Finished backyard photo generation/display/download is now gated behind completed required contact/use/source/consent fields AND successful submission. Review offers Get quote instead of a public generator. The existing manual photo workflow becomes available after a successful submission. Main design-file export is also gated so it cannot expose the finished image before the form. This supersedes the earlier image-preparation-on-popup behavior: opening Get quote alone no longer starts a paid generation request.

After valid Submit, the existing photo generator's spinning thinking-circle logo appears immediately with “Please wait while we send your design to our team.” Keep this page open while sending. Thank-you and the finished rendering appear only after backend acknowledgement. A failed request instead says “Your design hasn’t been sent yet” and offers retry with retained fields. This does not add a durable backend queue; safe browser closure still requires the acceptance/worker changes above.

Photo references now use a separate 1536×1024 landscape render target with display color conversion and antialiasing, independent of phone canvas resolution/aspect. Automatic reference cameras are refitted at 3:2. Captures start at JPEG 0.9 and reduce only to stay below the endpoint's input data limit. The approved shed model is unchanged. The photo endpoint prompt now explicitly forbids turning recessed door grooves into extra raised trim, stiles, mullions or battens and reinforces building/door/roof ratios.

Claude: deploy BOTH the latest frontend build and api/backyard-preview.js prompt update (the separate server ZIP is updated too). These are improvements to the reference and prompt, not a guarantee that generative output cannot deviate. The new UI/reference path is tested with a mocked provider; actual extra-trim/proportion correction still needs visual inspection of a real output on the app after deployment with its private key. Do not describe this image-fidelity issue as fully verified fixed yet.

## Repository handoff workflow — Dan's instruction

From now on, every change on v1-2-foundation-accuracy includes the output of npm run build:handoff in handoff/dist/ (base /design/) and updated handoff notes in the same commit. Deliver the pushed commit number, not ZIP files. Claude should obtain the built /design/ files from handoff/dist/ in that commit.

This commit adds the current built output to version control. No designer behavior or backyard photo server code changes in this commit. The preceding photo-server changes are already in api/backyard-preview.js at e2f4598; Claude must deploy that server code as well as its badge/backdrop assets and configure the server-only OPENAI_API_KEY. The actual generated-photo trim/proportion correction still needs a real rendering check.

## Backyard photo setup before contact — latest flow

Removed the duplicate Get quote gate from the photo section. Customers can browse backyard scenes and choose/adjust the shed camera before providing contact details. Generate photo closes photo setup and opens the required contact form; generation starts only after valid Submit. The selected scene and captured camera reference are retained for generation and the finished image remains hidden until successful submission. A single separate Get quote button bypasses photo setup and uses the existing automatic submission photo.

No backyard photo server change in this commit. Claude: deploy the committed handoff/dist/ to /design/. Existing server deployment requirements still apply. Paid provider fidelity is not verified by mocked UI checks.

## Easier opening movement, door paint and ramps

Removed the numerical position slider. Customers can drag openings on the model or use clearly named Move left / Center / Move right controls and the wall selector. Existing snap, clearance, automatic spacing and door eligibility rules remain unchanged. Secondary door paint is expanded by default with its own heading and explanation. Eligible doors have a highlighted Add a ramp checkbox with size below it; ramps remain optional and off by default. No server or catalog changes.

Validation for this update: 60 automated tests pass; build:handoff passes. Phone-width browser checks passed for backdrop selection → Generate photo → required contact → sending spinner → successful receipt, with one generation request, retained scene and all nine images. A separate phone check exercised Move left / Center / Move right and ramp off/on, confirmed expanded secondary paint, and inspected the screenshot. Photo and submission services were mocked; this does not verify paid AI output fidelity.

## Straight path reference correction

Dan reported another generated path with awkward alignment. Added two narrow contrasting straight boundary guides to the temporary capture-only ground strip, giving the image model explicit projected edges instead of a plain tan strip alone. The server prompt now prioritizes those edges and their shared ground-plane vanishing point, rejects sideways drift, flared thresholds and wedge-shaped approaches, and removes the guide marks from the finished picture. Removed the ambiguous hard-coded screen-left/right path direction. Decorative path omission remains the fallback if alignment cannot be retained. Shed geometry/options and the nine submission pictures contract are unchanged.

api/backyard-preview.js HAS CHANGED in this same commit. Claude must deploy that server file as well as handoff/dist/ to /design/; a static-only update misses the server instructions. No key/model change. Local geometry and mocked-provider checks verify guide direction and request wiring; an actual paid render still needs visual verification, so this is not a verified fix to generated path quality.

## Customer photo sharing only

Removed Download my design file and Download shed view from customer screens and removed the leftover customer JSON export after submission. Technical JSON export is restricted to the existing owner-mode gate. The finished branded backyard photo, visible only after successful submission, now has Save or share my photo. Touch devices supporting file sharing open the native share sheet with only that photo file; unsupported devices and computers download it. Cancelling the share sheet does nothing. The existing server-added Cape Fear Shed badge is preserved; no plain viewer or technical elevations are shared. No contact details or design JSON are included. Actual-yard help now asks customers to text their yard photo without technical downloads.

Claude: deploy the committed build and the path-related api/backyard-preview.js change together. No new endpoint, key, or payload changes for sharing. Native share requires HTTPS and browser file-share support; unsupported browsers use download.

Sharing verification: 62 tests pass, including touch-device file sharing, desktop/unsupported fallback and share cancellation. Phone browser check confirmed technical downloads and share controls absent before submission and a single finished image file passed to the native-share API after acknowledgement (share API mocked, not a physical iPhone share sheet). The branded provider response is shared unchanged. Owner export retains the existing test-owner mode; no new live owner-email authentication is introduced by this update.

## Opening movement usability and 4-foot door obstruction

The previous move handler rejected the complete move whenever the requested position collided with a neighbouring opening, even when that neighbour could shift safely. The new movement solver prioritizes the dragged opening and shifts neighbours as needed within the existing 7½-inch corner and 4-inch opening clearances. Dragging past another opening changes the order; all widths, shutters, ramp choices and other walls are preserved. This applies equally to 4-foot double doors and other eligible openings.

Added a touch-friendly wall layout strip with labeled Door/Window blocks. Customers can drag these blocks, tap to highlight the corresponding 3D opening, or use keyboard arrow keys. Existing direct model dragging and Move left / Center / Move right remain. Removed the separate duplicate unlabelled arrow row. No catalog eligibility, geometry or server changes. Claude: deploy handoff/dist/ to /design/ from this commit.

Validation: 64 tests pass, including a 4-foot double door moving beside and past a window, repeated swaps with shutters, unchanged other walls and ramp choices. Phone-width browser check exercised layout-strip dragging, keyboard movement, selected-block highlighting, Move left/Center/Move right, and ramp toggles; screenshot inspected. build:handoff passed with base /design/.
