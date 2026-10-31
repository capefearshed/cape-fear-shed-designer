import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,submissionBytes,MAX_SUBMISSION_BYTES} from '../src/api.js';
import {buildDesign,visibleOptions} from '../src/designContract.js';
import {sampleStates} from '../src/sampleStates.js';
import {validPlacement} from '../src/catalogLayout.js';
const catalog=await getCatalog(),samples=sampleStates(catalog);
test('quote contract has no prices, estimate, automatic paint or anchors',()=>{
 for(const state of samples){
  const d=buildDesign(catalog,state);
  assert.ok(!Object.hasOwn(d,'estimate'));
  assert.ok(!d.elements.some(e=>e.code.startsWith('paint-')||e.code==='anchors-hurricane'));
  assert.ok(d.elements.every(e=>e.id&&e.code&&e.label&&Number.isFinite(e.qty)));
 }
 assert.equal(catalog.showPrices,false);
 assert.ok([...catalog.sizes,...catalog.options].every(o=>!Object.hasOwn(o,'price')));
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
test('door color overrides and factory white survive app-owned paint calculation',()=>{
 const s=structuredClone(samples[1]);s.colors.trim=catalog.colors.trim.find(c=>c.name==='Tricorn Black');s.placed[0].color=s.colors.trim;
 assert.equal(buildDesign(catalog,s).elements.find(e=>e.id==='door-1').color.name,'Tricorn Black');
 s.shed.siding='siding-vinyl-straight';delete s.placed[0].color;
 assert.equal(buildDesign(catalog,s).elements.find(e=>e.id==='door-1').color.name,'Snowscape');
});
test('catalog sizes, owner restrictions, foundation selection remain synchronized',()=>{
 for(const [i,s] of samples.entries()){
  assert.equal(validPlacement(catalog,s.shed,s.placed),true);
  const d=buildDesign(catalog,s,{mode:i===2?'owner':'customer'});
  assert.equal(d.shed.foundation,i===2?'foundation-skids':'foundation-tuffblock');
 }
 assert.ok(!visibleOptions(catalog).some(o=>o.ownerOnly));
 const s=structuredClone(samples[1]);s.placed[0].code='door-french-72x80';assert.throws(()=>buildDesign(catalog,s),/owner mode/);
 s.shed.style='style-gable-dormer';s.shed.length=24;s.shed.size='size-12x24';assert.throws(()=>buildDesign(catalog,s),/not available/);
});
test('unknown live codes remain visible, keep labels and group, without inventing pricing',()=>{
 const next=structuredClone(catalog);const opt={code:'future-item',label:'New accessory',kind:'new-kind',group:'extras',price:{unit:'per linear ft',amount:99}};next.options.push(opt);
 assert.ok(visibleOptions(next).find(o=>o.code===opt.code));
 const s=structuredClone(samples[0]);s.extras.push({code:opt.code,qty:1});
 const d=buildDesign(next,s);assert.equal(d.elements.find(e=>e.code===opt.code).label,opt.label);assert.ok(!('estimate' in d));
});
test('approved paint, shingle and metal palettes are retained and custom colors stay unguessed',()=>{
 assert.ok(catalog.colors.siding.some(c=>c.name==='Romance'));
 assert.ok(catalog.colors.roof.some(c=>c.name==='Silver Birch'));
 assert.equal(catalog.colors.metal[0].name,'Galvalume');
 const s=structuredClone(samples[0]);s.colors.siding={name:'My custom shade',code:null,hex:null,custom:true};
 assert.deepEqual(buildDesign(catalog,s).colors.siding,s.colors.siding);
 assert.ok(submissionBytes(buildDesign(catalog,s))<MAX_SUBMISSION_BYTES);
});
test('uses, source, tracking, customer and interior wall survive export',()=>{
 const state=structuredClone(samples[1]);state.extras.find(e=>e.code==='surf-rack').wall='right';
 const meta={uses:['storage'],usesOther:'Bikes',source:{code:'referral',other:'',referredBy:'Neighbor'},tracking:{utm_source:'test'},customer:{firstName:'Test',smsConsent:true}};
 const d=buildDesign(catalog,state,meta);
 for(const key of ['uses','usesOther','source','tracking','customer'])assert.deepEqual(d[key],meta[key]);
 assert.equal(d.elements.find(e=>e.code==='surf-rack').wall,'right');
});
