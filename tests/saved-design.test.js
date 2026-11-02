import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,loadOwnerDesign,API_BASE,submitDesign} from '../src/api.js';
import {buildDesign} from '../src/designContract.js';
import {restoreDesign,savedContact,EXPIRED_LINK} from '../src/savedDesign.js';
import {editorSnapshot} from '../src/editorSnapshot.js';
import {sampleStates} from '../src/sampleStates.js';
const catalog=await getCatalog();
test('opaque snapshot restores every editor field, without moving openings or mutating source',()=>{
 for(const state of sampleStates(catalog)){
  state.backyardSetting='lawn';state.gablePitch=7;
  state.placed[0].color=state.colors.siding;state.placed[0].alignment='center';
  state.extras.push({code:'workbench-18',qty:2,wall:'left'});
  const design=buildDesign(catalog,state);const before=JSON.stringify(design);
  const restored=restoreDesign(catalog,design,design.editorState);
  assert.deepEqual(restored,state);assert.equal(JSON.stringify(design),before);
  restored.shed.width=999;assert.notEqual(design.editorState.state.shed.width,999);
 }
 assert.throws(()=>editorSnapshot({padding:'a'.repeat(100001)}),/100 KB/);
});
test('legacy contract restores ramps, windows, paint, double interiors and dowels',()=>{
 const state=sampleStates(catalog)[1];state.extras.push({code:'workbench-18',qty:2});
 state.placed[1].flowerBox=true;state.colors.window={name:'Black',hex:'#111111'};
 const design=buildDesign(catalog,state);delete design.editorState;
 const restored=restoreDesign(catalog,design);
 const roundtrip=buildDesign(catalog,restored);
 assert.deepEqual(roundtrip.elements,design.elements);
 assert.deepEqual(roundtrip.shed,design.shed);
 assert.deepEqual(roundtrip.colors,design.colors);
});
test('invalid saved placements fail visibly rather than silently replacing the customer design',()=>{
 const state=sampleStates(catalog)[0];state.placed[0].x=0;
 assert.throws(()=>restoreDesign(catalog,buildDesign(catalog,state),state),/do not fit/);
});
test('contact response prefills editable fields and preserves additional use/source answers',()=>{
 const design={customer:{address:{state:'NC'},notes:'old'},uses:['use-other'],usesOther:'studio',source:{code:'other',other:'event'}};
 const result=savedContact(design,{firstName:'Test',street:'123 Main',source:'referral',referredBy:'Neighbor',use:['use-yard'],notes:'Updated'});
 assert.equal(result.customer.firstName,'Test');assert.equal(result.customer.address.street,'123 Main');assert.equal(result.customer.address.state,'NC');assert.equal(result.customer.notes,'Updated');assert.deepEqual(result.uses,['use-yard']);assert.equal(result.source.referredBy,'Neighbor');
});
test('owner load passes edit token unchanged and exposes 401 expiry',async()=>{
 const original=globalThis.fetch;let requested;
 try{
  globalThis.fetch=async(url)=>{requested=url;return {ok:true,json:async()=>({mode:'owner-edit',quoteNumber:'Q-1'})};};
  assert.equal((await loadOwnerDesign('opaque+token&value')).quoteNumber,'Q-1');
  assert.equal(new URL(requested,'https://example.com').searchParams.get('edit'),'opaque+token&value');
  assert.ok(requested.startsWith(API_BASE+'/api/form?designer=load&'));
  globalThis.fetch=async()=>({ok:false,status:401});
  await assert.rejects(loadOwnerDesign('expired'),{message:EXPIRED_LINK});
 }finally{globalThis.fetch=original;}
});
