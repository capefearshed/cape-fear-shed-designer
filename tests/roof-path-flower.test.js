import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {flowerBoxGroupY,FLOWER_BOX_TOP_OFFSET_FT,FLOWER_BOX_GAP_IN} from '../src/flowerBox.js';
const base={roofStyle:'lean-to',roofHighWall:'back',foundation:'framed',openings:[{id:'door',kind:'door',type:'double',wall:'front',ramp:false},{id:'window',kind:'window',wall:'front',flowerBox:true}]};
test('lean-to is one plane with no ridge in both orientations, gable keeps its roof',()=>{
 for(const roofHighWall of ['front','back']){
  const design={...base,roofHighWall},spec=photoSpecification(design),prompt=buildPhotoPrompt(design,{visibleWalls:['front','right']});
  assert.equal(spec.roof.planeCount,1);assert.equal(spec.roof.ridge,false);assert.equal(spec.roof.highWall,roofHighWall);
  assert.match(prompt,/No ridge, small front gable/);assert.match(prompt,/single constant slope/);
 }
 assert.doesNotMatch(buildPhotoPrompt({...base,roofStyle:'gable'}),/LEAN-TO ROOF GEOMETRY LOCK/);
});
test('unselected ramp leaves flat ground and visible threshold on framed and slab sheds',()=>{
 for(const foundation of ['framed','slab']){
  const design={...base,foundation},prompt=buildPhotoPrompt(design,{visibleWalls:['front','right']});
  assert.doesNotMatch(prompt,/Path must meet the bottom of the ramp/);
  assert.match(photoSpecification(design).approach,/path stays flat/);
  assert.match(prompt,foundation==='slab'?/Leave the threshold height difference visible/:/Never raise, slope, bank or wedge the path/);
 }
});
test('selected ramp remains reference material; flat path meets only its bottom',()=>{
 const design={...base,openings:[{...base.openings[0],ramp:true}]};
 assert.match(buildPhotoPrompt(design,{visibleWalls:['front','right']}),/Do not turn the selected ramp into a paved pathway/);
 assert.match(buildPhotoPrompt(design,{visibleWalls:['front','right']}),/Path must meet the bottom of the ramp/);
 assert.doesNotMatch(buildPhotoPrompt(design,{visibleWalls:['back','left']}),/SELECTED RAMP ONLY/);
});
test('flower box top clears actual sill bottom by one inch in geometry and visible photo facts',()=>{
 const sillBottom=-(27.375/2+3.5)/12;
 const boxTop=flowerBoxGroupY(sillBottom)+FLOWER_BOX_TOP_OFFSET_FT;
 assert(Math.abs((sillBottom-boxTop)*12-1)<1e-10);assert.equal(FLOWER_BOX_GAP_IN,1);
 const spec=photoSpecification(base);assert.equal(spec.openings[1].flowerBoxPlacement.gapBelowBottomWindowTrimIn,1);
 assert.match(buildPhotoPrompt(base,{visibleWalls:['front','right']}),/TOP RIM must sit exactly 1 inch BELOW the BOTTOM EDGE/);
 assert.doesNotMatch(buildPhotoPrompt(base,{visibleWalls:['back','left']}),/FLOWER BOX PLACEMENT/);
 assert.equal(photoSpecification({...base,openings:[{...base.openings[1],flowerBox:false}]}).openings[0].flowerBoxPlacement,undefined);
});
