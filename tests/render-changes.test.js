import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,loadOwnerDesign,submitDesign,SEND_ERROR} from '../src/api.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {applyRenderChanges} from '../src/renderChanges.js';
import {restoreDesign,savedContact} from '../src/savedDesign.js';
const catalog=await getCatalog();
function fixture(){const state=sampleStates(catalog)[1];state.backyardSetting='lawn';const design=buildDesign(catalog,state,{uses:['use-yard'],usesOther:'',source:{code:'referral',other:'',referredBy:'Neighbor'}});return {mode:'owner-render',design,editorState:design.editorState};}
test('published editorState wrapper restores full state and form selections',()=>{
 const response=fixture();
 assert.deepEqual(restoreDesign(catalog,response.design,response.editorState),response.editorState.state);
 const contact=savedContact({...response.design,uses:undefined,source:undefined},{source:{code:'referral',other:'',referredBy:'Updated'},notes:'Owner note'},response.editorState);
 assert.deepEqual(contact.uses,['use-yard']);assert.equal(contact.source.referredBy,'Updated');assert.equal(contact.customer.notes,'Owner note');
});
test('changes catalog codes apply to wrapped state without app-side geometry mutation',()=>{
 const response=fixture(),before=JSON.stringify(response);
 const color=catalog.colors.siding.find(c=>c.code);
 const result=applyRenderChanges(catalog,{...response,changes:{size:'size-12x12',wallHeight:'wall-8',siding:'siding-lp-lap',roofing:'roof-shingle',colors:{siding:color.code,trim:catalog.colors.trim[1],roof:'Onyx Black'}}});
 assert.deepEqual(result.conflicts,[]);assert.equal(result.state.shed.length,12);assert.equal(result.state.shed.wallHeight,'wall-8');assert.equal(result.state.shed.siding,'siding-lp-lap');assert.equal(result.state.colors.siding.code,color.code);assert.equal(result.state.placed[0].x,72);assert.equal(result.state.backyardSetting,'lawn');assert.equal(JSON.stringify(response),before);
});
test('dormer toggle follows normal style rules and invalid sizes or roofing produce conflicts',()=>{
 const response=fixture();
 const enabled=applyRenderChanges(catalog,{...response,changes:{dormer:true}});assert.equal(enabled.state.shed.style,'style-gable-dormer');
 const dormerDesign=buildDesign(catalog,enabled.state);
 const disabled=applyRenderChanges(catalog,{design:dormerDesign,editorState:dormerDesign.editorState,changes:{dormer:false}});assert.equal(disabled.state.shed.style,'style-gable');assert.equal(disabled.state.shed.roofPitch,5);
 const failed=applyRenderChanges(catalog,{...response,changes:{size:'size-12x24',dormer:true}});assert.equal(failed.state,undefined);assert.ok(failed.conflicts.some(c=>c.reason.includes('dormer')));
 const metal=applyRenderChanges(catalog,{...response,changes:{dormer:true,roofing:'roof-metal'}});assert.equal(metal.state,undefined);assert.ok(metal.conflicts.some(c=>c.reason.includes('shingles')));
});
test('legacy null editorState can reconstruct the original contract before applying explicit changes',()=>{
 const response=fixture();delete response.design.editorState;
 const result=applyRenderChanges(catalog,{...response,editorState:null,changes:{size:'size-12x12'}});
 assert.deepEqual(result.conflicts,[]);assert.equal(result.state.placed[0].x,72);assert.equal(result.state.placed.length,3);
 const restored=restoreDesign(catalog,response.design,null);assert.deepEqual(buildDesign(catalog,restored).elements,response.design.elements);
});
test('unknown change fields and invalid catalog choices cannot quietly succeed',()=>{
 for(const changes of [{size:'size-missing'},{wallHeight:'roof-metal'},{unexpected:true},{dormer:'yes'},{colors:{siding:'unknown-color'}}]){
  const result=applyRenderChanges(catalog,{...fixture(),changes});assert.equal(result.state,undefined);assert.ok(result.conflicts[0].reason);
 }
});
test('owner load and submit preserve 409 app explanations; customer errors retain original wording',async()=>{
 const original=globalThis.fetch;
 const message='Approved quotes cannot be edited.';
 globalThis.fetch=async()=>({ok:false,status:409,json:async()=>({error:'quote_locked',message})});
 const images=['render','front','left','back','right','elev-front','elev-left','elev-back','elev-right'].map((view,i)=>({view,type:'image/jpeg',data:'data:image/jpeg;base64,/9j/',...(i===0?{source:'auto'}:{}),...(i>4?{hidden:true,pxPerFt:42,groundY:760}:{})}));
 const body={images,customer:{firstName:'Test',lastName:'Customer',phone:'9105550100',email:'sample@example.com',address:{street:'123 Test',city:'Wilmington',zip:'28403'}}};
 try{
  await assert.rejects(loadOwnerDesign('owner-token'),{message});
  await assert.rejects(submitDesign({...body,editToken:'owner-token'}),{message});
  await assert.rejects(submitDesign(body),{message:SEND_ERROR});
 }finally{globalThis.fetch=original;}
});
