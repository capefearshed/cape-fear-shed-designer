import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,submissionBytes,MAX_SUBMISSION_BYTES} from '../src/api.js';
import {buildDesign,pricePiece,visibleOptions} from '../src/designContract.js';
import {sampleStates} from '../src/sampleStates.js';
import {validPlacement} from '../src/catalogLayout.js';
const catalog=await getCatalog(),samples=sampleStates(catalog);
test('painted 12x16 catalog estimate is exactly $10,738',()=>{
 const d=buildDesign(catalog,samples[1]);assert.equal(d.estimate.total,10738);
 assert.equal(d.elements.find(e=>e.code==='loft-45').free,true);
 assert.equal(d.elements.find(e=>e.code==='anchors-hurricane').qty,6);
 assert.equal(d.elements.filter(e=>e.code==='ramp-5').length,1);
 assert.ok(d.elements.every(e=>e.id&&e.code&&e.label&&Number.isFinite(e.qty)));
 assert.ok(d.estimate.lines.every(l=>Object.hasOwn(l,'amount')&&Object.hasOwn(l,'included')&&Object.hasOwn(l,'free')));
});
test('ramps follow doors, independently removable; free workbench switches to free loft when both selected',()=>{
 const s=structuredClone(samples[0]);s.extras=[{code:'workbench-18',qty:1,wall:'right'}];
 assert.equal(buildDesign(catalog,s).elements.find(e=>e.code==='workbench-18').free,true);
 s.extras.push({code:'loft-45',qty:1,wall:'left'});let d=buildDesign(catalog,s);
 assert.equal(d.elements.find(e=>e.code==='loft-45').free,true);
 assert.equal(Boolean(d.elements.find(e=>e.code==='workbench-18').free),false);
 s.placed[0].rampRemoved=true;assert.ok(!buildDesign(catalog,s).elements.some(e=>e.code.startsWith('ramp-')));
 s.placed=[];assert.ok(!buildDesign(catalog,s).elements.some(e=>e.code.startsWith('ramp-')));
});
test('automatic paint handles standard trim, matching painted trim, factory primer and white vinyl doors',()=>{
 const s=structuredClone(samples[1]);s.colors.trim=catalog.colors.trim.find(c=>c.name==='Tricorn Black');s.placed[0].color=s.colors.trim;
 let d=buildDesign(catalog,s);assert.ok(d.elements.some(e=>e.code==='paint-trim'));assert.ok(!d.elements.some(e=>e.code==='paint-door'));
 s.placed[0].color=catalog.colors.trim.find(c=>c.standard);assert.equal(buildDesign(catalog,s).elements.find(e=>e.code==='paint-door').qty,1);
 s.shed.siding='siding-vinyl-straight';d=buildDesign(catalog,s);assert.ok(!d.elements.some(e=>e.code.startsWith('paint-')));
 s.placed[0].color=catalog.colors.siding.find(c=>c.name==='Naval');assert.equal(buildDesign(catalog,s).elements.find(e=>e.code==='paint-door').qty,1);
 assert.ok(!buildDesign(catalog,samples[0]).elements.some(e=>e.code==='paint-siding'));
});
test('catalog sizes, owner restrictions, foundation selection and anchors remain synchronized',()=>{
 for(const [i,s] of samples.entries()){
  assert.equal(validPlacement(catalog,s.shed,s.placed),true);
  const d=buildDesign(catalog,s,{mode:i===2?'owner':'customer'});
  assert.equal(d.shed.foundation,i===2?'foundation-skids':'foundation-tuffblock');
  assert.equal(d.elements.find(e=>e.code==='anchors-hurricane').qty,Math.max(4,Math.round(s.shed.length/5)*2));
 }
 assert.ok(!visibleOptions(catalog).some(o=>o.ownerOnly));
 const s=structuredClone(samples[1]);s.placed[0].code='door-french-72x80';assert.throws(()=>buildDesign(catalog,s),/owner mode/);
 s.shed.style='style-gable-dormer';s.shed.length=24;s.shed.size='size-12x24';assert.throws(()=>buildDesign(catalog,s),/not available/);
});
test('unknown live codes remain visible, keep labels and group, and price safely without guessing linear feet',()=>{
 const next=structuredClone(catalog);const opt={code:'future-item',label:'New accessory',kind:'new-kind',group:'extras',price:{unit:'per linear ft',amount:99}};next.options.push(opt);
 assert.ok(visibleOptions(next).find(o=>o.code===opt.code));
 const s=structuredClone(samples[0]);s.extras.push({code:opt.code,qty:1});
 const d=buildDesign(next,s);assert.equal(d.elements.find(e=>e.code===opt.code).label,opt.label);assert.equal(d.estimate.pending,true);
 assert.equal(pricePiece({price:{unit:'slab',amount:null}},1,s.shed).amount,null);
});
test('approved paint, shingle and metal palettes are retained and custom colors stay unguessed',()=>{
 assert.ok(catalog.colors.siding.some(c=>c.name==='Romance'));
 assert.ok(catalog.colors.roof.some(c=>c.name==='Silver Birch'));
 assert.equal(catalog.colors.metal[0].name,'Galvalume');
 const s=structuredClone(samples[0]);s.colors.siding={name:'My custom shade',code:null,hex:null,custom:true};
 assert.deepEqual(buildDesign(catalog,s).colors.siding,s.colors.siding);
 assert.ok(submissionBytes(buildDesign(catalog,s))<MAX_SUBMISSION_BYTES);
});
