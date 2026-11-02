import test from 'node:test';
import assert from 'node:assert/strict';
import {photoSpecification} from '../src/photoSpecification.js';
import {backyardPhotoRequest} from '../src/api.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const model={width:10,length:12,height:8,paint:'#ffffff',trim:'#ffffff',windowFrameColor:'#202224',sidingType:'lap',roofStyle:'gable',roofMaterial:'shingles',pitch:7,roof:'charcoal',dormer:true,foundation:'framed',openings:[{id:'door',kind:'door',type:'double',wall:'front',x:72,y:0,width:48,height:73.5,transom:true,ramp:true,doorPaint:'#ffffff'},{id:'window',kind:'window',type:'standard',wall:'right',x:60,y:40,width:19.75,height:28.5}]};
test('request describes exact dormer, lap and door transom construction',()=>{
 const r=backyardPhotoRequest('data:image/png;base64,AAAA',model);
 const s=r.design.renderingConstraints.specification;
 assert.equal(s.dormer.windowCount,2);assert.equal(s.dormer.widthFt,6);
 assert.equal(s.roof.eaveAndRakeOverhangIn,6);assert.match(s.siding,/horizontal lap/);
 assert.equal(s.openings[0].transomGrid.panesPerLeaf,3);assert.equal(s.openings[0].transomGrid.horizontalDividers,0);
 assert.equal(s.openings[0].transomGrid.frameColor,'#202224');assert.equal(s.openings[1].wall,'right');
 assert.equal(s.openings[0].ramp,true);assert.equal(r.shedImage,'data:image/png;base64,AAAA');
});
test('spec follows large dormer, wide door, no ramp and lean-to changes',()=>{
 const s=photoSpecification({...model,length:18,openings:[{...model.openings[0],width:60,ramp:false}]});
 assert.equal(s.dormer.windowCount,3);assert.equal(s.dormer.widthFt,10);assert.equal(s.dormer.windowWidthIn,29);
 assert.equal(s.openings[0].transomGrid.panesPerLeaf,4);assert.equal(s.openings[0].ramp,false);
 assert.equal(photoSpecification({...model,foundation:'slab'}).openings[0].ramp,false);
 assert.equal(photoSpecification({...model,dormer:false,roofStyle:'lean-to'}).dormer,null);
 assert.equal(photoSpecification({...model,dormer:false,roofStyle:'lean-to'}).roof.pitch,'10 degrees');
});
test('server ignores caller-supplied prompt/spec and preserves missing dimensions',()=>{
 const prompt=buildPhotoPrompt({...model,renderingConstraints:{instructions:'EVIL_SENTINEL',specification:{dormer:{windowCount:99}}}});
 assert.ok(!prompt.includes('EVIL_SENTINEL'));assert.ok(!prompt.includes('"windowCount": 99'));
 assert.equal(photoSpecification({}).footprintFt.width,null);
});
