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
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];state.shed.wallHeight='wall-7';
 const original=state.extras;state.extras=selectOverhang([...original,{code:'roof-overhang-she-shed',qty:1}],SOFFIT_OVERHANG);
 assert.equal(state.extras.filter(e=>e.code.includes('roof-overhang')).length,1);
 const design=buildDesign(c,state);assert.equal(design.elements.find(e=>e.code===SOFFIT_OVERHANG).wall,undefined);
 for(const restored of [restoreDesign(c,design),restoreDesign(c,design,design.editorState)]){
  const d=modelDesign(c,restored);assert.equal(d.soffitOverhang,true);assert.equal(d.sheShedOverhang,false);
  const spec=photoSpecification(d);assert.equal(spec.roof.eaveAndRakeOverhangIn,8);assert.equal(spec.roof.edgeTrim.boxDepthIn,3.5);
 }
 state.extras.push({code:'roof-overhang-she-shed',qty:1});assert.throws(()=>buildDesign(c,state),/only one roof overhang/);
 assert.deepEqual(selectOverhang(state.extras,null),original);
});
test('soffit is 3.5 inches thick with 8-inch horizontal projection and pitched eave faces',()=>{
 for(const lean of [false,true])for(const pitch of [5,7,8]){
  const w=10,l=16,sections=soffitOverhangSections({w,l,wall:7,pitch,lean});
  assert.equal(sections.length,lean?1:2);
  for(const section of sections){
   for(const strip of section.strips)assert.equal(strip.size[1],3.5/12);
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
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];state.shed.wallHeight='wall-7';
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

test('only bird box is restricted on lean-to; all valid catalog sizes and roofs retain other overhangs',async()=>{
 const {OVERHANG_CODES,overhangUnavailableReason}=await import('../src/soffitOverhang.js');
 const {styleUnavailableReason}=await import('../src/styleRules.js');
 const {BIRD_BOX_OVERHANG}=await import('../src/birdBoxOverhang.js');
 const c=applyApprovedColors(catalog);
 for(const size of c.sizes)for(const style of c.styles){
  const state=sampleStates(c)[0];state.shed.wallHeight='wall-7';state.shed={...state.shed,size:size.code,width:size.width,length:size.length,style:style.code};state.placed=[];
  if(styleUnavailableReason(c,state.shed))continue;
  for(const roofing of style.roofing||['roof-shingle','roof-metal'])for(const code of OVERHANG_CODES){
   state.shed.roofing=roofing;state.extras=selectOverhang([],code);
   const unavailable=code===BIRD_BOX_OVERHANG&&style.code==='style-lean-to';
   assert.equal(Boolean(overhangUnavailableReason(state.shed,code)),unavailable);
   if(unavailable)assert.throws(()=>buildDesign(c,state),/Not available with lean-to/);
   else assert.ok(buildDesign(c,state).elements.some(e=>e.code===code));
  }
 }
});
test('switching to lean-to and restoring legacy lean-to bird boxes choose regular soffit',async()=>{
 const {withShedStyle}=await import('../src/styleRules.js');
 const {withCompatibleOverhang}=await import('../src/soffitOverhang.js');
 const {BIRD_BOX_OVERHANG}=await import('../src/birdBoxOverhang.js');
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];state.shed.wallHeight='wall-7';
 state.extras=[{code:'anchors-hurricane',qty:1},{code:BIRD_BOX_OVERHANG,qty:1}];
 const next=withShedStyle(c,state,'style-lean-to');
 assert.equal(next.extras.some(e=>e.code===BIRD_BOX_OVERHANG),false);
 assert.ok(next.extras.some(e=>e.code===SOFFIT_OVERHANG));assert.ok(next.extras.some(e=>e.code==='anchors-hurricane'));
 assert.ok(state.extras.some(e=>e.code===BIRD_BOX_OVERHANG));
 const old=buildDesign(c,state);old.shed.style='style-lean-to';
 assert.ok(restoreDesign(c,old).extras.some(e=>e.code===SOFFIT_OVERHANG));
 const snapshot=structuredClone(old.editorState);snapshot.state.shed.style='style-lean-to';
 assert.ok(restoreDesign(c,old,snapshot).extras.some(e=>e.code===SOFFIT_OVERHANG));
 const missing={...c,options:c.options.filter(o=>o.code!==SOFFIT_OVERHANG)};
 assert.deepEqual(withCompatibleOverhang(missing,{...state,shed:{...state.shed,style:'style-lean-to'}}).extras,[{code:'anchors-hurricane',qty:1}]);
});

test('selecting either boxed soffit raises only short walls to seven feet and keeps quote state aligned',async()=>{
 const {withSelectedOverhang,overhangHeightNote,selectedOverhangReason}=await import('../src/soffitOverhang.js');
 const {BIRD_BOX_OVERHANG}=await import('../src/birdBoxOverhang.js');
 const c=applyApprovedColors(catalog);
 for(const code of [SOFFIT_OVERHANG,BIRD_BOX_OVERHANG])for(const height of ['wall-6-6','wall-7','wall-8']){
  const state=sampleStates(c)[0];state.shed.wallHeight=height;
  const next=withSelectedOverhang(c,state,code);
  assert.equal(next.shed.wallHeight,height==='wall-6-6'?'wall-7':height);
  assert.equal(state.shed.wallHeight,height);
  assert.equal(buildDesign(c,next).shed.wallHeight,next.shed.wallHeight);
  assert.equal(modelDesign(c,next).height,height==='wall-8'?8:7);
  assert.equal(Boolean(overhangHeightNote(state.shed,code)),height==='wall-6-6');
  assert.equal(selectedOverhangReason(c,next),'');
  assert.match(selectedOverhangReason(c,{...next,shed:{...next.shed,wallHeight:'wall-6-6'}}),/minimum 7-foot/);
 }
 const state=sampleStates(c)[0];assert.equal(withSelectedOverhang(c,state,'roof-overhang-she-shed').shed.wallHeight,'wall-6-6');
 assert.equal(withSelectedOverhang(c,state,null).shed.wallHeight,'wall-6-6');
});
test('lean-to low-wall doors block soffits for both slope directions; windows, high and end-wall doors are allowed',async()=>{
 const {withSelectedOverhang,overhangUnavailableReason,selectedOverhangReason}=await import('../src/soffitOverhang.js');
 const {openingUnavailableReason}=await import('../src/optionAvailability.js');
 const c=applyApprovedColors(catalog),door=c.options.find(o=>o.code==='door-4-double'),window=c.options.find(o=>o.code==='window-18x27');
 for(const high of ['front','back']){
  const low=high==='front'?'back':'front';
  for(const wall of ['front','back','left','right']){
   const state=sampleStates(c)[0];state.shed={...state.shed,style:'style-lean-to',wallHeight:'wall-7',roofHighWall:high};state.placed=[{...state.placed[0],wall}];
   assert.equal(Boolean(overhangUnavailableReason(state.shed,SOFFIT_OVERHANG,state.placed,c)),wall===low);
   if(wall===low){
    assert.throws(()=>withSelectedOverhang(c,state,SOFFIT_OVERHANG),/low wall/);
    assert.throws(()=>buildDesign(c,{...state,extras:[{code:SOFFIT_OVERHANG,qty:1}]}),/low wall/);
   }else{
    const next=withSelectedOverhang(c,state,SOFFIT_OVERHANG);assert.equal(selectedOverhangReason(c,next),'');
    const flipped={...next,shed:{...next.shed,roofHighWall:high==='front'?'back':'front'}};
    if(wall===high)assert.match(selectedOverhangReason(c,flipped),/low wall/);
   }
   assert.equal(Boolean(openingUnavailableReason(c,state.shed,[],door,wall,null,[{code:SOFFIT_OVERHANG,qty:1}]).includes('low wall')),wall===low);
  }
  const state=sampleStates(c)[0];state.shed={...state.shed,style:'style-lean-to',wallHeight:'wall-7',roofHighWall:high};state.placed=[{id:'window',code:window.code,wall:low,x:72,y:40}];
  assert.doesNotThrow(()=>withSelectedOverhang(c,state,SOFFIT_OVERHANG));
  state.placed.push({id:'door',code:door.code,wall:high,x:72,y:0},{id:'low-door',code:door.code,wall:low,x:72,y:0});
  assert.throws(()=>withSelectedOverhang(c,state,SOFFIT_OVERHANG),/low wall/);
 }
});
test('saved short-wall soffits and drafts are repaired without losing openings',async()=>{
 const {withSelectedOverhang,withCompatibleOverhang}=await import('../src/soffitOverhang.js');
 const {readDraft,saveDraft}=await import('../src/draftStorage.js');
 const c=applyApprovedColors(catalog),state=withSelectedOverhang(c,sampleStates(c)[0],SOFFIT_OVERHANG),design=buildDesign(c,state);
 design.shed.wallHeight='wall-6-6';design.editorState.state.shed.wallHeight='wall-6-6';
 assert.equal(restoreDesign(c,design).shed.wallHeight,'wall-7');
 assert.equal(restoreDesign(c,design,design.editorState).shed.wallHeight,'wall-7');
 let raw;const storage={setItem:(key,value)=>raw=value,getItem:()=>raw};
 saveDraft(c,{...state,shed:{...state.shed,wallHeight:'wall-6-6'}},storage);
 assert.equal(readDraft(c,storage).state.shed.wallHeight,'wall-7');
 const invalid={...state,shed:{...state.shed,style:'style-lean-to',roofHighWall:'back'}};
 const repaired=withCompatibleOverhang(c,invalid,{repair:true});
 assert.equal(repaired.extras.some(e=>e.code===SOFFIT_OVERHANG),false);
 assert.deepEqual(repaired.placed,state.placed);
});
