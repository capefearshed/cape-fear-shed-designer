# Cape Fear Shed 3D designer

October 31, version 2026-10-31b quote hookup. The morning designer is the behavior baseline; the catalog supplies shared app codes. No prices or estimates are displayed or submitted.

```sh
npm ci
npm test
npm run dev
npm run build
npm run build:handoff
```

`build` produces `dist/`. `build:handoff` produces `handoff/dist/` with base `/design/`.

- `src/api.js`: bundled catalog today; live TEST submission to the app endpoint. App-domain hosting uses same origin; previews use the CORS-enabled app URL. `VITE_DESIGNER_STUB=true` explicitly selects an offline stub. No price endpoint or pricing math.
- `src/catalog.sample.json`: version 2026-10-31b fetched from the live catalog, without prices or colors. `getCatalog()` has the one-line live replacement documented.
- `src/styleRules.js` and `src/catalogLayout.js`: style eligibility, pitches, approved opening clearances, ordering and automatic spacing.
- `src/colorPalette.js`: retained approved palette; full export in `handoff/colors.json`.
- `src/designContract.js`: payload codes, optional ramps/anchors, shutters, rack dowels, free loft/workbench selection and color metadata.
- `src/submissionCapture.js`: five ordered 1500×1000 JPEGs. Wall pictures match the interactive designer perspective camera and lighting on a plain background, per Dan’s visual review. They are not scaled technical elevations. Send generates a missing backyard photo through the server and reuses the last matching customer render.

Deploy the existing `/api/backyard-preview` function and its assets with the frontend. Its server-only `OPENAI_API_KEY` must never enter the browser bundle. Static `dist/` alone cannot generate backyard photos.

See `handoff/CLAUDE-HANDOFF.md` for verification results and remaining handoff gaps. `handoff/samples/` contains older software fixtures, not the three completed submissions required by version b. Saved-design loading remains reserved for the future app endpoint. Main is unmerged.
