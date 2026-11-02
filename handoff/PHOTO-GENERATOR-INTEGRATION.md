# Latest: sliding handle and all-glass reflections, cfs-reference-detail-v8

Follow the latest v8 section in CLAUDE-HANDOFF.md. Deploy rebuilt /design/ AND update live worker prompt/spec plus new slidingDoorReference helper. Append optional sliding crop after existing detail inputs; preserve request.referenceDetails.slidingDoors and pass hasSlidingDoorDetail. Exactly one handle on far-right DOOR LEAF stile inside opening, none at center or on surrounding trim. ALL glass gets very faint slightly blurred yard/sky reflections; keep grids/frames sharp and glass clear. Preserve prior French/dormer/transom/slab rules and model/settings. 103 tests/build pass; use the same saved sliding design for one post-deployment image check.

---

# Latest: softer French-door reflections, cfs-reference-detail-v7

Update the live worker's src/server/photoPrompt.js. Reflected yard/tree/sky shapes should be slightly blurred, while glass stays clear and door frames/hardware stay sharp. Preserve all v6 detail input wiring and hardware rules. No frontend change; rebuilt dist is identical. 101 tests/build pass. Follow the latest v7 section in CLAUDE-HANDOFF.md and verify one fresh image of the same French-door design after deployment.

---

# Latest: French-door correction, cfs-reference-detail-v6

Follow **French-door hardware and glass — prompt v6 (latest)** at the end of CLAUDE-HANDOFF.md. Deploy rebuilt /design/ and update live worker prompt/spec plus new frenchDoorReference helper. Append optional French crop after all existing inputs and pass hasFrenchDoorDetail. Preserve request.referenceDetails.frenchDoors through persisted jobs.

The source model already has one left-leaf lever/deadbolt set, no surface hinges, and clear-pane geometry. Prompt now prevents mirrored duplicate sets/added hinges and explicitly turns dark preview glass into natural yard/sky reflections and shaded depth. Do not change model settings or existing path/dormer/transom behavior. Test same failed French-door design after deployment; 101 tests/build pass but generated fidelity needs review.

---

# Latest: slab entrance correction, cfs-reference-detail-v5

A user test invented a concrete ramp on a slab-only design. Deploy newest handoff/dist (corrected slab ground-guide height) AND update live worker src/server/photoPrompt.js. Keep v4 detail helper wiring; only prompt version/conditional slab instructions change server-side. Follow “Slab entrance correction — prompt v5 (latest)” at the end of CLAUDE-HANDOFF.md. A slab path must be flat, ending at the vertical slab face below the door, without bridging its threshold height. No added ramp, apron, landing, step or slab extension. 99 tests and handoff build pass; deployed image fidelity remains to be checked with the same saved slab design.

---

# Current update: door-transom detail reference v4

Three user tests of v3 preserved the dormer grids but changed black door-transom dividers to white. Follow the latest **Door-transom detail reference — 2026-11-02** section in CLAUDE-HANDOFF.md; it supersedes earlier v3 integration instructions below.

Deploy rebuilt /design/ AND update the live photo worker. Keep shed image 1 and scenery image 2. Append optional dormer crop, then optional door transom crop derived from the same shed image with new src/server/transomReference.js. Pass hasDormerDetail and hasTransomDetail booleans to the updated prompt builder. It numbers detail inputs correctly and uses the selected frame color, not door paint. Prompt version: cfs-reference-detail-v4. Copy the updated dormerReference module too (shared crop helper). Preserve both normalized bounds fields through jobs. See api/backyard-preview.js for exact integration.

No new design is needed for the first post-deployment check. Use the saved test design and verify actual input crops/prompt before generation. The 98 passing tests and successful handoff build verify code behavior, not generated-image fidelity.

---

# Current update: dormer detail reference v3

The capture hotfix restored usable live images in the user’s repeated tests. The next targeted correction is horizontal muntins being invented in dormer windows. Deploy the rebuilt /design/ bundle and apply the **Dormer detail reference — 2026-11-02** section at the end of CLAUDE-HANDOFF.md to the live photo worker. That section supersedes the earlier v2 prompt/capture status below.

The client now sends optional request.referenceDetails.dormer normalized bounds. src/server/dormerReference.js crops those bounds from the actual shed image with sharp and enlarges them to a 1024px-wide JPEG. Append it as image 3, after shed and scenery. Pass hasDormerDetail:Boolean(detail) to updated buildPhotoPrompt; diagnostics version is cfs-reference-detail-v3. See api/backyard-preview.js for complete integration. No image upload size increase, model change, path change, or automatic generation retry is included. Two-image requests remain supported.

Keep design/backyard unchanged for three post-deployment tests. Verify actual inputs and v3 prompt first; passing code tests does not guarantee generated grid fidelity.

---

# Photo generator integration: reference + exact design facts

Status update: the supplied live photo-run report confirms cfs-reference-spec-v2 was installed with gpt-image-1.5/high fidelity. Its saved first reference image is completely blank (1536x1024, uniform RGB 243/243/241). Fix capture/reference validation before another generation. This session still cannot access Vercel server source; the original 403/404 access limitation remains. No production generation or customer submission was made here.

## Immediate blank-reference fix

Deploy rebuilt handoff/dist for explicit exterior visibility and pixel validation. Add src/server/referenceValidation.js to the app backend and run await assertShedReferenceImage(decodedShedImageBlob) before accepting/spending on an image job. The updated api/backyard-preview.js demonstrates the call. Blank input must return a recoverable capture error, not proceed from text alone. Retest capture on the affected browser; open its actual saved first image and visually verify the building, window counts, camera and ramp before making a new image call. Keep model and v2 prompt unchanged to isolate capture. Do not reuse the failed job reference. The exact runtime cause of the blank capture still requires browser verification.

## Backend change required

In the app-owned /api/form?designer=photo worker, import or copy these reviewed modules together, preserving relative imports:

- src/server/photoPrompt.js
- src/photoSpecification.js
- src/photoDesignRules.js

After normal request validation, call buildPhotoPrompt(request.design, {scene, pathway, fenceHeightFt: 6}). Supply server-owned preset scene/material text; do NOT use caller-supplied instructions or a caller-supplied specification as the prompt. The builder derives facts afresh from the model. Replace the existing image-generation prompt, rather than appending another long competing prompt. Keep existing job persistence, authentication, storage, attachment, watermarking and failure handling.

The first input image MUST be request.shedImage, unchanged other than safe image encoding. Any second input is environment-only, without another shed or a foreground path that can dictate the route. Never replace shedImage with the yard sample, an elevation, the live editing camera, or a thumbnail. The shed reference already carries the approved entrance/window-side camera and the path guide.

The checked-in legacy api/backyard-preview.js demonstrates this integration, including a prompt-version response header. It remains gpt-image-1.5 / high quality / high input_fidelity / 1536x1024; those are not verified as the live worker settings and are not claimed to match the built-in ChatGPT test model.

Add cfs-reference-spec-v2 to internal job diagnostics with the actual image model/settings. Retain the exact first input image and final prompt in protected test diagnostics for comparison. Do not log customer images, job tokens, customer contact details, or API credentials into public logs.

## Regression test before production release

Use an isolated test job, not a new customer quote. Capture the actual submitted first image and final prompt. Confirm 10x12 dormer model yields 6ft dormer with TWO windows; 14-16ft length yields 8ft dormer with THREE windows. Door grids: 4ft and 6ft double shed doors have 3 transom panes per leaf; 5ft double has 4; single has 5; all vertical-only dividers with the global frame color. No added horizontal bar. Values come from actual renderer logic, not generic construction guesses.

Run the exact same submitted design 3-5 times through this worker with the updated prompt version. Compare each to its own source image for siding, color, overhang silhouette, dormer dimensions/count, all opening/grid patterns, camera direction, foundation/ramp, and straight approach. Then test a lean-to low-wall entrance, another siding, no ramp/slab, residential door, and metal roof. Check the new specification/request size against the live worker limit. Do not alter UI availability or quote pricing for this integration.

A passing unit/build check does not establish image fidelity. Do not label this production-fixed until those real outputs have been reviewed. If regeneration still changes structure, the next accuracy step is preserving the rendered shed pixels/geometry and generating only scenery; no automatic retry/vision verifier is implemented in this patch.

## Capture hotfix after sending stopped
The offscreen capture path remained blank and the new guard correctly prevented sending. New captureSceneCanvas uses an immediate visible-renderer canvas copy at export dimensions, bypassing half-float multisample/OutputPass readback. Applied to reference, customer wall photos and technical elevations. Deploy the newest handoff/dist. Keep the server blank guard. Open the newly captured reference before a paid generation; do not relax validation to permit blank images. WebGL browser capture verification remains outstanding, despite 92 passing unit tests and a successful build.
