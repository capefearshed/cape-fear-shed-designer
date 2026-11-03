import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Euler} from 'three';
import catalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {modelDesign} from '../src/modelBridge.js';
import {restoreDesign} from '../src/savedDesign.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {SOFFIT_OVERHANG,selectOverhang,soffitOverhangSections} from '../src/soffitOverhang.js';

test('overhang versions are exclusive and saved soffit selection restores with photo facts',()=>{
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];
 const original=state.extras;state.extras=selectOverhang([...original,{code:'roof-overhang-she-shed',qty:1}],SOFFIT_OVERHANG);
 assert.equal(state.extras.filter(e=>e.code.includes('roof-overhang')).length,1);
 const design=buildDesign(c,state);assert.equal(design.elements.find(e=>e.code===SOFFIT_OVERHANG).wall,undefined);
 for(const restored of [restoreDesign(c,design),restoreDesign(c,design,design.editorState)]){
  const d=modelDesign(c,restored);assert.equal(d.soffitOverhang,true);assert.equal(d.sheShedOverhang,false);
  const spec=photoSpecification(d);assert.equal(spec.roof.eaveAndRakeOverhangIn,8);assert.equal(spec.roof.edgeTrim.boxDepthIn,4);
 }
 state.extras.push({code:'roof-overhang-she-shed',qty:1});assert.throws(()=>buildDesign(c,state),/only one roof overhang/);
 assert.deepEqual(selectOverhang(state.extras,null),original);
});
test('soffit is 4 inches thick with 8-inch horizontal projection and pitched eave faces',()=>{
 for(const lean of [false,true])for(const pitch of [5,7,8]){
  const w=10,l=16,sections=soffitOverhangSections({w,l,wall:7,pitch,lean});
  assert.equal(sections.length,lean?1:2);
  for(const section of sections){
   for(const strip of section.strips)assert.equal(strip.size[1],4/12);
   const rakes=section.strips.filter(s=>s.id.startsWith('rake'));
   for(const strip of rakes)assert.ok(Math.abs(Math.abs(strip.at[0])+strip.size[0]/2-l/2-8/12)<1e-10);
   for(const eave of section.strips.filter(s=>s.id.startsWith('eave'))){
    assert.ok(Math.abs(eave.size[2]*Math.cos(section.rotation[0])-8/12)<1e-10);
    const edgeNormal=new Vector3(0,0,1).applyEuler(new Euler(...section.rotation));
    const roofNormal=new Vector3(0,1,0).applyEuler(new Euler(...section.rotation));
    assert.ok(Math.abs(edgeNormal.y)>.1);assert.ok(Math.abs(edgeNormal.dot(roofNormal))<1e-10);
   }
  }
 }
});

test('bird box saves separately, restores, and retains level eaves and four closed returns',async()=>{
 const {BIRD_BOX_OVERHANG,birdBoxOverhangParts}=await import('../src/birdBoxOverhang.js');
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];
 state.extras=selectOverhang([...state.extras,{code:SOFFIT_OVERHANG,qty:1}],BIRD_BOX_OVERHANG);
 const design=buildDesign(c,state);
 assert.equal(design.elements.filter(e=>e.code.startsWith('roof-overhang')).length,1);
 for(const restored of [restoreDesign(c,design),restoreDesign(c,design,design.editorState)]){
  const d=modelDesign(c,restored);assert.equal(d.birdBoxOverhang,true);assert.equal(d.soffitOverhang,true);
  const roof=photoSpecification(d).roof;assert.match(roof.edgeTrim.orientation,/horizontal/);assert.equal(roof.eaveAndRakeOverhangIn,8);
 }
 for(const pitch of [3,5,7,8,12])for(const w of [4,10,16]){
  const parts=birdBoxOverhangParts({w,l:16,wall:7,pitch});
  assert.equal(parts.filter(p=>p.id.startsWith('bird-box')).length,4);
  assert.equal(parts.filter(p=>p.id.startsWith('rake')).length,4);
  for(const p of parts){assert.ok(p.to>p.from);assert.ok(p.outline.flat().every(Number.isFinite));}
  for(const eave of parts.filter(p=>p.id.startsWith('eave'))){
   assert.equal(eave.outline[2][1],eave.outline[3][1]);
   assert.ok(Math.abs(Math.abs(eave.outline[1][0]-eave.outline[0][0])-8/12)<1e-10);
   const side=Number(eave.id.slice(5));
   for(const corner of parts.filter(p=>p.id.startsWith('bird-box')&&p.id.endsWith('-'+side))){
    assert.equal(corner.outline[2][1],eave.outline[2][1]);assert.equal(corner.outline[3][1],eave.outline[3][1]);
   }
  }
 }
});
