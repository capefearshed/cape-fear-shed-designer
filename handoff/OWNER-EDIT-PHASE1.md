# Owner Edit and quote → design sync — final designer/app contract

Updated November 2, 2026 to match app commit `ad64ea1`. This supersedes the initial source-only Phase 1 notes from `240e145` and the earlier flat editorState / modified-design Phase 2 proposal.

## Phase 1: edit a saved design

The app opens `/design/?edit=TOKEN` in a visible full-screen same-origin iframe. The designer calls:

`GET /api/form?designer=load&edit=TOKEN`

Return:

```json
{
  "mode": "owner-edit",
  "quoteNumber": "Q-123",
  "design": {"format":"cfs-designer-v1", "shed":{}, "colors":{}, "elements":[], "customer":{}, "uses":[], "usesOther":"", "source":{}},
  "editorState": {
    "state": {"shed":{}, "colors":{}, "placed":[], "extras":[]},
    "backyardSetting": "coastal",
    "uses": [],
    "usesOther": "",
    "source": {"code":"", "other":"", "referredBy":""}
  },
  "contact": {
    "firstName":"", "lastName":"", "phone":"", "email":"",
    "street":"", "city":"", "state":"NC", "zip":"",
    "use":[], "source":{"code":"", "other":"", "referredBy":""},
    "referredBy":"", "notes":""
  }
}
```

Examples abbreviate design/state: return the full saved values. `design` excludes images, editorState and tokens. Store and return `editorState` unchanged, max **100,000 UTF-8 bytes**. The designer owns its internals. The published wrapper `.state` contains the complete editor geometry; `.state` may also contain retained gablePitch and backyardSetting. The outer backyardSetting is authoritative on load. The designer also reads early flat editorState snapshots for compatibility, but all new submits emit the wrapper above. Snapshot use/source values are fallbacks; contact overrides them.

**Legacy designs:** agreed: change the app's no-editorState 409 to return `editorState:null` for otherwise editable older new-designer designs. The designer reconstructs its internal state from the cfs-designer-v1 catalog codes, shed/colors, element IDs/walls/x/y, ramp associations, shutters/flower boxes, paint, double loft/workbench elements, racks/quantity/wall/dowel and anchors. It validates the result and never silently drops an unknown or invalid item. The next save upgrades it to the full wrapper. Historical bodies cannot identify whether same-as-body door paint was explicitly selected or recover a retained pitch/backyard setting that was never submitted; appearance and selected contract options restore from the actual saved body, with the existing coastal fallback for a missing backyard setting. The app must not manufacture placed IDs or internal state.

Contact fields are prefilled and editable. Buttons say Save changes. No customer receipt, thank-you or new SMS opt-in appears. The customer's existing smsConsent remains intact. Owner sessions do not read or write the public local draft.

Submit: existing `POST /api/form?designer=submit`, unchanged cfs-designer-v1 body/codes plus:

- `editorState`: wrapper on **every** new submit, including customers.
- `editToken`: only in owner-edit.

Response: `{ok:true,quoteNumber,total,photo:{id,token}}`. The designer keeps designId/revision/context and original submitted mode, and does not issue a new quote request. The server authenticates the edit session, updates/reprices the SAME quote, keeps custom lines and history, replaces captures, starts the existing send-first photo job and suppresses push/text/email. Tokens must never be stored in design/editorState. Repeated saves from the same open session are supported.

All parent messages use **`window.location.origin`**, never `'*'`:

- `{type:"cfs-design-saved",quoteNumber}` after successful save and after layer uploads/photo-start acceptance. The app reloads the quote; **the sheet stays open**.
- `{type:"cfs-close-preview"}` when Close is clicked.

The designer does not navigate away or close the parent sheet on save. Waiting for photo-start acceptance ensures the photo work persists even if the owner closes immediately after receiving the message. Photo-start failures show that changes were saved but photo start needs retrying; no misleading completion message is emitted.

Load/submit **401** (including stale sessions) displays `This edit link expired — open it again from the app.` Load/submit **409** displays the server's `message` (falling back to `error`), including approved/non-editable quote explanations. A blocked load never opens an editable default design. App owns token HMAC/24h expiry, session invalidation and last-write-wins enforcement.

## Phase 2: apply quote choices without a designer form

The app opens `/design/?render=TOKEN` in a **visible** full-screen same-origin iframe. The route shows Updating pictures… with a real, visible 65vh canvas. Do not hide, zero-size or place the iframe offscreen: captures read the actual canvas.

Load: `GET /api/form?designer=load&render=TOKEN`. Same response as above, with `mode:"owner-render"` (`owner-edit` also accepted), plus optional `changes`:

```json
{
  "changes": {
    "size": "size-12x12",
    "wallHeight": "wall-7",
    "siding": "siding-lp-lap",
    "roofing": "roof-shingle",
    "dormer": false,
    "colors": {
      "siding": {"name":"Sea Salt", "code":"SW 6204", "hex":"#CDD2CA"},
      "trim": {"name":"Snowscape", "hex":"#F2F0EB"},
      "roof": {"name":"Onyx Black", "profile":"charcoal", "hex":null}
    }
  }
}
```

**Confirmed exact field names:** `size`, `wallHeight`, `siding`, `roofing`, `dormer`, `colors:{siding,trim,roof}`. Every change is optional; omitted choices stay unchanged. Size/wall/siding/roofing use existing catalog codes; dormer is Boolean. Colors should use the existing complete saved color objects (copy the actual palette objects; illustrative hex values above are not a new palette). Available palette code/name strings are also accepted. Shingles legitimately have `hex:null` and use their known profile/name. Unknown fields/codes/colors fail as conflicts.

**The app does not edit editorState internals or pre-scale opening positions.** With `changes` present, return the last saved design and unchanged editorState as the baseline. The designer applies the delta to editorState.state, derives dimensions/style, then fits. Older designs with `editorState:null` can first reconstruct from the unchanged original design before applying changes. If `changes` is absent, the earlier compatibility path accepts an already-modified design plus its original editorState; without any baseline dimensions it returns a conflict rather than guessing.

The fit preserves opening IDs, walls, types, relative positions and neighbor order. Positions scale by new span/original span, then clamp/adjust only as required by normal corner/trim/gap rules. Roll-up restrictions, unavailable dormers, incompatible roofing, missing/unknown elements, loft and rack capacity all produce conflicts, never dropped items or reduced quantities. Turning a dormer off returns ordinary gable to 5/12; a false dormer flag leaves a lean-to unchanged. Derived trim/factory door paint follows color changes; explicit overrides remain explicit.

If something cannot fit, no capture or submit occurs. Parent receives:

```json
{"type":"cfs-render-conflict","conflicts":[{"id":"door-1","wall":"front","reason":"The openings, trim and required gaps no longer fit on this shorter wall."}]}
```

Global conflicts use `id:"design"`, `wall:null`. The app directs the owner to Edit design for repair. For the older modified-design compatibility path, Edit design loads the latest design dimensions/colors and retains offending openings rather than reverting geometry or silently removing items.

Success uses the same normal capture methods: pending render + four customer wall images + four hidden scaled elevations; photo reference, visibleWalls, detail crops, shed/path/shadow layers and layer upload all follow the unchanged send-first flow. The fifth customer picture completes through the existing persistent backyard job. Submit the actual fitted cfs-designer-v1 body with **`renderToken`** (no editToken) and a fresh wrapped editorState. Return the same submit response; after durable photo-start acceptance post `{type:"cfs-render-done",quoteNumber}` to the same-origin parent. No user interaction is required. Capture/network/photo-start failures remain visible and do not emit done.

The app owns update-in-place, session/revision authorization, repricing, portal replacement, notification suppression and rejection of late render/photo results from obsolete revisions. The designer cannot enforce server-side last-write-wins itself.

## Build and verification

`handoff/dist` is rebuilt with base `/design/` in this update. Prompt v12, the image model, photo generation rules and normal capture methods are unchanged.

Automated checks cover wrapped/flat state, legacy reconstruction, contact use/source objects, owner 401/409, changes mapping, geometry fitting and photo dispatch ordering. Prior browser QA verified prefilled contacts and iframe conflict messaging. The cloud browser has no WebGL, so a successful live canvas capture still needs the app-browser integration test.

Dan's next test uses a NEW design submitted with this build: 12x16 → 12x12, edit contacts, verify the same quote number, new captures/photo, no notifications, repeat Save changes from the same sheet, then open a new link and verify the old one gets 401. Also test approved-quote 409 and a normal customer submit. After the app switches legacy load to editorState:null, verify one older design upgrades on save. Render-only end-to-end testing follows once the app serves the confirmed changes contract.
