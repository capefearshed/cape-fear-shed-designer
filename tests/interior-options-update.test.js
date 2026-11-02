import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {sampleStates} from '../src/sampleStates.js';
import {modelDesign} from '../src/modelBridge.js';
import {buildDesign} from '../src/designContract.js';
import {interiorLayout,openingRects} from '../src/interiorLayout.js';
import {withShedStyle} from '../src/styleRules.js';
import {saveDraft,readDraft} from '../src/draftStorage.js';
const catalog=await getCatalog();
test('double workbench quotes both end walls with one free item and survives draft reload',()=>{
 const state=sampleStates(catalog)[0];state.extras=[{code:'workbench-18',qty:2,wall:'right'}];
 const items=buildDesign(catalog,state).elements.filter(e=>e.code==='workbench-18');
 assert.deepEqual(items.map(e=>e.wall),['left','right']);assert.equal(new Set(items.map(e=>e.id)).size,2);assert.ok(items.every(e=>e.qty===1));assert.equal(items.filter(e=>e.free).length,1);
 const model=modelDesign(catalog,state);assert.equal(model.accessories.doubleWorkbench,true);
 const layout=interiorLayout(model.width,model.length,model.accessories,model.interiorWalls,model.openings);
 assert.equal(layout.workbench.width,1.5);assert.equal(layout.workbench.top,34/12);
 let saved;const storage={setItem:(k,v)=>saved=v,getItem:()=>saved};saveDraft(catalog,state,storage);
 assert.equal(readDraft(catalog,storage).state.extras[0].qty,2);
 state.extras.push({code:'loft-45',qty:2,wall:'left'});assert.equal(buildDesign(catalog,state).elements.filter(e=>e.free).length,1);
});
test('two adjacent surf racks yield eight bars at 12-inch centers on every wall',()=>{
 for(const wall of ['front','back','left','right']){
  const layout=interiorLayout(10,16,{surfRack:true,surfRackCount:2},{surfRack:wall});
  const rack=layout.surfRack;assert.equal(rack.count,8);assert.equal(rack.rails.length,2);assert.equal(rack.railWidth,7.5);
  for(let i=1;i<rack.count;i++)assert.equal(rack.dowels[i]-rack.dowels[i-1],1);
  assert.ok(rack.center-rack.railWidth/2>=-(wall==='front'||wall==='back'?16:10)/2+.4-1e-8);
 }
 const state=sampleStates(catalog)[0];state.extras=[{code:'surf-rack',qty:2,wall:'back',dowel:24}];
 const model=modelDesign(catalog,state);assert.equal(model.accessories.surfRackCount,2);assert.equal(model.dowel,24);
 const item=buildDesign(catalog,state).elements.find(e=>e.code==='surf-rack');assert.equal(item.qty,2);assert.equal(item.wall,'back');assert.equal(item.dowel,24);
});
test('adjacent racks avoid doorways and reject counts that cannot fit without truncating bars',()=>{
 const door={id:'door',kind:'door',wall:'front',x:48,width:36,y:0,height:73.5};
 const rack=interiorLayout(10,16,{surfRackCount:2},{surfRack:'front'},[door]).surfRack,rect=openingRects('front',10,16,[door])[0];
 assert.equal(rack.count,8);assert.ok(rack.center-rack.railWidth/2>=rect.x+rect.width/2+.29);
 const tooSmall=interiorLayout(6,8,{surfRackCount:3},{surfRack:'back'}).surfRack;assert.equal(tooSmall.count,0);
 const state=sampleStates(catalog)[0];state.extras=[{code:'surf-rack',qty:6,wall:'back'}];assert.throws(()=>buildDesign(catalog,state),/uninterrupted wall space/);
 state.extras[0].qty=1.5;assert.throws(()=>buildDesign(catalog,state),/whole number/);
});
test('leaving dormer resets standard gable to 5/12 directly and via lean-to',()=>{
 const state=sampleStates(catalog)[1];state.shed.roofPitch=8;
 const dormer=withShedStyle(catalog,state,'style-gable-dormer');
 for(const next of [withShedStyle(catalog,dormer,'style-gable'),withShedStyle(catalog,withShedStyle(catalog,dormer,'style-lean-to'),'style-gable')]){
  assert.equal(next.shed.roofPitch,5);assert.equal(next.gablePitch,5);assert.equal(modelDesign(catalog,next).pitch,5);assert.equal(buildDesign(catalog,next).shed.roofPitch,5);
 }
 assert.equal(withShedStyle(catalog,withShedStyle(catalog,state,'style-lean-to'),'style-gable').shed.roofPitch,8);
});
