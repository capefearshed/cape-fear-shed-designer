# Cape Fear Shed — 3D Designer V1 (development prototype)

Independent customer-facing 3D designer prototype. Does **not** connect to the existing Cape Fear Shed app or send customer details.

## Features included

- Real WebGL 3D model with orbital rotation, pinch zoom, and responsive controls.
- Configurable gable shed footprint, wall height and roof pitch.
- Standard 5/12 gable roof, with four-inch horizontal overhangs on all four sides; pitch remains adjustable.
- Continuous roof slopes, closed soffits, fascia, drip edges and overlapping ridge caps.
- Locally generated LP SmartSide-inspired vertical grooves and wood grain, plus staggered architectural-shingle grain and raised course edges.
- Painted double doors with strap hinges, fasteners, pull handle and threshold; framed glazing with muntins, sill and drip cap.
- Louvered gable vents and TuffBlock-style tapered supports beneath timber skids.
- Add doors and windows, select a wall, change horizontal position.
- Conservative opening spacing validation (placeholder values, **not structural approval**).
- Export structured JSON locally for later API integration.

## Known V1 limitations

- Openings are surface-mounted visual components, rather than actual boolean-cut holes. Geometry is an early draft.
- Materials and foundation supports are visual approximations, not manufacturer-approved product models or foundation engineering. Support spacing is illustrative.
- Openings retain the prototype's wall-coordinate convention: front/back are the long walls and left/right are the gable ends.
- No live pricing, quoting, customer submissions or back-end integration yet.
- This uses a provisional branded layout; official logo/assets can be added later.

## Run locally

```bash
npm install
npm run dev
```

Alternatively, use `pnpm install --frozen-lockfile` and `pnpm dev`. The committed pnpm lockfile makes development installs reproducible. The pnpm workspace allows the esbuild installation script used by Vite.

Run `npm test` (or `pnpm test`) for roof geometry checks across the supported widths, lengths, pitches and wall heights. Run `npm run build` (or `pnpm build`) to verify the production bundle. Vite may report a large-chunk warning for the existing Three.js bundle.

Model rendering lives in `src/Shed.jsx`; `src/shedGeometry.js` contains the roof measurements. Textures are seeded and generated once per surface size, then disposed when replaced. No external texture service, database or management application is used.

## Deploy on Vercel

Import this repository in Vercel with the Vite framework preset, build command `npm run build` and output directory `dist`. Vercel should redeploy whenever you push changes to the connected GitHub repository.

## Security

No credentials, webhooks or private customer information are needed for V1. Never embed the management app webhook secret in client-side JavaScript.
