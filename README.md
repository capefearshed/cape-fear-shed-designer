# Cape Fear Shed 3D designer

Catalog-driven test-mode integration for the Cape Fear Shed quote app. Approved 3D models, paint palette, roof finishes, opening editor, interior cutaway and backyard photo generator are retained.

```sh
npm install
npm test
npm run dev
npm run build
npm run build:handoff
```

`build` produces the standalone preview in `dist/`. `build:handoff` produces `handoff/dist/` with base `/design/` for the app domain.

- `src/api.js`: same-origin catalog/price/submit/load transport; price/submit remain in explicit stub mode.
- `src/catalog.sample.json`: app catalog codes/prices plus owner-approved door placement metadata.
- `src/colorPalette.js`: approved paint/shingle/metal palette overlay requested by Dan.
- `src/designContract.js`: contract payload, automatic items and estimated price.
- `src/catalogLayout.js`: catalog clearances, placement checks and snapping.
- `src/CatalogDesigner.jsx`: customer interface; `?mode=owner` is a stub-only test mode, not authentication.
- `src/DesignerViewer.jsx`, `src/Shed.jsx`, `src/InteriorShed.jsx`: viewer and approved models.
- `scripts/render-handoff-samples.mjs`: software captures and sample JSON fixtures from the actual model component, for non-WebGL integration tests.

See `handoff/CLAUDE-HANDOFF.md` for endpoint activation, owner authentication, catalog differences, color classifications, sample totals and remaining requirements from Parts 2/3 and the Oct 29 addendum. Do not activate live customer submissions until those contracts and server validation are reconciled.

Backyard generation requires the existing server-only `OPENAI_API_KEY` and `/api/backyard-preview` function. Never expose that key in client code. Native app quotes are not submitted by the current stub mode.
