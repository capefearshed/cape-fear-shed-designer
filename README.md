# Cape Fear Shed — 3D Designer V1 (development prototype)

Independent customer-facing 3D designer prototype. Does **not** connect to the existing Cape Fear Shed app or send customer details.

## Features included

- Real WebGL 3D model with orbital rotation, pinch zoom, and responsive controls.
- Configurable gable shed footprint, wall height and roof pitch.
- Four-inch nominal overhangs, initial roof/trim/siding choices.
- Add doors and windows, select a wall, change horizontal position.
- Conservative opening spacing validation (placeholder values, **not structural approval**).
- Export structured JSON locally for later API integration.

## Known V1 limitations

- Openings are surface-mounted visual components, rather than actual boolean-cut holes. Geometry is an early draft.
- Wall openings and siding texture, roof shingles, dimensions and construction details need refinement against photos.
- No live pricing, quoting, customer submissions or back-end integration yet.
- This uses a provisional branded layout; official logo/assets can be added later.

## Run locally

```bash
npm install
npm run dev
```

## Deploy on Vercel

Import this repository in Vercel with the Vite framework preset, build command `npm run build` and output directory `dist`. Vercel should redeploy whenever you push changes to the connected GitHub repository.

## Security

No credentials, webhooks or private customer information are needed for V1. Never embed the management app webhook secret in client-side JavaScript.
