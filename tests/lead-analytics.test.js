import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {captureSessionAttribution,trackDesignSubmitted,ATTRIBUTION_KEY} from '../src/leadAnalytics.js';
import {submitDesign} from '../src/api.js';
const storage=()=>{const entries=new Map();return {getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};};
test('first-touch attribution survives screen changes and reloads, including all three click IDs',()=>{
 const session=storage(),url='https://app.capefearshed.com/design/?gclid=TEST123&gbraid=BRAID1&wbraid=BRAID2&utm_source=google&utm_medium=cpc&utm_campaign=sheds&utm_term=custom';
 const first=captureSessionAttribution({url,storage:session,referrer:'https://capefearshed.com/'});
 const later=captureSessionAttribution({url:'https://app.capefearshed.com/design/',storage:session});
 assert.deepEqual(later,first);assert.equal(later.gclid,'TEST123');assert.equal(later.utm_source,'google');assert.equal(later.gbraid,'BRAID1');assert.equal(later.wbraid,'BRAID2');assert.equal(later.landingPageUrl,url);
 const another=captureSessionAttribution({url:'https://app.capefearshed.com/design/?gclid=SECOND&utm_source=facebook',storage:session});assert.equal(another.gclid,'TEST123');assert.equal(another.utm_source,'google');
 assert.deepEqual(JSON.parse(session.getItem(ATTRIBUTION_KEY)),first);
});
test('blocked or corrupt session storage does not block attribution and owner tokens are never saved',()=>{
 const broken={getItem(){throw new Error('denied');},setItem(){throw new Error('denied');}};
 assert.equal(captureSessionAttribution({url:'https://app.capefearshed.com/design/?gclid=TEST123',storage:broken}).gclid,'TEST123');
 const session=storage();session.setItem(ATTRIBUTION_KEY,'broken json');assert.equal(captureSessionAttribution({url:'https://app.capefearshed.com/design/?utm_source=google',storage:session}).utm_source,'google');
 const before=session.getItem(ATTRIBUTION_KEY);assert.deepEqual(captureSessionAttribution({url:'https://app.capefearshed.com/design/?edit=PRIVATE_TOKEN',storage:session}),{});assert.equal(session.getItem(ATTRIBUTION_KEY),before);
});
test('conversion includes only coded source and size, deduplicates confirmations, and excludes owner edits/stubs',()=>{
 const calls=[],session=storage(),target={gtag:(...args)=>calls.push(args),sessionStorage:session,location:{href:'https://app.capefearshed.com/design/?ga_debug=1'}};
 const design={shed:{width:10,length:16},source:{code:'referral',referredBy:'Private Person',other:'Private text'},customer:{firstName:'Private',email:'private@example.com',phone:'9105550100',address:'Private address'}};
 assert.equal(trackDesignSubmitted(design,{ok:false},{target}),false);
 assert.equal(trackDesignSubmitted({...design,editToken:'secret'},{ok:true,quoteNumber:'ga-owner'},{target}),false);
 assert.equal(trackDesignSubmitted(design,{ok:true,stub:true},{target}),false);
 assert.equal(trackDesignSubmitted(design,{ok:true,quoteNumber:'ga-1'},{target}),true);
 assert.deepEqual(calls,[['event','design_submitted',{shed_size:'10x16',heard_about_us:'referral',debug_mode:true}]]);
 assert.equal(trackDesignSubmitted(structuredClone(design),{ok:true,quoteNumber:'ga-1'},{target}),false);
 assert.equal(trackDesignSubmitted(design,{ok:true,quoteNumber:'ga-1'},{target}),false);
 assert.equal(trackDesignSubmitted({...design,source:{code:'private@example.com'}},{ok:true},{target}),false);
 assert.equal(trackDesignSubmitted(design,{ok:true},{target:{gtag(){throw new Error('blocked');}}}),false);
});
test('head installs tag once with linker and first-load page view; auth URLs are stripped from GA config',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.equal(html.split('https://www.googletagmanager.com/gtag/js?id=G-RNDML9B5GJ').length-1,1);
 const script=html.match(/<script>\s*([\s\S]*?)<\/script>/)[1];
 const context={URL,Date,window:{location:{href:'https://app.capefearshed.com/design/?edit=SECRET&gclid=TEST123&ga_debug=1#private'}},document:{referrer:'https://app.capefearshed.com/quote?token=SECRET'}};
 vm.runInNewContext(script,context);
 const config=Array.from(context.window.dataLayer[1]);assert.equal(config[0],'config');assert.equal(config[1],'G-RNDML9B5GJ');
 assert.deepEqual(Array.from(config[2].linker.domains),['capefearshed.com','app.capefearshed.com']);assert.equal(config[2].page_location,'https://app.capefearshed.com/design/?gclid=TEST123');assert.equal(config[2].page_referrer,'https://app.capefearshed.com');assert.equal(config[2].debug_mode,true);
 assert.doesNotMatch(JSON.stringify(context.window.dataLayer),/SECRET|private/);
});
test('real submit API boundary retains TEST123 attribution and emits only after successful server confirmation',async()=>{
 const previousFetch=globalThis.fetch,previousWindow=globalThis.window,events=[],sent=[];
 const session=storage(),tracking=captureSessionAttribution({url:'https://app.capefearshed.com/design/?gclid=TEST123&utm_source=google',storage:session});
 globalThis.window={gtag:(...args)=>events.push(args),sessionStorage:session,location:{href:'https://app.capefearshed.com/design/'}};
 const views=['front','left','back','right','elev-front','elev-left','elev-back','elev-right'];
 const images=[{view:'render',source:'auto',pending:true},...views.map(view=>({view,type:'image/jpeg',data:'data:image/jpeg;base64,/9j/',...(view.startsWith('elev-')?{hidden:true,pxPerFt:40,groundY:750}:{})}))];
 const design={shed:{width:10,length:16},source:{code:'google'},tracking,customer:{firstName:'Test',lastName:'Lead',phone:'910-555-0100',email:'test@example.com',address:{street:'123 Sample Ln',city:'Wilmington',zip:'28403'}},images};
 try{
  globalThis.fetch=async(url,options)=>{assert.equal(events.length,0);sent.push(JSON.parse(options.body));return {ok:false,status:500};};await assert.rejects(submitDesign(design));assert.equal(events.length,0);
  globalThis.fetch=async(url,options)=>{assert.equal(events.length,0);sent.push(JSON.parse(options.body));return {ok:true,json:async()=>({ok:true,quoteNumber:'ga-api-confirmed'})};};
  await submitDesign(design);assert.equal(events.length,1);assert.deepEqual(events[0],['event','design_submitted',{shed_size:'10x16',heard_about_us:'google'}]);
  assert.equal(sent[1].tracking.gclid,'TEST123');assert.equal(sent[1].tracking.utm_source,'google');assert.equal(sent[1].tracking.landingPageUrl,'https://app.capefearshed.com/design/?gclid=TEST123&utm_source=google');assert.equal(sent[1].source.code,'google');
  globalThis.fetch=()=>assert.fail('validation must precede network');await assert.rejects(submitDesign({...design,images:[]}));assert.equal(events.length,1);
 }finally{globalThis.fetch=previousFetch;if(previousWindow===undefined)delete globalThis.window;else globalThis.window=previousWindow;}
});
