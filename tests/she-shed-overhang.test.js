import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {modelDesign} from '../src/modelBridge.js';
import {buildDesign} from '../src/designContract.js';
import {restoreDesign} from '../src/savedDesign.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {SHE_SHED_OVERHANG,sheShedTrimBoards} from '../src/sheShedOverhang.js';

test('overhang is opt-in and survives saved contracts and editor snapshots',()=>{
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];
 assert.equal(modelDesign(c,state).sheShedOverhang,false);
 state.extras.push({code:SHE_SHED_OVERHANG,qty:1});
 const design=buildDesign(c,state),element=design.elements.find(e=>e.code===SHE_SHED_OVERHANG);
 assert.equal(element.qty,1);assert.equal(element.wall,undefined);
 for(const restored of [restoreDesign(c,design),restoreDesign(c,design,design.editorState)])assert.equal(modelDesign(c,restored).sheShedOverhang,true);
 const model=modelDesign(c,state),spec=photoSpecification(model);
 assert.equal(spec.roof.edgeTrim.thicknessIn,.75);assert.equal(spec.roof.edgeTrim.faceHeightIn,3.5);
 assert.equal(spec.colors.trim,model.trim.toUpperCase());
});
test('vertical trim closes all four edges with exact 3/4 thickness and 3 1/2 face height',()=>{
 for(const lean of [false,true])for(const pitch of [5,7,8]){
  const boards=sheShedTrimBoards({w:10,l:16,wall:7,pitch,lean});
  assert.equal(boards.length,lean?4:6);
  assert.equal(boards.filter(b=>b.axis==='z').length,2);
  for(const b of boards){
   assert.equal(b.thickness,.75/12);
   assert.ok(Math.abs(b.outline[0][1]-b.outline[3][1]-3.5/12)<1e-10);
   assert.ok(Math.abs(b.outline[1][1]-b.outline[2][1]-3.5/12)<1e-10);
   assert.ok(Number.isFinite(b.plane));
  }
 }
});
