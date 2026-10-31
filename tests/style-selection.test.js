import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {modelDesign} from '../src/modelBridge.js';
import {styleUnavailableReason,withShedStyle} from '../src/styleRules.js';
const c=await getCatalog();
test('lean-to and dormer are selectable and retain their quote style codes',()=>{
 const s=sampleStates(c)[1];
 const lean=withShedStyle(c,s,'style-lean-to');
 assert.equal(buildDesign(c,lean).shed.style,'style-lean-to');assert.equal(modelDesign(c,lean).roofStyle,'lean-to');
 for(const [length,code] of [[10,'dormer-6'],[12,'dormer-6'],[14,'dormer-8'],[16,'dormer-8'],[18,'dormer-10'],[20,'dormer-10']]){
  const next=withShedStyle(c,{...s,shed:{...s.shed,width:10,length,size:`size-10x${length}`}},'style-gable-dormer');
  const d=buildDesign(c,next);assert.equal(d.elements.find(e=>e.code===code).wall,'front');assert.equal(d.shed.roofPitch,7);assert.equal(modelDesign(c,next).pitch,7);assert.equal(modelDesign(c,next).dormer,true);
 }
});
test('style size limits and dormer shingle requirement remain consistent',()=>{
 const s=sampleStates(c)[1];
 for(const length of [8,22,24])assert.match(styleUnavailableReason(c,{...s.shed,length},'style-gable-dormer'),/length/);
 assert.match(styleUnavailableReason(c,{...s.shed,width:8},'style-gable-dormer'),/width/);
 assert.match(styleUnavailableReason(c,{...s.shed,width:14},'style-lean-to'),/wide/);
 const metal={...s,shed:{...s.shed,roofing:'roof-metal'},colors:{...s.colors,roof:c.colors.metal[0]}};
 const dormer=withShedStyle(c,metal,'style-gable-dormer');
 assert.equal(dormer.shed.roofing,'roof-shingle');assert.equal(dormer.colors.roof.name,c.colors.roof[0].name);
 assert.throws(()=>buildDesign(c,{...dormer,shed:{...dormer.shed,roofing:'roof-metal'}}),/shingles/);
});
test('lean-to exports angle instead of pitch, gable pitches round-trip through styles',()=>{
 const s=sampleStates(c)[1];s.shed.roofPitch=8;
 const lean=withShedStyle(c,s,'style-lean-to'),data=buildDesign(c,lean);
 assert.equal(data.shed.roofAngle,10);assert.ok(!('roofPitch' in data.shed));
 assert.equal(withShedStyle(c,withShedStyle(c,s,'style-gable-dormer'),'style-gable').shed.roofPitch,8);
});
test('morning roll-up and residential rules read requires metadata, including structural gable with dormer',async()=>{
 const {openingAllowed}=await import('../src/catalogLayout.js');
 const shed={...sampleStates(c)[1].shed,width:10,wallHeight:'wall-7'};
 const rollup=c.options.find(o=>o.code==='door-rollup-6x7');
 assert.equal(openingAllowed(c,shed,rollup,'left'),true);
 assert.equal(openingAllowed(c,{...shed,style:'style-gable-dormer'},rollup,'right'),true);
 for(const patch of [{width:8},{wallHeight:'wall-6-6'},{style:'style-lean-to'}])assert.equal(openingAllowed(c,{...shed,...patch},rollup,'left'),false);
 assert.equal(openingAllowed(c,shed,rollup,'front'),false);
 for(const code of ['door-36-residential','door-french-72x80','door-sliding-6']){
  const option=c.options.find(o=>o.code===code);
  assert.equal(openingAllowed(c,shed,option,'front'),false);assert.equal(openingAllowed(c,{...shed,wallHeight:'wall-8'},option,'front'),true);
 }
});
