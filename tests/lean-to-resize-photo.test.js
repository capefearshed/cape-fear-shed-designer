import test from 'node:test';
import assert from 'node:assert/strict';
import raw from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {editableSavedDesign} from '../src/editableSavedDesign.js';
import {applyRenderChanges} from '../src/renderChanges.js';
import {redistributeOpenings} from '../src/catalogLayout.js';
import {modelDesign} from '../src/modelBridge.js';
import {backyardPhotoRequest} from '../src/api.js';
import {submitRenderedDesign} from '../src/renderSubmission.js';
import {submitOwnerDesign} from '../src/ownerSubmission.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const catalog=applyApprovedColors(structuredClone(raw));
for(const highWall of ['front','back'])for(const route of ['edit','render'])test(`8x12 to 8x10 ${route} retains lean-to roof and ${highWall} high wall through photo handoff`,async()=>{
 const original=sampleStates(catalog)[0];
 Object.assign(original.shed,{style:'style-lean-to',roofHighWall:highWall});
 original.placed=[{id:'door-1',code:'door-4-double',wall:'front',x:40,y:0,rampRemoved:true},{id:'window-1',code:'window-18x27',wall:'front',x:100,y:40,flowerBox:true},{id:'window-2',code:'window-18x27',wall:'right',x:48,y:40}];
 const design=buildDesign(catalog,original),before=JSON.stringify(design);
 const response={mode:'owner-edit',design,editorState:design.editorState,quoteNumber:'resize-regression'};
 let state;
 if(route==='edit'){
  state=editableSavedDesign(catalog,response).state;
  const size=catalog.sizes.find(s=>s.code==='size-8x10');Object.assign(state.shed,{size:size.code,width:size.width,length:size.length});
  // Normal editor changes fit the opening positions before saving.
  state.placed=redistributeOpenings(catalog,state.shed,state.placed);assert(state.placed);
 }else{
  const fitted=applyRenderChanges(catalog,{...response,changes:{size:'size-8x10'}});assert.deepEqual(fitted.conflicts,[]);state=fitted.state;
 }
 const model=modelDesign(catalog,state),events=[];
 const submit=async body=>{
  events.push('save');assert.equal(body.shed.style,'style-lean-to');assert.equal(body.shed.width,8);assert.equal(body.shed.length,10);assert.equal(body.shed.roofHighWall,highWall);
  assert.equal(body.editorState.state.shed.style,'style-lean-to');assert.equal(body.editorState.state.shed.length,10);
  return {ok:true,photo:{id:'existing-job',token:'job-token'}};
 };
 const photo=async(job,request)=>{
  events.push('photo');assert.equal(job.id,'existing-job');assert.equal(request.design.width,8);assert.equal(request.design.length,10);assert.equal(request.design.roofStyle,'lean-to');assert.equal(request.design.roofHighWall,highWall);
  const prompt=buildPhotoPrompt(request.design,{visibleWalls:['front','right']});assert.match(prompt,/LEAN-TO ROOF GEOMETRY LOCK/);assert.match(prompt,/Exactly ONE uninterrupted planar roof/);
  assert.equal(request.design.renderingConstraints.specification.roof.style,'lean-to');assert.equal(request.design.renderingConstraints.specification.roof.ridge,false);
  return {status:'working'};
 };
 const signal=new AbortController().signal;
 if(route==='edit')await submitOwnerDesign({...buildDesign(catalog,state),editToken:'test-token'},{photoRequest:backyardPhotoRequest('reference',model),signal},{submit,photo});
 else await submitRenderedDesign({catalog,loaded:{...response,state},token:'test-token',viewer:{captureSubmission:async()=>[],capture:()=>({image:'reference'})},model,signal},{submit,photo});
 assert.deepEqual(events,['save','photo']);assert.equal(JSON.stringify(design),before);
});
