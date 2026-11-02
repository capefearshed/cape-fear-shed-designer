import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign,resolvedDoorColor} from '../src/designContract.js';
import {modelDesign} from '../src/modelBridge.js';
import {leanTopAt} from '../src/leanDirection.js';
import {rollupHoles} from '../src/wallCutout.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const catalog=await getCatalog();
test('reversed lean slope persists to quote/model/spec without relocating openings',()=>{
 const state=sampleStates(catalog)[0];state.shed.style='style-lean-to';state.shed.roofHighWall='back';
 const before=structuredClone(state.placed),quote=buildDesign(catalog,state),model=modelDesign(catalog,state);
 assert.equal(quote.shed.roofHighWall,'back');assert.equal(model.roofHighWall,'back');assert.deepEqual(state.placed,before);
 assert.ok(leanTopAt(-4,8,7,'back')>leanTopAt(4,8,7,'back'));
 assert.equal(leanTopAt(-4,8,7,'front'),7);assert.equal(photoSpecification(model).roof.highWall,'back');
});
test('double loft is two distinct end-wall items with exactly one free loft',()=>{
 const state=sampleStates(catalog)[0];state.extras=[{code:'loft-45',qty:2,wall:'left'}];
 const items=buildDesign(catalog,state).elements.filter(e=>e.code==='loft-45');
 assert.deepEqual(items.map(e=>e.wall),['left','right']);assert.ok(items.every(e=>e.qty===1));assert.equal(items.filter(e=>e.free).length,1);assert.equal(modelDesign(catalog,state).accessories.doubleLoft,true);
 state.shed.length=8;state.shed.size='size-8x8';assert.throws(()=>buildDesign(catalog,state),/at least 10 feet/);
});
test('residential default stays white, French/roll-up follow selected trim and overrides survive',()=>{
 const state=sampleStates(catalog)[0];state.colors.trim=catalog.colors.trim.find(c=>c.name==='Tricorn Black');
 for(const code of ['door-french-72x80','door-rollup-6x7'])assert.equal(resolvedDoorColor(catalog,state,{}, {code}).hex,state.colors.trim.hex);
 assert.equal(resolvedDoorColor(catalog,state,{}, {code:'door-36-residential'}).name,'Snowscape');
 assert.equal(resolvedDoorColor(catalog,state,{color:state.colors.siding},{code:'door-french-72x80'}).hex,state.colors.siding.hex);
});
test('batten clearance encloses casing but backing cut remains opening size',()=>{
 const openings=[{type:'rollup',wall:'left',x:60,width:72,height:84}];
 const backing=rollupHoles(openings,'left',10)[0],battens=rollupHoles(openings,'left',10,1.5/12,3.5/12+.005)[0];
 assert.equal(backing.right-backing.left,6);assert.ok(battens.left<backing.left-3.5/12);assert.ok(battens.top>backing.top+3.5/12);
});
test('rollup case locks blank walls and opposite-gable window without wood-door instructions',()=>{
 const design={openings:[{id:'roll',kind:'door',type:'rollup',wall:'left',width:72,height:84,x:60},{id:'window',kind:'window',type:'standard',wall:'right',x:60}],foundation:'slab'};
 const facts=photoSpecification(design),prompt=buildPhotoPrompt(design);
 assert.equal(facts.wallOpenings.left.doorCount,1);assert.equal(facts.wallOpenings.left.windowCount,0);assert.equal(facts.wallOpenings.front.windowCount,0);assert.equal(facts.wallOpenings.back.doorCount,0);assert.equal(facts.wallOpenings.right.windowCount,1);
 assert.ok(!prompt.includes('WOOD SHED DOORS ONLY'));assert.ok(!prompt.includes('black strap hinges'));assert.match(prompt,/never invent a companion door/);assert.match(prompt,/WALL INVENTORY IS EXHAUSTIVE/);
 assert.match(buildPhotoPrompt({...design,openings:[...design.openings,{kind:'door',type:'double',wall:'front'}]}),/WOOD SHED DOORS ONLY/);
});
