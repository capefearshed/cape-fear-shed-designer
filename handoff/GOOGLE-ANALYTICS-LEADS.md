# Google Analytics lead tracking — app deployment handoff

Measurement ID: **G-RNDML9B5GJ**. Designer changes are implemented in this commit; the separate app shell/backend and GA property are outside this repository.

## Designer implementation (ready)

- index.html and rebuilt handoff/dist/index.html install the Google tag in head once. The config sends the initial page view (the designer is a single-page app; individual option-tab changes do not create extra page views). Cross-domain linker includes capefearshed.com and app.capefearshed.com.
- GA page_location includes only known marketing query keys; edit/render/auth tokens and fragments are omitted. page_referrer is origin-only. This is deliberate: the app opens authenticated owner-design links in the same designer.
- src/leadAnalytics.js captures first-touch attribution into sessionStorage key cfs-designer-attribution-v1. Keys: gclid, gbraid, wbraid, utm_source, utm_medium, utm_campaign, utm_term; existing utm_content/fbclid/referrer retained too. tracking.landingPageUrl records the first landing URL for INTERNAL lead storage, not a custom GA event field. Existing values persist through reloads and screen changes; missing fields can fill on a later tagged navigation. Storage denial does not stop submission.
- tracking is included in the saved submission body alongside source {code,other,referredBy}. Owner edits preserve loaded.design.tracking and do not capture the owner's edit URL as the customer's landing page.
- submitDesign emits design_submitted only after validation and the successful server response. Parameters are exactly shed_size (e.g. 10x16) and heard_about_us (the selected code, e.g. google/referral/other). No contact fields, quote numbers, tokens, landing URL, referral names or free-text answers are sent as event parameters. No conversion for owner edits, render-only work, local stubs, drafts, photo retries or failed submissions. Duplicate confirmations of the same saved quote are suppressed within the session. GA errors do not block a saved lead.
- Add ga_debug=1 to a test URL to set debug_mode on config and the submission event. Do not enable debug globally.

## Required app-side work (Claude)

1. Deploy this handoff/dist into the app's existing /design/ directory, retaining all latest owner-edit/quote-sync source behavior. Do not roll back to an older designer build.
2. Add the tag below ONCE to the shared HTML head used by ALL app pages outside /design/ too (including their document shells). The standalone designer already has its tag; do not inject a second copy into that document. Preserve the app's CSP/nonces if required. Use the same measurement ID. Where the main app uses customer names in document titles or private identifiers in paths, supply safe generic titles/route templates rather than sending those values to GA.
3. Preserve the entire incoming tracking object in each saved lead/design and expose click/UTM fields plus landingPageUrl alongside the source answer in the admin lead/quote and lead email. Do not drop gbraid or wbraid when mapping the old tracking schema. Persist through quote updates; do not replace original attribution with an owner's edit session.
4. Do NOT add a duplicate server-side design_submitted event or fire it on button clicks. The designer already sends it after save confirmation.
5. In the GA property, mark design_submitted as a key event (conversion). This property configuration cannot be performed by publishing frontend code alone. Custom dimensions for shed_size/heard_about_us are optional for reports; DebugView shows event parameters without that extra configuration.

### Head tag used by the designer

```html
<!-- Google Analytics: one initial page view; no contact data or edit-link tokens. -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-RNDML9B5GJ"></script>
<script>
 window.dataLayer = window.dataLayer || [];
 function gtag(){window.dataLayer.push(arguments);}
 gtag('js', new Date());
 (function(){
  var current = new URL(window.location.href);
  var page = new URL(current.origin + current.pathname);
  ['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid'].forEach(function(key){
   if(current.searchParams.has(key))page.searchParams.set(key,current.searchParams.get(key));
  });
  var config = {linker:{domains:['capefearshed.com','app.capefearshed.com']},page_location:page.href,page_referrer:document.referrer ? new URL(document.referrer).origin : '',page_title:'Cape Fear Shed | 3D Shed Designer'};
  if(current.searchParams.get('ga_debug') === '1')config.debug_mode = true;
  gtag('config','G-RNDML9B5GJ',config);
 })();
</script>
```

## Exact live acceptance test after deployment

1. Start a fresh session at https://app.capefearshed.com/design/?gclid=TEST123&utm_source=google&ga_debug=1. Use the app's existing test-account procedure; do not send customer messages. Make a valid design and choose a source answer. Use synthetic test contact data.
2. Complete the normal Send flow. Verify a successful server save, then one design_submitted event with the correct shed_size and coded heard_about_us in GA Admin → DebugView (or Realtime). Verify failure does not emit and owner Save changes does not increment leads. Save still succeeds with Analytics blocked.
3. Inspect the RECEIVED saved lead/admin/email, not only the browser payload. Confirm tracking.gclid=TEST123, tracking.utm_source=google, tracking.landingPageUrl includes the original landing URL and source still matches the chosen answer. Also spot-check gbraid/wbraid from a separate test URL.
4. Check one app page outside /design/ for the same tag, and check developer tools for no duplicate tag/config. Confirm cross-domain navigation uses the same property.

## What was verified here

153 automated tests pass and build:handoff passes. New tests exercise all attribution keys and persistence, restricted storage, PII-free event allowlist, deduplication, owner/stub exclusions, head/linker config and token redaction, and the full submitDesign API boundary with success and HTTP-failure fetch fixtures. TEST123 and google are present in the serialized submission fixture; event appears only after a mocked successful response. No real lead was created and no paid image generation was run.

## Live limitations (not completed)

Vercel lists the cape-fear-shed app (prj_aPB8Le65sebkgahmjgHcfhvSmdq9, team_jOYEhIgxgvxh4qDuyeERyelp) but project detail returns 404 and deployments return 403 permission denied. No Vercel CLI is installed. The GitHub connection exposes only the designer repository, not the separately maintained app shell/backend. The currently served app root HTML was inspected and did not contain this Google tag. No authenticated GA property/report access is available to verify DebugView/Realtime or mark the key event. Publishing this repo must NOT be reported as completing app-wide deployment or live lead receipt verification. Claude's app deployment plus the above acceptance checks are still required.
