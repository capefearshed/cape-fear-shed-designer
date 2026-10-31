# Cape Fear Shed 3D designer

Catalog-driven designer with the October 31 replacement quote contract. Existing models, opening editor, interior cutaway, backyard generator and approved colors are retained.

```sh
npm ci
npm test
npm run dev
npm run build
npm run build:handoff
```

`build` produces `dist/` for the standalone preview. `build:handoff` produces `handoff/dist/` with base `/design/` for the app domain.

- `src/api.js`: same-origin catalog/submit/load transport. Catalog is bundled and submission remains an explicit test stub. There is no price endpoint or client pricing.
- `src/catalog.sample.json`: option codes, sizes, availability and placement rules, without prices.
- `src/colorPalette.js`: retained paint, shingle and metal colors.
- `src/designContract.js`: quote payload, automatic ramps and complimentary loft/workbench selection. Paint and anchors are the app's responsibility.
- `src/submissionCapture.js`: five JPEGs in order `render`, `front`, `left`, `back`, `right`; all 1500×1000. Elevations use orthographic cameras, a common scale and plain background with no cast shadows or overlays. The render uses the last generated backyard photo for the current design when available, otherwise an automatic perspective.
- `src/CatalogDesigner.jsx`: customer interface. `?mode=owner` is a stub-only testing convenience, not authentication.
- `scripts/render-handoff-samples.mjs`: reproducible software-rendered integration fixtures from the same Shed model; these omit WebGL textures and reflections.

See `handoff/CLAUDE-HANDOFF.md` for activation and verification limits. Live quote creation and saved-design loading require the app's endpoint implementation. No main-branch merge is required to test the preview.

Backyard generation uses the existing server-only `OPENAI_API_KEY` and `/api/backyard-preview` function. Never expose that key in browser code.
