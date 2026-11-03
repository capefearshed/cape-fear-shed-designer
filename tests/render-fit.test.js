import fixtureCatalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {buildDesign} from '../src/designContract.js';
import {sampleStates} from '../src/sampleStates.js';
import {fitSavedDesign} from '../src/renderFit.js';
import {validPlacement} from '../src/catalogLayout.js';
const catalog=applyApprovedColors(structuredClone(fixtureCatalog));
function saved(){const state=sampleStates(catalog)[1];return {state,design:buildDesign(catalog,state)};}
test('12x16 to 12x12 keeps relative opening positions and returns the actual fitted contract',()=>{
 const {state,design}=saved();design.shed.length=12;design.shed.size='size-12x12';
 const result=fitSavedDesign(catalog,design,state);assert.deepEqual(result.conflicts,[]);
 assert.equal(result.state.placed[0].x,72);assert.equal(result.state.placed[1].x,72);
 assert.deepEqual(result.state.placed.map(p=>[p.id,p.wall,p.code]),state.placed.map(p=>[p.id,p.wall,p.code]));
 assert.equal(validPlacement(catalog,result.state.shed,result.state.placed),true);
 const body=buildDesign(catalog,result.state);assert.equal(body.shed.length,12);assert.equal(body.elements[0].x,72);assert.equal(body.editorState.state.placed[0].x,72);
});
test('constrained shrinking preserves order and corner/gap clearance, never drops an opening',()=>{
 const {state,design}=saved();
 state.placed=[{id:'a',code:'window-18x27',wall:'front',x:30,y:40,shutters:true},{id:'b',code:'window-18x27',wall:'front',x:100,y:40},{id:'c',code:'window-18x27',wall:'front',x:162,y:40}];
 const changed=buildDesign(catalog,state);changed.shed.length=12;
 const result=fitSavedDesign(catalog,changed,state);assert.deepEqual(result.conflicts,[]);assert.equal(result.state.placed.length,3);assert.ok(result.state.placed[0].x<result.state.placed[1].x&&result.state.placed[1].x<result.state.placed[2].x);assert.ok(validPlacement(catalog,result.state.shed,result.state.placed));
 changed.shed.width=4;changed.shed.length=6;
 const failure=fitSavedDesign(catalog,changed,state);assert.equal(failure.state,undefined);assert.deepEqual(failure.conflicts.map(c=>c.id),['a','b','c']);assert.ok(failure.conflicts.every(c=>c.wall==='front'&&c.reason.includes('no longer fit')));
});
test('roll-up wall/height restrictions and unavailable dormers return conflicts',()=>{
 const {state}=saved();state.shed.wallHeight='wall-8';
 const roll=catalog.options.find(o=>/rollup/.test(o.code));assert.ok(roll);
 state.placed=[{id:'roll',code:roll.code,wall:'left',x:72,y:0,rampRemoved:true}];
 const design=buildDesign(catalog,state);design.shed.wallHeight='wall-6-6';
 const failed=fitSavedDesign(catalog,design,state);assert.ok(failed.conflicts.some(c=>c.id==='roll'&&c.wall==='left'));
 state.shed.style='style-gable-dormer';state.shed.roofPitch=7;
 const dormer=buildDesign(catalog,state);dormer.shed.length=24;
 assert.ok(fitSavedDesign(catalog,dormer,state).conflicts.some(c=>c.reason.includes('dormer')));
});
test('quote colors/styles win over opaque snapshot while explicit door overrides survive',()=>{
 const {state}=saved();state.backyardSetting='lawn';state.shed.wallHeight='wall-8';state.placed[0].code='door-french-72x80';
 const original=buildDesign(catalog,state);const updated=structuredClone(original);updated.colors.trim=catalog.colors.trim.find(c=>c.name==='Tricorn Black');updated.colors.siding=catalog.colors.siding[2];updated.shed.siding='siding-lp-lap';
 const result=fitSavedDesign(catalog,updated,state);assert.deepEqual(result.conflicts,[]);
 assert.equal(result.state.shed.siding,'siding-lp-lap');assert.equal(result.state.backyardSetting,'lawn');assert.equal(result.state.placed[0].color,null);
 assert.equal(buildDesign(catalog,result.state).elements.find(e=>e.id==='door-1').color.name,'Tricorn Black');
 state.placed[0].color=state.colors.siding;
 const explicit=buildDesign(catalog,state);explicit.colors.siding=catalog.colors.siding[3];
 const explicitResult=fitSavedDesign(catalog,explicit,state);assert.deepEqual(explicitResult.state.placed[0].color,state.colors.siding);
});
test('legacy missing baseline, missing openings, and incompatible roofing fail without a submit state',()=>{
 const {state,design}=saved();delete design.editorState;
 assert.ok(fitSavedDesign(catalog,design).conflicts[0].reason.includes('older design'));
 design.elements=design.elements.filter(e=>e.id!=='window-1');assert.ok(fitSavedDesign(catalog,design,state).conflicts.some(c=>c.id==='window-1'));
 const changed=buildDesign(catalog,state);changed.shed.style='style-gable-dormer';changed.shed.roofing='roof-metal';
 assert.ok(fitSavedDesign(catalog,changed,state).conflicts.some(c=>c.reason.includes('shingles')));
});
test('interior capacity conflicts preserve racks and double loft rather than silently reducing quantities',()=>{
 const {state}=saved();state.extras=[{code:'surf-rack',qty:3,wall:'back',dowel:24}];
 const design=buildDesign(catalog,state);design.shed.width=8;design.shed.length=8;
 assert.ok(fitSavedDesign(catalog,design,state).conflicts.some(c=>c.reason.includes('surf racks')));
 state.extras=[{code:'loft-45',qty:2,wall:'left'}];const loft=buildDesign(catalog,state);loft.shed.width=8;loft.shed.length=8;
 assert.ok(fitSavedDesign(catalog,loft,state).conflicts.some(c=>c.reason.includes('lofts')));
});
test('Edit design uses the latest quote fields and retains invalid openings for manual repair',async()=>{
 const {editableSavedDesign}=await import('../src/editableSavedDesign.js');
 const {state,design}=saved();
 assert.deepEqual(editableSavedDesign(catalog,{design,editorState:state}).state,state);
 design.shed.length=12;design.shed.size='size-12x12';
 const fitted=editableSavedDesign(catalog,{design,editorState:state});assert.equal(fitted.state.shed.length,12);assert.equal(fitted.state.placed[0].x,72);
 design.shed.width=4;design.shed.length=6;design.shed.size='size-4x6';
 const manual=editableSavedDesign(catalog,{design,editorState:state});assert.equal(manual.state.shed.length,6);assert.equal(manual.state.placed.length,state.placed.length);assert.ok(manual.conflicts.length);
});
