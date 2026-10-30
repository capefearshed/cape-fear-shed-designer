# Wilmington backyard scene assets

Created with the built-in image-generation tool. Final 1536x1024 JPEG backdrops and smaller card thumbnails live in `public/backyards/`.

## Prompt set

- **wooded.jpg**: Photorealistic eye-level Wilmington, NC backyard with tall longleaf pine trees and airy needle crowns, local understory, pine straw borders, clear central lawn for inserting a shed, and a gray gravel foreground pathway. Natural coastal daylight; no shed, fence, people, ocean, mountains or lettering.
- **fenced.jpg**: Photorealistic eye-level Wilmington backyard with a 6-foot natural pressure-treated wood fence, vertical boards, visible rails, capped posts and a gate. Mature local trees, simple peripheral planting beds, clear central lawn and large warm gray/tan stone pavers. Uploaded customer photo used as a fence-style reference; a new setting was generated rather than publishing the private yard photograph.
- **garden.jpg**: Photorealistic eye-level Wilmington garden with curved borders, azaleas, hydrangeas, grasses, crepe myrtle, live oaks, clear central lawn and smaller irregular pavers in a random garden-path pattern. Natural afternoon light; no shed, fence, people, ocean, mountains or lettering.

`src/backyardSettings.js` maps each card to the same backdrop sent as the second image to the image-edit endpoint. Pathway instructions are tied to the selected setting. The output prompt calls for the shed to occupy 65–80% of the frame in its dominant dimension; background crops and path extensions may adapt to the shed. Generated images remain illustrative, not exact site or design measurements.

Scene browsing is static. Generating the final composite uses the image API and includes the shed image plus the chosen scene reference as inputs.
