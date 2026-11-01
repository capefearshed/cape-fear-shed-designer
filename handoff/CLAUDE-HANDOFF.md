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
