# Photo generator integration: reference + exact design facts

Status: prepared and tested in the designer repository. The live app handler is NOT updated by deploying handoff/dist. Vercel lists the cape-fear-shed project but denied deployment/source access (403 listing deployments; 404 project detail). No production generation or customer submission was made.

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
