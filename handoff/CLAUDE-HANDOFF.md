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

## Send first, photo after — supersedes the blocking photo pipeline

Submit now captures the existing four customer wall views plus four hidden elevations, then POSTs the coded design immediately with images[0] exactly {view:"render",source:"auto",pending:true}. No backyard-photo generation occurs before the quote POST. The eight remaining JPEGs retain their order, camera, scale metadata and compression policy. The full submission remains below 3.9 MB. Legacy completed-photo payloads remain supported for owner exports and /api/backyard-preview remains unchanged.

After successful submit acknowledgement, show “Got it! Dan will text you your quote” and confirm the request is saved. Then POST /api/form?designer=photo with the returned photo.id/token and the identical preview request shape: shedImage, mode, setting, placement, fenceHeightFt, design. The selected scene/camera are retained; automatic requests use the existing 1536×1024 reference. The photo section has its own spinning logo while the quote confirmation and contact links remain usable. A ready data URL is displayed immediately. A dropped/timed-out POST falls back to GET photo?id=…&token=… every five seconds; ready.url is displayed, failed quietly hides only the photo area. Returning to the design or closing the tab does not revoke the saved quote; the backend owns completing the submitted photo job. No photo failure triggers a second quote submission or quote-error message.

Save or share my photo supports both immediate data URLs and polled image URLs by preparing the image file before the tap, preserving native share activation. URL images must be fetchable from /design/ (same origin or CORS-enabled) with an image/png or image/jpeg Content-Type. No tokens are stored in localStorage. Polling and requests stop when this designer unmounts.

Claude: deploy handoff/dist/ to /design/. This commit does NOT change api/backyard-preview.js. App backend must return photo:{id,token} after saving the quote, durably own the photo POST job, and expose the documented photo GET status. These backend capabilities are supplied by your app; this frontend does not implement its worker. Existing historical notes about requiring generation before submission are superseded by this section.

Verification for send-first: 68 tests pass; build:handoff passes. Phone browser test with mocked app services confirmed quote POST before photo POST, exact pending first entry, all eight remaining JPEGs unchanged byte-for-byte for the sample, 1536×1024 reference, retained scene, acknowledgement visible during spinning photo area, aborted photo POST → two five-second GET polls → ready URL → one image file shared. Screenshots inspected, no browser errors. Unit checks cover immediate ready, failed status, transient polling errors, cancellation and endpoint/body wiring. Real app worker completion after browser exit was not exercised in this workspace.

## Dan's correction: evenly spaced ordering, not free positioning

The wall-layout strip is now directly under the wall selector, before the add-opening menus. Customers drag a labeled Door/Window block past another to swap left/right order; all openings on that wall redistribute evenly after each change. A lone opening stays centred. Selecting a block enables one pair of clear Move left / Move right buttons and keyboard arrow keys to swap adjacent items. Removed the confusing per-opening left/centre/right positioning controls. Direct 3D dragging uses the same ordering logic. This supersedes the previous neighbour-pushing/free-positioning behaviour.

All nominal sizes, door eligibility, ramps, shutters and other walls are retained. Tight-wall layout also now reserves the minimum 4-inch internal gap before sharing remaining space between the two ends, avoiding false rejection when a 4-foot door and shuttered window really fit. Standard roomy-wall spacing is unchanged.

## Straight path: apply the rule in the APP PHOTO WORKER too

Added a shared PHOTO_PATH_RULE in src/backyardSettings.js: constant-width straight continuation of the door/ramp, perpendicular to its wall; side/corner exits and passing behind the badge are explicitly allowed. src/api.js includes it in the existing request.placement field (under the existing 300-character limit), both for the durable app photo job and legacy /api/backyard-preview. Request shape and endpoints are unchanged.

api/backyard-preview.js HAS CHANGED in this same commit: imports the shared rule, explicitly permits passing behind the later-composited badge and removes the remaining “leading from the foreground” wording that could encourage a bottom-centred route. Claude MUST apply this shared rule and existing geometric-guide preservation to the app-owned /api/form?designer=photo worker prompt as well. That worker now generates customer photos, so updating only this repo's legacy route will not update its independent prompt. Use request.placement as the declared path preference. Never reroute for logo clearance; keep both projected sides straight and preserve their direction through the entire path.

No real paid output has been checked for this prompt update; AI adherence cannot be guaranteed by prompt tests. Do not mark the crooked path resolved until the app worker is updated and a generated photo is visually inspected. The current customer screenshot remains evidence of the outstanding failure.

Existing saved drafts and test samples also normalize to evenly spaced openings on load, retaining their physical left/right order, so older free-positioned drafts do not retain uneven gaps.

## Personal customer greeting, generic team language

The acknowledged receipt now says “Thank you, {firstName}, for requesting a quote!” followed by “Someone from our team will reach out shortly to discuss your design and next steps.” The photo spinner below reads “Hang tight while our build crew finishes constructing your custom shed…” with supporting text explaining that the backyard photo is being created and the saved request is safe if they close the page. Removed the customer-facing “Dan will text you” wording. Names are rendered as React text, not HTML. No submission or photo-job behaviour changed.

Validation for this update: 70 tests pass and build:handoff passes. Phone browser test on an 8×12 with a 4-foot double door and window passed drag, left/right button and keyboard reordering; the three equal extra gaps measured 33.67/33.69/33.70 pixels. Inspected the resulting wall-bar screenshot. Separate mocked submission/photo browser test verified the personalised first-name greeting, team copy, build-crew spinner, durable photo polling and image sharing; inspected the pending-photo screenshot and observed no browser errors. No paid AI image was generated to verify the path.

## Slim tap-and-arrow wall bar

Replaced the tall drag editor with one slim row: large left arrow, a wall strip with simple door/window silhouettes, and large right arrow. No visible Door/Window labels, numbering, heading, or drag affordance. A short hint explains tap then arrow. Labels remain available to screen readers. Tapping selects an opening; arrows swap it with the adjacent item and keep the wall evenly spaced. At the ends the unavailable arrow is disabled. New openings are automatically selected and scrolled into view. The bar and Front/Right/Back/Left selector now remain together at the top of the options panel, so the added item stays visible while browsing add options. Minimum tap areas are 44px for openings and 48px for arrows; many openings scroll horizontally within the strip.

Removed drag movement from both the bar and interactive model; model tapping still selects/highlights. Door eligibility, spacing, colors, ramps, server requests and photo flow remain unchanged. Claude: deploy handoff/dist/ to /design/. No api/backyard-preview.js change in this commit.

Validation: 70 tests pass; build:handoff passes. Phone browser check confirmed automatic selection after adding a window, tap-to-select, left/right swaps, correctly disabled end arrows, no visible Door/Window text and no drag reordering. Combined wall selector/bar remained pinned while options scrolled. Slim bar including its hint measured 81px high; screenshot inspected. Selected openings scroll into view after arrow reordering as well as after adding.

## Phone viewer, choice cameras and opening picture tiles

All six phone tabs now reopen at the existing full viewer height. Scrolling the options smoothly shrinks the pinned live viewer to a minimum 35dvh; returning to the top grows it again. The existing single options scroll pane and fixed shell keep the viewer above the tabs/options. Desktop sizing is retained. Reduced-motion users get immediate height changes.

Openings now has large left/right reorder arrows directly beneath the viewer, a selection dropdown for accessibility, and Front/Right/Back/Left buttons. Choosing a wall animates to its straight-on view and selects its first opening. Tapping the model selects/highlights the opening; arrows retain the existing evenly spaced ordering and all clearances. Removed the separate wall strip bar. Highlight outlines are removed from the scene during EVERY picture/reference capture and restored afterward, so they cannot appear in submitted pictures or alter capture bounds.

Roof material/color interactions ease to an elevated roof view; siding interactions use a three-quarter view; door color faces that door's wall and highlights it. Temporary choice focus eases back to the overview after six seconds. Openings stays face-on for editing rather than idling away from the selected wall. Manual orbit remains available in the other tabs after focus settles.

Door/window add choices are now two-per-row picture tiles, with catalog label and nominal width/height below. SVG drawings distinguish single/double leaves, transom glass, roll-up ribs, residential nine-pane glass, French/sliding glazing and gridded window. Selected catalog choice has a yellow border. Eligibility and disabled choices remain catalog-controlled. No catalog codes, submission format, server endpoints, photo flow or api/backyard-preview.js changes. Claude: deploy the committed handoff/dist/ to /design/.

Verification: 71 tests pass, including editor-overlay removal/restoration without altering capture bounds. Phone browser check at 402×874 passed tile count (all 12 catalog door/window choices), two-column layout, add/select/reorder arrows, wall changes, viewer collapse and full-size reset across all six tabs. Openings halfway down measured 445.7px full viewer → 305.9px compact (35% of viewport), pinned at y=73; toolbar directly below at y=378.9. Inspected both the straight-on highlighted opening and elevated roof-focus screenshots. Committed screenshot: handoff/qa/openings-phone-halfway.png. No browser errors. Screenshot verification is local Chromium; no paid photo generation was involved.

## Opening refinements after Dan's phone review

Selected openings use a 4px red screen-space outline instead of a thin yellow WebGL line. It stays legible as the viewer collapses and is still removed from picture captures. Reorder arrows explicitly use bold black strokes/text color, including iOS styling. Removed the redundant per-opening Wall dropdown; the wall selector below the viewer is the navigation control.

Secondary door paint now has the same gold border/pale background/padding as Add a ramp and starts collapsed. Its clear chevron reveals the color picker on tap. Existing paint behaviour and defaults are unchanged.

Corrected the illustrated opening tiles against the actual model code: wooden doors have siding-faced leaves, white stiles/three rails and three black strap hinges per leaf. Transom glass sits INSIDE each leaf below the top rail (not a new window above the door), with the model's 5 / 3-per-leaf / 4-per-leaf lights for single / 4-foot double / 5-foot double. Standard window is 2×4 panes; residential is nine upper panes plus two lower panels, lever/deadbolt. French/sliding frames and roll-up ribs/threshold are distinguished. No actual shed geometry changes.

Viewer resize now coalesces scroll updates with requestAnimationFrame, disables scroll anchoring feedback, uses gentler easing and debounces costly WebGL resize/refit work by 100ms. Minimum viewer height remains 35dvh across all phone tabs. Submission/catalog/server/photo contracts are unchanged; api/backyard-preview.js is unchanged. Claude: deploy handoff/dist/ to /design/.

The wall camera also retains/interpolates its current distance when viewer size changes instead of immediately jumping to every new fit radius. Final wall framing is unchanged; camera motion and the viewer collapse now ease together.

Validation: 71 tests pass; build:handoff passes. Phone browser check verified computed black 3.5px arrow strokes, no redundant Wall field in opening cards, matching ramp/paint border and background, collapsed paint picker expanding/collapsing correctly, and no browser errors. Inspected screenshots showing the 4px red window outline, black arrows, matching boxes and corrected transom/door tiles. Updated handoff/qa/openings-phone-halfway.png and added handoff/qa/opening-tiles-phone.png. Motion changes still need Dan's physical-iPhone feel check; no claim of measured iOS frame rate.

Final resize regression passed across all six phone tabs with the 305.9px (35dvh) minimum at 402×874, full-size reset on tab change, working reorder arrows and roof focus. No browser errors.

## Openings chooser and window accessories — Oct 31, 2026
- Add Door / Add Window buttons reveal the relevant choices; successful placement closes the chooser.
- Clear this wall near the top asks for confirmation and removes only that wall's openings and attached accessories.
- Secondary door paint uses a checkbox; checking reveals an expandable color selector, unchecking restores the default color.
- Shutters and Flower Box use the same yellow checkbox card as Ramp.
- Flower boxes render below their window and persist as `flowerBox` on the window element in design submissions. The catalog has no flower-box price code: the receiving app must recognize this window attribute or add a catalog code before automatic pricing is available.


## Immediate openings and door offsets — Oct 31, 2026
Supersedes the preceding chooser/clear-wall behavior.
- Add Window immediately adds and selects the standard window and scrolls to its options.
- Add Door immediately adds/selects the 4ft double door and scrolls to style thumbnails. Clicking a thumbnail changes that door rather than adding another.
- Selecting a model opening or the Selected opening menu scrolls directly to its own options, including reselecting the current opening.
- Clear this wall removes its openings immediately, without confirmation.
- Secondary paint reveals swatches directly; redundant Choose door color heading/help removed. Custom color text entry removed throughout.
- Shutter label is simply Add shutters.
- Door arrows nudge the selected door by six inches, stopping at corner/neighbor framing clearances. Screen direction accounts for the viewed wall. Offsets survive valid relayouts and saved drafts.
- Door thumbnails match the model: single-door hinges on the right and handle on the left; double-door hinges on outer edges and one handle on the right leaf at the meeting stile. French/residential/sliding hardware follows their model positions.
- Wall camera excludes ramp and selection geometry from its fit and targets the building centerline, preserving centered gable views with ramps.
- Verified: 73 tests pass, including new door-offset collision/persistence checks and ramp-independent wall framing; production handoff build passes. Browser controls and automatic option scrolling checked. Browser WebGL is unavailable, so 3D visual verification remains limited.


## Door positioning correction — Oct 31, 2026
Supersedes six-inch nudges: only a door alone on its wall can be offset. Arrows step through exactly Left / Center / Right, respecting framing clearances. On shared walls, arrows reorder evenly spaced openings (including doors). Adding another opening removes lone-door offset placement through normal redistribution. Tests cover all four single/double widths, all three positions, endpoints, persistence and disabling offset on shared walls.


## Backyard photo door/path correction — Oct 31, 2026
- Deploy the updated api/backyard-preview.js AND new src/server/backdropReference.js. Client-only /design/ replacement cannot apply this server change.
- Generation now receives only the upper 58% of the chosen backdrop, retaining setting/trees/fence while excluding the competing foreground walkway. User-facing backdrop thumbnails remain unchanged.
- Locked wooden-door construction: two full-height stiles, three horizontal rails, one additional rail below transom glass when present. Flat grooved infill; no inset panel moldings, nested frames, beads or extra white strips. Secondary paint covers both infill and leaf framing.
- Entry path is governed by the straight 3D guide alone; cropped backdrop must not supply a route. Short straight strip with straight edges and transverse end.
- This is one generation call per photo, as before. Mocked provider tests verify the actual submitted cropped reference and construction rules; no fresh live AI output was available for visual verification here.


## Mobile scroll sensitivity correction — Oct 31, 2026
- First 96px of option scrolling leave viewer height unchanged. Collapse then eases over 520px rather than reacting at 0.8px per scrolled pixel from the very top.
- A single animation-frame loop smooths height changes; removed the competing CSS height transition. Viewer sizes use stable svh units to avoid browser-toolbar resizing.
- A matching bottom spacer preserves the options scroll range while the viewer shrinks, preventing end-of-scroll clamping from feeding back into viewer expansion.
- Tab changes reset target and animated height together. Automatic scrolling remains limited to explicit opening selection/add actions.


## Explicit shared-wall arrow swap — Oct 31, 2026
- Arrow handling now uses a single stepOpening action: a lone door steps Left/Center/Right; an opening sharing a wall swaps its ordered slot with exactly the adjacent opening. No coordinate nudges are used for swaps.
- Left/right screen direction is corrected on Back and Right elevations for both modes. Swapping clears stale lone-door alignment metadata while preserving ramps, colors, shutters and other walls.
- Regression test covers door/window swaps in both directions on all four walls and verifies shared-wall offsets are rejected.


## Stable mobile Openings workspace — Oct 31, 2026
- Capitalize catalog group headings, including Interior.
- On phones, Openings uses a constant 35svh viewer for Front/Right/Back/Left. This supersedes scroll-dependent resizing in that tab, preventing layout changes underneath scrolling gestures and equalizing options space on short/empty walls. Other tabs retain the collapsing viewer.
- Wall changes reset the options pane to the top; Add Door/Add Window remain pinned inside the options pane. Selected-opening jumps account for their height, keeping the selected options below those buttons.


## Camera gesture and viewer behavior repair — Oct 31, 2026
- Openings no longer disables OrbitControls. Drag/pinch/wheel can rotate and zoom; the first manual gesture pauses automatic wall/exterior camera movement so it cannot fight the user.
- Selecting another wall/opening, changing tab, requesting a finish focus, or changing shed dimensions restores automatic framing. Opening taps still select and jump to their options.
- Restores scroll-responsive viewer resizing in Openings, starting at 43svh and easing to the existing 35svh minimum. Add Door/Add Window stay pinned; all wall views use the same sizing rules. Supersedes the preceding fixed-35svh rule.
- WebGL is unavailable in the automated browser here; live gesture verification remains outstanding.


## Openings controls clarification — Nov 1, 2026
- In Openings, manual rotation, pinch/wheel zoom and camera dragging are disabled. Wall buttons still animate the face-on wall camera; opening taps still select and jump to options. Other tabs retain manual camera controls.
- Mobile Openings uses a fixed 35svh viewer, with no scroll-driven resize or collapse spacer, leaving a larger stable options pane. Options remain scrollable, and Add Door/Add Window stay pinned. This supersedes the prior gesture/43svh behavior specifically for Openings.


## Compact directional Add controls — Nov 1, 2026
- Add Door/Add Window now use compact 44px buttons. They hide on downward options scrolling and reappear on upward scrolling, with a small movement threshold to prevent flicker. They always show at the top and reset on tab/wall changes. Hidden controls are inert and excluded from accessibility navigation.
- Hiding uses transform/opacity, preserving scroll geometry. Reduced-motion settings remove animation.
- Fixed mobile Openings preview is now 31svh rather than 35svh, giving the options more space. Manual camera controls remain disabled in Openings; wall-button rotation remains enabled.

## Shed build loading animation — Nov 1, 2026
- Replaced the swirling logo in the shared GeneratingLogo component with the uploaded 30-second shed-building MP4. Applies to sending the design, submitted photo generation, and BackyardPreview loading.
- New assets: public/animations/shed-build.mp4 and shed-build-poster.jpg; included in rebuilt handoff/dist/animations. Keep both files when replacing /design/.
- Muted inline looping playback, pause while the document is hidden, static poster for reduced-motion preferences or playback failures. Existing wait messages and real request completion determine when the screen closes; never wait for the animation loop to finish.
- H.264/yuv420p, 960x760, 30 seconds; MP4 approximately 677KB. No new API calls or generation charges.
- Browser QA: actual video playback confirmed (readyState 4, paused false, 30-second duration, muted and looping) and wait-screen layout visually inspected.


## Opening option control polish — Nov 1, 2026
- Add Door/Add Window labels centered horizontally and vertically. Their row now scrolls in normal flow, superseding directional sticky/hiding behavior; proximity scroll snap points at the Add row and option sections provide gentle stopping points.
- Flower Box uses the same text structure/font as Shutters. Secondary paint retains one outer card, with the inner checkbox label border/padding removed.
- Door footer has Change door and Remove door side by side. Change door opens the style thumbnails for that existing door; the redundant door Style select is removed.
- Remove door/window share the same typography and red X icon.

## Lean-to low-wall entrance and opening fidelity — Nov 1, 2026
Both photo transports now include design.renderingConstraints with shared instructions and a complete copy of every opening. For lean-to models, fixed model IDs are highWall=front (+Z), lowWall=back (-Z), roof angle 10 degrees; the customer-facing entrance can be on either wall. Never infer the high wall from the door location. Preserve the reference slope, proportions, same-wall windows, door rail/stile construction, white leaf framing where selected, strap hinges, hinge side and handle position. No invented steps/ramps/landings.

CLAUDE: the active /api/form?designer=photo worker is APP-OWNED and is not in this repository. Deploy handoff/dist/, then update that worker to prepend src/photoDesignRules.js PHOTO_DESIGN_RULES to its image-edit prompt and consume request.design.renderingConstraints. Retain the supplied shedImage as the high-fidelity authoritative image; use the yard image only for scenery. Do not reconstruct a generic shed from roof/style labels or replace/reorder openings. Existing PHOTO_PATH_RULE and reference camera locking still apply. Import these rules server-side as trusted constants rather than allowing arbitrary client text to override server instructions. The legacy api/backyard-preview.js now prepends the same rules; deploy it with src/photoDesignRules.js if that route is used.

Required live regression: generate a low-back-wall entrance lean-to with a wooden single door and adjacent same-wall window. Compare the output to shedImage: low door wall, correct upward slope toward rear, window retained, white door framing and black strap hinges/handle side unchanged, no invented step. Also check high-wall entrance, gable, and residential-door designs. Request tests verify transport; they cannot certify AI image fidelity. No live paid image or app worker deployment was performed here. Prompt instructions cannot guarantee correct output on every first generation; the app needs output validation/retry or deterministic shed compositing for that guarantee.

## After-Send page — November 1

`SendReceipt.jsx` replaces the separate sending/thank-you/photo overlays with a persistent page. The 72px logo, status, steps, and contacts keep their positions through sending and received. A reserved 164px progress/action slot prevents layout jumps; only the 3:2 picture expands from 250px to full width on image load. The same video element continues across sending/received. Reduced motion uses the poster and disables transitions. Failure or 180 seconds pauses the video and shows the quiet quote-photo message, with no photo retry. A late successful result can still display. Mobile share uses the existing file share-sheet implementation; desktop downloads.

Photo input is prepared before submit; immediately on successful submit `beginPhoto` dispatches POST `?designer=photo` before success UI updates. Server-side durable generation remains the app endpoint's responsibility; closing the browser must not cancel an accepted job. This change does not alter that server, and no live customer submission was sent in QA.

Verified: 77 existing tests passed; production handoff build passed. Browser checked at 390px panel width: sending/working positions, continuous MP4, photo growth/load, save/share button, quiet failure, and visible Call/Text/email footer. Photo readiness was simulated with the local poster asset, not a real generation call.

## Animation outline and automatic photo angle — November 1
Removed the faint border from the receipt animation box. Automatic quote photo capture no longer forces front-left: it uses the same door/window-aware camera as automatic backyard previews. Removed the obsolete fixed-angle preset so both submission paths keep the entrance prominent and favor the adjacent wall with windows. Regression verifies front and back entrances with three right-wall windows select the right side. Existing generated photos need a new generation; this does not change stored images.

## Desktop inline sections — November 1
Desktop menu sections now expand their existing options directly under the selected heading, retaining the mobile menu icons and labels. Uses one shared options region, so customer selections and validation remain unchanged. Desktop options pane widened to 480px where space permits; viewer fills the same height as the menu panel, including Openings wall controls. Mobile navigation and viewer sizing remain unchanged.
Validation: production handoff build and all 78 tests pass. Browser verified Size/Style region placement and equal 810px viewer/panel height at 1363x936. WebGL was unavailable in the QA browser, so shed visual rendering could not be verified there.

## November 1 — Feedback improvements

Unavailable roof, style and opening tiles now show readable blue explanations from the current compatibility and placement rules. Add Door/Add Window open choices immediately without inserting a default opening; picking an available style adds it. Change Door continues to edit the selected door. Existing restrictions remain unchanged.

Validation: handoff production build and all 78 existing tests passed; two new availability tests passed separately. Browser preview could not launch because its runner could not resolve Vite, so visual QA remains unverified.

## Consolidated handoff — November 1

Includes desktop inline sections and matching viewer/panel height, current camera regression coverage, blue unavailable-option explanations, and direct opening-style selection. Rebuilt handoff/dist using npm run build:handoff with base /design/. Full suite: 80 tests passed. Feedback-screen browser verification remains incomplete as noted above.

## Combined handoff validation — November 1
Desktop accordion, automatic window-side photo framing, animation border removal, blue unavailable-option explanations, and direct opening choices are included together. Rebuilt handoff/dist with base /design/; all 80 tests pass.

## Compact desktop controls — November 1
Reduced desktop option tile padding/heights, form controls, section spacing, action buttons, siding samples, roofing thumbnails, and opening thumbnails. Openings and roof thumbnails use three columns. Main accordion headings and paint swatches retain their existing dimensions; mobile rules unchanged. Production /design/ handoff rebuilt. Preview runner could not resolve Vite, so browser visual verification remains unavailable.

## Horizontal desktop menu and anchors — November 1
Desktop section navigation now runs left to right above the existing compact shared options pane, with icons retained. Desktop options panel is 570px on wide screens; navigation can scroll horizontally on narrower desktop widths. Hurricane anchors reuse the yellow ramp-option card styling on both desktop and mobile. Paint swatches unchanged.

## Tighter desktop menu — November 1
Reduced wide-desktop options panel from 570px to 440px and column gap to 16px to return width to the shed viewer. Six horizontal headings share the available width with tighter padding and 58px height; existing heading text size, compact controls, paint swatches and mobile layout retained. Handoff rebuilt with /design/.

## Immediate windows and shared frame finish — November 1
Add Window now places the available standard window immediately; placement rules still apply. White is the fallback for old/new drafts. White/Black controls appear on each window/transom-door editor and for dormer style, updating one shared colors.window setting for all existing and future frames. Model, interior window muntins, door transoms, dormer glazing frames, quote elements, and photo constraints receive the same normalized color. Exterior wood casing and door paint remain their existing selected paint. No per-window frame overrides or invented catalog price codes. App must consume colors.window and element.windowFrameColor for quote details; frame finish pricing is not implemented. The selector between move arrows now matches their yellow background, border and corner radius.
Validation: 80 existing tests plus two global frame-color/model/quote regressions passed; /design/ production build passed. Preview runner cannot access installed Vite, so browser visual QA remains unavailable.

## Glass contrast and control polish — November 1
Lightened the shared window pane material to #A5ACA9 for visible black grids on wall windows, door transoms and dormer panes. Dormer window-grid controls now follow the style choices. White/Black controls are compact 34px buttons on both layouts. Opening arrows and selector have explicit matching 54px heights; selector uses centered 16px text. Product labels consistently use title case and prime/double-prime dimension marks; the numbered selector reads e.g. 1. 18x27 Aluminum Window. Action labels use sentence case; explanatory sentences retain terminal punctuation. Catalog codes unchanged. Rebuilt /design/ handoff; 82 tests passed. Browser visual QA remains unavailable.

## Label hierarchy and selector shell — November 1
Dormer frame controls are now nested directly beneath the selected dormer tile. All heading/control words use initial capitals, including With/And/This; catalog codes unchanged. Section headings 21px/18px exceed the 14px Window Frame Color sublabel and 13px color options. White/Black button text centered explicitly. Replaced the visible native selector surface with a 54px shell and centered label plus a transparent full-size native select, retaining accessible keyboard/native selection while avoiding Safari select sizing. Clear This Wall is full-width centered with a red X. Rebuilt /design/ handoff.

## Brown glazing and simpler interior — November 1
Shared exterior pane color is #514B43, a modest lightening of original #3D3934 dark brown, replacing the overly pale gray. Ramp checkbox now says only Add A Ramp. Interior framing retains actual rough window openings and sill/header framing but removes window glass and grid meshes. Exterior windows and quote data unchanged. Rebuilt /design/ handoff.

## Floor descriptions, framing and Review action — November 1
Foundation tiles use the requested treated-joist/Advantech and level/square concrete descriptions verbatim. Interior diagram door header underside is 72in above finished floor; rails end at the inner faces of adjacent opening studs, with cripple studs stopping below sills/above headers. Exterior openings and quote dimensions unchanged. Review Get Quote moved out of the scrolling content into a fixed flex footer in the options panel on desktop and mobile; only one quote action remains. Rebuilt /design/ handoff.

## Lap shading direction — November 1
LP lap courses now grade from darker at the top (0.74 paint multiplier) to lighter at the bottom (1.0). Applied consistently to main walls/gables, dormer cheeks/front and lean-to end courses; clipped course shading uses original course boundaries. Lap thumbnail matches. Vinyl and other siding profiles unchanged. Rebuilt /design/ handoff.

## Shorter lap shadow — November 1
Lap shadow now fades over only the top 22% of a course (about 1.3in of the 6in reveal), with a slightly darker 0.70 top tone. A per-fragment material gradient keeps the shadow short even on large/clipped face triangles. Applied to main walls, dormers and lean-to ends; thumbnail updated. Rebuilt /design/ handoff.

## Lap paint brightness and wall balance — November 1
Removed the gray #dedede albedo tint from LP lap grain texture, using a neutral white base. Shared lap shader now blends lighting toward the selected paint albedo to reduce exaggerated front/right versus back/left differences, retaining a restrained directional cue. Approved top-22% shadow and 0.70 top tone unchanged. Applies to all lap surfaces without changing scene lights, roofs or other siding. Rebuilt /design/ handoff.

## Lap eave clearance and trim brightness — November 1
Long-wall lap siding now ends below the sloped roof underside using its maximum 0.085ft projection, roof slope and 0.04ft clearance. Prevents the partial top course on 8ft walls from protruding through shingles; roof and approved lap shadow unchanged. Wood trim front/back face paint tones match, while narrow edge tones remain; lighting balance applied to wood trim and rake-cut corner boards to reduce back/left dimming. Handoff rebuilt /design/. Browser visual QA remains unavailable.

## Photo preservation v2 — live app integration required
Added src/photoSpecification.js to derive exact siding, colors, overhangs, opening locations, ramp, dormer count/width and vertical-only transom grids from the rendered model. Both photo transports include versioned specification data. Added trusted server builder src/server/photoPrompt.js, used by the legacy api/backyard-preview.js in place of the previous long competing prompt. Model/settings remain unchanged. Unit tests cover precise 2/3-window dormer variants, door transom grid counts, slab/no-ramp behavior, source-image order, high-fidelity transport, and rejection of caller prompt overrides.
The LIVE /api/form?designer=photo worker is still outside this repository. Vercel deployment/source access was denied, so live inputs/model/prompt and output accuracy could not be verified or changed. handoff/PHOTO-GENERATOR-INTEGRATION.md contains the exact integration/test instructions. Deploying handoff/dist alone does not update that worker. No live customer quote, paid production generation, automatic retry, or verifier was created.

## Blank live reference discovered — November 1 photo-run report
The user supplied the cfs-reference-spec-v2 live run report. Downloading its exact render-ref.jpg produced a 1536x1024 uniformly RGB(243,243,241) JPEG, per-channel stddev 0. The backdrop is valid, and prompt facts specify the correct 2-window dormer; prompt integration is now confirmed by the supplied report. This is a missing-building-reference failure, not evidence that another prompt/model change is needed.
Reference capture now explicitly reveals the exterior and ancestor groups, hides unrelated scene groups, updates the camera matrix, restores visibility, and rejects transparent/uniform/nearly blank pixels before JPEG encoding. The legacy server validates decoded reference image statistics with sharp and returns 400 before provider fetch for blank/unreadable images. A fresh actual-browser screenshot is still required: the visibility change addresses a possible cause; it is not proof that renderer readback is repaired on every device.
APP BACKEND: add src/server/referenceValidation.js and call await assertShedReferenceImage(decodedShedImageBlob) BEFORE enqueueing or spending on image generation. Return a recoverable capture error rather than generating from text. Deploy the rebuilt designer to use src/referenceValidation.js and the updated capture path. Keep the v2 prompt/model unchanged for the first retest. Verify the saved reference visibly contains the same shed, camera, ramp and 2-window dormer before making one generation call. Do not reuse the blank reference.

## Visible-canvas capture replaces offscreen readback
After blank validation began blocking photo sending, replaced half-float multisample render-target/OutputPass readback for ALL photos with captureSceneCanvas: render synchronously to the visible renderer at fixed export size, copy its canvas immediately onto an opaque 2D canvas, validate pixels, then restore pixel ratio/size/target/background/viewport/scissor. Reference remains 1536x1024; four wall photos remain 1500x1000; technical elevations remain 1200x800 with their existing scale metadata and white background. No bypass of blank validation or text-only fallback. No quote/API contract changes.
92 tests and /design/ build pass, including state restoration on blank/error and image quality/technical scale checks. Static browser QA launched successfully, but WebGL is disabled in that browser (explicit context creation error), so real rendered image capture is NOT verified. Live affected-browser verification is still needed before claiming photos restored. Deploy handoff/dist; inspect one fresh saved reference for actual shed pixels before generating. Keep model and prompt unchanged.


## Dormer detail reference — 2026-11-02 (supersedes v2 prompt instructions)

Repeated live user tests after the canvas hotfix now preserve the shed and straight approach much better, but dormer windows repeatedly acquire horizontal muntins. This patch adds normalized dormer bounds from the exact full-reference camera to request.referenceDetails.dormer, including preview-selected captures and send-first jobs. It adds no image bytes to the client upload. The model is only tagged with metadata; geometry/materials/camera/path are unchanged.

Claude must deploy BOTH rebuilt handoff/dist at /design/ AND adapt the actual app-owned /api/form?designer=photo worker. A static upload alone will not activate the detail reference:

1. Preserve request.referenceDetails through job persistence/retries. Values are normalized x/y/width/height in image 1.
2. Copy src/server/dormerReference.js (requires sharp) and updated src/server/photoPrompt.js with its existing photoSpecification/photoDesignRules dependencies. Keep the existing blank-reference guard.
3. Decode image 1 as before. Call `const detail = await dormerReference(shedReferenceBlob, request.design, request.referenceDetails)`; never crop a previous generated output. If detail exists, append its JPEG as image 3 AFTER the unchanged image 1 shed and image 2 environment-only backdrop. The legacy api/backyard-preview.js demonstrates this exactly.
4. Call buildPhotoPrompt with server-owned scene/pathway, fenceHeightFt:6, and hasDormerDetail:Boolean(detail). Replace v2 prompt, not append. Record PHOTO_PROMPT_VERSION = cfs-reference-detail-v3 and actual input image count in protected diagnostics; retain the input crop for inspection. Preserve current model/high fidelity/quality, watermarking, auth, job persistence and error handling.
5. Old clients without bounds and designs without dormers continue with two images; no invented crop. Invalid supplied bounds are rejected before provider spend. Off-camera/partially cropped dormers omit the detail.
6. Verify one fresh unchanged design has nonblank image 1, correct dormer crop image 3, and final v3 prompt. Run three fresh generations of the same design/backyard (no reuse of cached output). Check zero horizontal bars on dormer and door transoms; wall windows retain their horizontal grids; path stays straight. Only then vary design size/style.

Validation: 95 automated tests pass, including projected rotated bounds, real sharp crop pixels/size, old-client compatibility, invalid bounds rejection, request propagation, conditional prompt text, and provider multipart input order/count. build:handoff passes with base /design/. React changes reviewed for hooks and state flow. The available browser has WebGL disabled (as established during capture hotfix), so actual browser capture and provider fidelity require the deployed test; no production image job/customer submission was performed for this patch.


## Door-transom detail reference — 2026-11-02 (v4, supersedes v3 integration)

The user supplied three fresh v3 outputs: dormer grids were vertical-only and paths aligned, but all three changed black door-transom dividers to white. This patch tags the existing door transom groups (no geometry/material edits) and sends optional normalized request.referenceDetails.doorTransoms bounds for front-facing visible door transoms in the same reference camera. The existing request plumbing carries both dormer and transom bounds. No extra client image bytes.

Claude: deploy rebuilt handoff/dist to /design/ AND update the actual /api/form?designer=photo worker:

1. Copy updated src/server/dormerReference.js (now also exports cropReference), new src/server/transomReference.js, and updated src/server/photoPrompt.js plus its existing dependencies. Preserve request.referenceDetails.doorTransoms through persistence/retries alongside dormer bounds.
2. After the unchanged shed image 1 and scenery image 2, append dormerReference(...) if present as before. Then call `const transomDetail = await transomReference(shedReferenceBlob, request.design, request.referenceDetails)` and append its JPEG if present. Its filename is door-transoms-detail-from-image-1.jpg. It is image 4 with a dormer crop, image 3 without one. See api/backyard-preview.js for full multipart ordering.
3. Call buildPhotoPrompt with server-owned scene/pathway, fenceHeightFt:6, hasDormerDetail:Boolean(detail), AND hasTransomDetail:Boolean(transomDetail). Record prompt version cfs-reference-detail-v4 and actual image count in protected diagnostics. The prompt derives selected frame hex from design.windowFrameColor; black stays black even on white doors, white stays white when selected. Surrounding wooden rails/stiles retain their separate door paint. Preserve zero horizontal bars, selected pane counts, model/high fidelity/quality, straight path, auth, watermarking and job behavior.
4. Older captures/no eligible transoms continue without a transom crop. Invalid bounds fail before provider spend. Do not crop a generated output or invent a crop for missing metadata. Do not hardcode black for all customers.
5. Verify actual saved source/crop and final v4 prompt before fresh test generation. Use the user's SAME saved design/backyard first; no redesign is needed. Check black door-transom dividers, vertical-only dormer grids and straight ramp/path together, then check white frame selection on a separate test fixture. Do not reuse cached generated outputs.

Validation: all 98 tests pass. Added coverage for both front door leaves, omission of far-wall transoms, real JPEG cropping, missing metadata/no-transom compatibility, invalid bounds, selected black/white prompt colors, and provider image order with and without a dormer. build:handoff passes with /design/ base. Existing available browser has WebGL disabled, so this does not certify live capture/provider accuracy. No production generation/customer submission was performed here. User's three outputs support the prior dormer improvement only; v4 still requires deployed visual verification.


## Slab entrance correction — prompt v5 (latest)

User's slab test invented a concrete ramp. Existing global negative instructions did not prevent it. Found a reference-guide mismatch too: slab path height was -.004ft while the modeled slab bottom is FLOOR_HEIGHT-5/12 = .2733ft. capturePath now places the flat slab guide at the bottom + .003ft, keeping the 5in vertical threshold difference visible. Framed/ramp guides are unchanged. No shed geometry changes.

Claude: deploy newest handoff/dist at /design/ AND copy updated src/server/photoPrompt.js into the live photo worker (retain all v4 detail helpers/input ordering). Prompt version is cfs-reference-detail-v5. Slab requests now explicitly preserve the exposed vertical edge including under the door; the path stays flat at ground level and stops at that face. Do not bridge the threshold with concrete, sloping pavers, an extended slab, ramp, landing, apron or steps. The generic ramp-connection instruction is omitted for slab requests. Retain model/settings, detail references, auth, jobs and watermarking.

Validation: 99 tests pass; build:handoff passes at /design/. All-wall guide tests cover slab height and no ramp offset even if a stale ramp flag is present; new prompt test verifies the slab-only rule and absence of generic ramp language. No live generation was run. Deploy both changes, then reuse the SAME saved slab design/backyard for one fresh image; verify the source guide is at the slab bottom and output has a vertical slab face with no added entrance structure. Prior white/black grids, dormer, camera and straight path rules remain.


## French-door hardware and glass — prompt v6 (latest)

User's French-door test added exterior surface hinges, duplicate handles/deadbolts and opaque black glass. Source ResidentialDoor already renders ONE lever/deadbolt set on left leaf beside meeting stile, no surface hinges, and one ungridded glass pane per leaf. No geometry/material changes were needed: this patch tags the existing French unit for an enlarged source-reference crop. The spec now explicitly describes one entry set, no passive-leaf hardware, no exterior strap hinges, and clear reflective glass. Prompt allows preview-glass shading to become photographic reflections/depth while locking geometry and hardware.

Claude: deploy newest handoff/dist at /design/ AND update the live /api/form?designer=photo worker:

1. Copy src/server/frenchDoorReference.js, updated src/server/photoPrompt.js and src/photoSpecification.js. Keep existing cropReference module and v4/v5 detail wiring.
2. Preserve request.referenceDetails.frenchDoors through persisted jobs/retries. Call `const frenchDetail = await frenchDoorReference(shedReferenceBlob, request.design, request.referenceDetails)` and append optional JPEG AFTER shed, scenery, optional dormer, optional transom. Filename french-doors-detail-from-image-1.jpg. See api/backyard-preview.js.
3. Pass hasFrenchDoorDetail:Boolean(frenchDetail) plus existing hasDormerDetail/hasTransomDetail booleans to buildPhotoPrompt. It assigns correct image number. Log protected prompt version cfs-reference-detail-v6 and actual input count. Keep model/high fidelity/quality, auth, watermark, jobs and straight-path/slab behavior unchanged.
4. French-only rule: ONE lever + ONE deadbolt TOTAL, on left leaf as viewed from outside, beside center seam. Right leaf has no visible dummy set. No added exterior strap/T hinges, black corner brackets or surface hardware. One clear glass pane per leaf, no grids. Render subtle yard/tree/sky reflections and shaded interior depth; do not preserve opaque black preview shading or invent furnishings. Do not apply French rules to wood double doors or residential/sliding units.
5. Missing bounds/old clients still run without an added crop; French instructions/spec apply from door type. Validate actual saved crop and final prompt before a fresh generation of the SAME failed design/backyard. Check hardware count/location, hinges, reflections, roof/path/slab together. Small incidental flat landing remains tolerated by user; do not request one or add a feature. Concrete ramps remain unwanted.

Validation: 101 tests pass; /design/ handoff build passes. Added tests for French facts, conditional instructions/image numbering, source crop generation and compatibility, far-facing unit omission, malformed bounds, and provider multipart integration. JSX change is metadata only; reviewed existing single hardware instance. Actual WebGL/source crop and provider fidelity cannot be certified in this WebGL-disabled browser; no live image generation/customer submission occurred here.


## Softer French-door reflections — prompt v7 (latest)

User accepted v6 hardware/glass result but requested slightly blurred reflections. Updated src/server/photoPrompt.js asks for subtly defocused reflected tree/sky shapes, while glass remains clear (not frosted) and frames/hardware remain sharp. Prompt version cfs-reference-detail-v7. All v6 French hardware/detail rules remain.

Claude: copy updated photoPrompt.js to the live photo worker and verify v7 diagnostics. No frontend behavior or request contract change; build:handoff rebuilt successfully with identical dist. 101 tests pass, including soft-reflection/clear-glass/sharp-frame assertions. No live provider test performed. After deployment reuse the same saved French-door design/backyard for one fresh image.


## Sliding handle + faint reflections on all glass — prompt v8 (latest)

User's sliding-door output had opaque panels, a center handle plus hardware on surrounding right trim. Source ResidentialDoor already has ONE pull handle on the far-right door-leaf stile, no center handle. Geometry unchanged; tagged the existing sliding unit for a source detail crop. New spec describes one handle, exact location inside opening, no center handle/deadbolt/hinges and ungridded glass. Global prompt now asks for VERY FAINT slightly blurred yard/tree/sky reflections on ALL wall/dormer windows, transoms and glazed doors, keeping selected grids/colors sharp and glass clear, not frosted or opaque. Preserve French one-set rules.

Claude: deploy rebuilt handoff/dist at /design/ AND update live photo worker:
1. Copy new src/server/slidingDoorReference.js, updated src/server/photoPrompt.js and src/photoSpecification.js. Keep existing crop helper and prior detail wiring.
2. Preserve request.referenceDetails.slidingDoors through jobs/retries. Call slidingDoorReference(shedReferenceBlob, request.design, request.referenceDetails) and append optional JPEG AFTER shed, scenery, optional dormer, transom, French crops. Filename sliding-door-detail-from-image-1.jpg. Pass hasSlidingDoorDetail:Boolean(slidingDetail) with all existing detail flags to buildPhotoPrompt. api/backyard-preview.js demonstrates exact ordering. Record cfs-reference-detail-v8 and input count in protected diagnostics.
3. Exactly ONE pull handle, on far-right vertical stile of DOOR LEAF as viewed outside, inside opening. None at center seam, none on surrounding trim/wall, no second handle, knobs, separate deadbolts or hinges. Two sliding glazed panels, not French doors, no invented grooves/grids. Apply very faint softened reflections to all glazing.
4. Old/no-detail requests remain compatible, conditional sliding instructions still apply from type. Model/settings, auth, watermark, jobs and slab/no-concrete-ramp rules remain. User tolerates incidental small flat landings; do not request/add as a feature.
5. Verify actual crop and v8 prompt, then generate ONE fresh image of the same saved sliding-door design/backyard. Check one far-right leaf handle and faint soft reflections across door AND wall windows. No redesign needed.

Validation: all 103 tests pass, /design/ build passes. Tests cover selected sliding facts, global reflection instruction, conditional numbering, projection/cropping, far-facing omission, missing/invalid bounds and actual provider multipart input. Source hardware reviewed; actual WebGL and provider fidelity still require deployed image check. No live job/customer submission made here.


## Reflection intensity + slab slope refinement — v9 (latest)

User confirms sliding handle is correct after v8. Output reflections remain too mirror-like, and entrance pad appears ramped. Preserve all hardware/detail wiring. Updated photoPrompt.js requires mostly quiet shaded glass with barely perceptible softly blurred outdoor shapes, no recognizable sharp fence/lawn/tree scene, no bright reflected lawn; frames/hardware sharp. Slab instruction now explicitly forbids connecting threshold height to path with any sloped/wedge surface. Ground path horizontal, vertical slab face retained; any incidental pad must be horizontal with vertical edge. User still tolerates incidental flat landing; do not request/add a pad as a feature.

Claude: deploy rebuilt handoff/dist (/design/) and copy updated src/server/photoPrompt.js AND src/photoSpecification.js to the live worker. Keep v8 optional detail helpers/input ordering/flags and all model/job/auth settings unchanged. Record cfs-reference-detail-v9. 103 tests and build:handoff pass; no live provider generation here. Test SAME saved sliding-door slab design once after deployment, checking faint reflections, flat approach and one far-right leaf handle. Prompt language is not a guarantee; inspect generated image before accepting.


## Designer additions + roll-up wall inventory — latest, v10

Implemented user requests:
- Lean-to Style offers High At Front / High At Back. `shed.roofHighWall` (front default/back reversed) persists in drafts and quote payload, passes through modelDesign to exterior/interior and photo spec. Only structural shell rotates for reversal; openings and world wall IDs stay fixed. Interior high wall, sloped end framing/rafters agree. Gable export omits lean-specific field.
- Interior placement wording is End Wall, not Gable Wall. Catalog machine kind alongGable retained for compatibility.
- Double Storage Loft toggle adds two 45in-deep platforms, one per end. Minimum length 10ft prevents physical overlap. Shrinking below 10ft reverts to one loft. Export TWO elements with existing code loft-45, unique ids loft-45-left/right, qty1 each and distinct walls. Existing promo marks only ONE free. Backend must preserve both rather than deduplicate by code or apply free status to both.
- Residential entry door default is catalog standard white (Snowscape). French and roll-up defaults now follow SELECTED trim color, not catalog standard trim; per-door explicit overrides retained. Existing wooden shed doors still follow body by default, sliding/vinyl factory doors stay standard white. This interprets user's exterior-door wording as residential entry; no unsolicited wooden-door default change.
- Painted opening surfaces now use the existing balanced-lighting treatment used for trim to reduce gray back-wall doors/window frames. Wood leaf surface, window opening boxes, residential painted pieces and roll-up curtain updated; metal hardware and global roof/siding materials retained. Trim shader unchanged. Requires visual front/back comparison on WebGL-enabled browser.
- How Did You Hear About Us field/select full-width, min46px, consistent form styling.
- Roll-up cutout now trims ONLY battens around the entire 3.5in casing, while retaining siding backing behind casing. Curtain opening size unchanged. Tagged batten groups select expanded trim-clearance holes; original wall cutouts still cut nominal opening.

Photo failure fix requested after Claude diagnostics (job 7c2ba1cc / quote 2070): latest prompt cfs-reference-wall-lock-v10. photoSpecification.wallOpenings explicitly lists doorCount/windowCount and openings for all FOUR fixed wall IDs including zeros. Hidden openings cannot relocate. PHOTO_DESIGN_RULES is now neutral; doorConstructionRules adds strap-hinge/siding-leaf rules only when wood single/double doors actually exist. Roll-up-specific rule retains corrugation/recess/threshold/latch and forbids companion man-door, invented window and garage-style apron/ramp. Counts allow intentionally selected multiple openings on the same wall; do NOT hardcode roll-up as sole door universally.

Claude deployment required (no live backend changes made here):
1. Deploy rebuilt handoff/dist at /design/.
2. Copy updated src/server/photoPrompt.js, src/photoSpecification.js AND src/photoDesignRules.js together into live worker; prompt imports new doorConstructionRules export. Keep v8/v9 detail helpers/flags, input ordering, model settings, auth/jobs/branding unchanged. Log cfs-reference-wall-lock-v10. No extra crop/input required for this roll-up fix.
3. Accept/persist/display shed.roofHighWall (front/back) in quote/load integrations and preserve it if mapping state. Do not silently default reversed roofs to front high. Surface both loft element IDs and only one free loft. Existing catalog codes unchanged; no prices added.
4. Before retesting roll-up, visually inspect failed job image1 (still not supplied here) to verify no capture mismatch. Then same saved roll-up design once: left gable exactly one roll-up/no pedestrian door/no window, front/back long walls zero openings, one right-gable window stays hidden. No concrete ramp; incidental small flat landing tolerated, not requested. Check reference model includes selected trim color too.
5. Review UI/model: toggle both lean directions with fixed openings, interior framing agreement, both end lofts, colored French/roll-up vs white residential, front/back painted opening consistency, full-width referral dropdown, battens stopping at casing. Available browser previously reports WebGL disabled, so source/unit checks do not certify rendered appearance.

Validation: 108 tests pass and build:handoff succeeds with base /design/. Added coverage for reversed slope persistence/model/spec and unchanged opening positions, two loft items/one promotion/minimum length, selected-trim door defaults/overrides, expanded batten casing clearance vs nominal backing hole, exact 10x16 roll-up case wall counts and absence of wood-door instructions. Existing UI hooks/state flow reviewed. No actual WebGL visual QA, live generation, customer submission or live backend deployment performed here.

## 2026-11-02 — v11 visible-wall inventory and tighter reference camera

Latest roll-up output still moved the opposite-gable window onto the visible long wall and placed the shed left of center. This patch is not yet validated against a live generated photo.

Deploy rebuilt handoff/dist (base /design/) AND update the live photo worker:
- Copy src/server/photoPrompt.js. Prompt version is cfs-reference-visible-walls-v11.
- Forward referenceDetails.visibleWalls into buildPhotoPrompt's visibleWalls option, as demonstrated in api/backyard-preview.js. Preserve this metadata in diagnostics. No new image inputs or model/settings changes.
- The frontend derives these model wall IDs from the actual capture camera in shed-local coordinates. The prompt validates IDs and computes exact opening counts from the submitted design. Visible zero-opening walls explicitly require uninterrupted siding; hidden openings must not be relocated.
- Keep existing photoSpecification.js/photoDesignRules.js v10 conditional door rules and crop pipeline.
- Reference camera now searches for a close full-building fit and centers projected horizontal bounds, preserving eye height and door-facing angle. Generated composition explicitly centers the shed (not the path) and requests a tighter crop.

Verification: 109 tests pass; build:handoff passes. Added regression checks for roll-up-left / window-right visibility, blank visible long wall, centered projected bounds, and tight fit. Existing size/aspect/door-wall camera tests pass. No live image-generation or WebGL visual QA claimed.

Next test after BOTH deployments: resend unchanged 10x16 gable slab design, left-gable roll-up, right-gable window, front/back blank. Save actual image 1 plus visibleWalls diagnostics. Expect roll-up only on visible gable, uninterrupted visible long wall, hidden opposite-gable window, shed centered with tighter scenery margins, straight path, no concrete ramp. If source image or visibleWalls disagrees, stop and inspect capture before another generation.

## 2026-11-02 — Transparent composite capture (cfs-cutout-v1)

Designer implementation is ready for Claude's separately deployed photo worker. Rebuilt handoff/dist uses /design/. This does NOT enable compositing or change v11/model/provider settings.

Photo request now optionally includes shedCutout: a data:image/png;base64 PNG at exactly 1536x1024. referenceDetails.cutout contains version cfs-cutout-v1, width 1536, height 1024, sameCameraAsShedImage true and normalized alpha bounds {x,y,width,height}. The PNG and existing JPEG shedImage use the same cloned camera, aspect, dimensions and pixel placement. PNG is captured before the path guide is inserted; source scene visibility hides contact shadows/interior/scenery. Shed geometry includes slab, supports and selected ramp. Transparent clear is alpha 0; browser canvas serialization supplies straight alpha with antialiased edges. No color-keying or manual alpha division.

All paths transport the field: send-first photo request, chosen backyard preview passed into quote flow, and legacy /api/backyard-preview POST. Requests without shedCutout retain the old shape. Legacy endpoint accepts the extra request field but intentionally does not composite; Claude implements the worker. PNG data URL limited to 2.8M characters (including base64); JPEG quality adjusts against remaining capture budget (3.8M combined maximum). Full serialized photo body is measured in UTF-8 and rejected at 4,000,000 bytes. Empty, fully opaque, oversized or blank cutout capture fails explicitly rather than sending an invalid cutout. PNG only, no potentially lossy WebP fallback.

Worker contract confirmed: keep BACKYARD_COMPOSITE off globally; enable only a server-selected test job. Validate dimensions and actual alpha, save source cutout, raw generated image and composite; paste source cutout at (0,0) with no geometric transform, then branding. Missing/invalid cutout in an enabled test is a failed test, not a successful uncomposited photo. Record opaque-pixel equality BEFORE badge/JPEG encoding. Do not change prompt/model/settings during this test. Alpha-bound metadata is diagnostic: validate the image rather than trusting it. Existing old-client requests remain supported.

Validation: 112 tests pass and build:handoff passes. New tests cover alpha-only bounds preserving white pixels, missing transparency rejection, transparent clear and sibling exclusion, visibility/background restoration after oversized encoding, unchanged camera, field transport, old-client shape, UTF-8 body limit. Actual WebGL raster edge quality and live generation/compositing remain to be reviewed; no live or browser visual QA claimed.

Next: deploy designer + Claude worker, run same 10x16 slab roll-up-left/window-right job once with server-only composite override, inspect all three artifacts for preserved blank visible wall, ghost edges, contact shadows and path alignment. Do not ask user to redesign shed.

## 2026-11-02 — cfs-layers-v1 designer capture and signed upload

Implements the app worker contract supplied with app commit 2d0d80b. Deploy rebuilt handoff/dist at /design/. No server switch, prompt or model is changed in this repo. Keep the app's split-layer test OFF globally; enable one saved job server-side for review after deploying this frontend.

### Capture

All three source layers are transparent PNGs, exactly 1536x1024, serialized by browser canvas with straight alpha, using the identical cloned reference camera/projection/placement as shedImage. Existing shedImage JPEG capture/validation and visible-wall/crop metadata remain. The cutout has both alpha-zero and alpha-255 pixels; captures reject invalid cutouts. Its limit is now 8 MiB raw for separate upload, rather than the old inline base64 budget.

- shedCutout: unchanged shed-only capture, including slab/supports and any actual selected ramp. Captured BEFORE any reference path guide is added.
- pathLayer: geometry-rendered flat straight constant-width path for each actual door, perpendicular to that wall, with the opening's center/width. A tagged actual ramp's geometry determines the path start at its foot, including siding/assembly offsets. No invented ramp. Slab path stays at slab-bottom ground level and starts at the slab face. Paths extend to the image boundary (long geometry clipped by the same camera), not toward bottom-center. No guide rails. Procedural material tiles follow the chosen backdrop: coastal large staggered stone pavers, garden smaller varied stone pavers, lawn gray gravel. This is a deterministic material approximation, not an AI reconstruction of the reference stones.
- shadowLayer: an isolated scene clones the actual shed geometry as shadow casters (including slab, roof, supports/ramp). A transparent ShadowMaterial plane receives cast/contact shadows at the shed's physical ground height. The shadow light matches the viewer's principal world direction [9,20,12], regardless of siding shadow flags. After rasterization, RGB is explicitly zeroed, leaving opacity only in alpha. No visible ground plane, shed-color pixels or multiply operation. Original scene/materials are not modified or disposed. Renderer state and temporary resources restore/dispose on success or error.

Path/shadow layers may be fully transparent; only these passes allow empty captures. Blank-reference and cutout checks remain enforced. No independent layer resizing/reframing; all captures happen together before submission so later design edits cannot mix cameras/designs.

### Upload and dispatch

The send-first flow keeps layers in client memory until submit returns photo {id,token}. It then:
1. POSTs authenticated {id,token} to API_BASE + /api/form?designer=photo-upload (all three default names).
2. Validates cfs-layers-v1 response and every signed upload entry, maxBytes and HTTPS URL. Checks PNG signature/IHDR, 1536x1024 dimensions, alpha-capable format and <=8 MiB raw before allocation; server remains authoritative for full PNG/alpha decoding.
3. PUTs raw PNG Blob bytes with Content-Type image/png, no app credentials/cookies forwarded to storage. Uses exact server paths. Cancellation stops dispatch.
4. Only after all PUTs succeed, POSTs the existing photo request plus layers {version:cfs-layers-v1,width:1536,height:1024,sameCameraAsShedImage:true,files:{shedCutout,pathLayer,shadowLayer}}. The old shedCutout data URL is omitted from this durable flow. PNGs never enter the JSON request/quote submission. JPEG shedImage remains validated/saved as before.

Allocation/PUT failures stop before photo POST/polling (no paid-call fallback). A dropped photo POST after successful uploads still follows existing polling behavior. Old requests without layers retain the existing shape. The legacy direct /api/backyard-preview path remains compatible with its existing inline cutout contract; it has no quote photo id/token and does not use the new upload endpoint. The selected-backyard capture carries the correct material and the three layers through to send-first submission.

### Verification and first live test

119 tests pass; build:handoff passes; git diff --check passes. Regression checks cover all door-wall path axes/widths, real ramp endpoint, slab ground height, shadow caster isolation/no mutation, black RGB with preserved alpha, empty passes, renderer restoration on failure, authenticated allocation/raw PNG PUTs, exact manifest paths, omission of inline cutout, size/format failures, cancellation and stopping before paid dispatch on upload error. Original quote/photo and geometry tests pass.

Browser raster QA is unverified: managed sites-preview cannot resolve vite in its preview process (workspace npm build succeeds). No alternate browser automation or paid generation was run. The first live job must inspect actual layers for shadow coverage/softness, grounding, path material, and alignment before enabling wider use. Run the same 10x16 slab, left-gable roll-up/right-gable window once with the app's server-side switch. Save all layers, scenery and pre-logo/final stacks; check the cutout opaqueMatch and visibly blank long wall. Confirm no scenery-generated building/path, one roofline, no floating, path meets slab at ground level. Then separately test a wood-floor ramp, reversed lean-to and dormer before any general rollout.
