# Owner Edit — Phase 1 designer/app handoff (2026-11-02)

Branch: `v1-2-foundation-accuracy`. Phase 1 only. Do not enable `?render=` yet.

## Launch / load

The app presents a **visible** full-screen iframe at `/design/?edit=TOKEN`, with app-issued owner-only token (24h). On mount, designer requests:

`GET /api/form?designer=load&edit=TOKEN`

Expected JSON (all keys are required; return a 401 for missing/expired tokens):

```json
{
  "mode": "owner-edit",
  "quoteNumber": "Q-123",
  "design": { "format": "cfs-designer-v1", "shed": {}, "colors": {}, "elements": [], "customer": {}, "uses": [], "source": {} },
  "editorState": {
    "state": {
      "shed": {},
      "colors": {},
      "placed": [],
      "extras": []
    },
    "backyardSetting": "coastal",
    "uses": [],
    "usesOther": "",
    "source": {"code": "", "other": "", "referredBy": ""}
  },
  "contact": {
    "firstName": "", "lastName": "", "phone": "", "email": "",
    "street": "", "city": "", "state": "NC", "zip": "",
    "use": [], "source": "", "referredBy": "", "notes": ""
  }
}
```

`design` is the last saved `cfs-designer-v1` body **without image data**. `editorState` is the exact object received on the last submit, returned unchanged, max 100 KB. Its `state` is the complete editor state, including placed opening IDs/codes/walls/positions, paint, ramps, shutters, flower boxes, extra quantities/walls/dowel dimensions, shed options, pitch and colors. Preserve it opaquely: do not rederive from quote item labels or prices. Backfill preexisting designs by reconstructing their editorState in the app, where possible; designs without it display an error rather than silently dropping selections.

For `contact.use`, return an array of use codes, not a comma-separated display label. For `contact.source`, return the source code or object `{code,other,referredBy}`. The contact form allows updating the entire contact record. Existing SMS consent remains in `design.customer.smsConsent`; owner edits do not demand fresh opt-in.

## Submit: same route, additional top-level fields

All new submissions now include:

- `editorState`: opaque JSON snapshot, **<= 100 KB**, with structure shown above
- `editToken`: only present on owner edit; never present on public customer submission

In owner-edit, `POST /api/form?designer=submit` carries the complete existing payload (including 9 images; first render image in pending state, 4 customer-facing walls, 4 hidden technical elevations), plus `editToken`. Server MUST authenticate the token, update **the existing quote** atomically/in-place, reprice, replace captures and start a new photo job. Do **not** create a new quote or send customer texts/emails. Response must be `{ok:true,quoteNumber:"Q-123",photo:{id:"...",token:"..."}}` (photo uses existing send-first flow). The parent receives `{type:"cfs-design-saved",quoteNumber}` only after the submit response succeeds. Close button posts `{type:"cfs-close-preview"}`. Parent should validate `event.origin` and `event.source` when handling these messages.

Owner save deliberately hides the consumer receipt, and ignores the requirement to collect **new** SMS consent. The original design/catalog codes, photo model, v12 prompt, capture cameras, and customer flow remain unchanged.

## Integration boundary / Phase 2

Phase 2 (`?render=TOKEN`, fit/conflict checks, silent recapture) is **not implemented**. This commit does not add quote-to-design last-write-wins handling. The app owns token security, quote versioning and canonical saved revision, and must serialize concurrent edits or reject stale revisions to guarantee true last-write-wins. Reopen a fresh app-issued token after conflicts.

## Validation needed before production enablement

End-to-end app staging test: 12x16 => 12x12 preserving openings, change contact, inspect new saved editorState, verify same quote number, capture images, no notifications, photo job, return visit and stale token 401. Also test customer submit and restore. A local npm build / browser screenshot has **not** been run in the GitHub connector environment.
