import fixtureCatalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {redistributeOpenings,validPlacement,placeOpening,openingFootprint,moveOpening,offsetOpening,stepOpening} from '../src/catalogLayout.js';
import {sampleStates} from '../src/sampleStates.js';
const c=applyApprovedColors(structuredClone(fixtureCatalog)),s=sampleStates(c)[0];
test('openings redistribute in chosen order with morning clearances; shutters affect physical fit',()=>{
 const door=s.placed[0];
 const a=placeOpening(c,s.shed,[door],'window-18x27','front','window-1');assert.ok(a);
 const laid=redistributeOpenings(c,s.shed,[door,a]);assert.equal(validPlacement(c,s.shed,laid),true);
 const reversed=redistributeOpenings(c,s.shed,[a,door]);assert.ok(reversed[0].x<reversed[1].x);
 const option=c.options.find(o=>o.code==='window-18x27');
 assert.equal(openingFootprint(option,{shutters:true}).width,19.75);
 assert.equal(c.rules.cornerClear,7.5);assert.equal(c.rules.gap,4);
 const small={...s.shed,width:4,length:6};
 const windows=[{id:'a',code:option.code,wall:'front',x:0,y:40},{id:'b',code:option.code,wall:'front',x:0,y:40}];
 assert.ok(redistributeOpenings(c,small,windows));
 assert.equal(redistributeOpenings(c,small,windows.map(p=>({...p,shutters:true}))),null);
});

test('4 foot double door makes room beside a window and can swap sides without moving the window first',()=>{
 const shed={...s.shed,width:8,length:10};
 let placed=redistributeOpenings(c,shed,[{id:'d',code:'door-4-double',wall:'front',x:0,y:0,rampRemoved:true},{id:'w',code:'window-18x27',wall:'front',x:0,y:40}]);
 assert.ok(placed);const start=placed.find(p=>p.id==='d').x;
 placed=moveOpening(c,shed,placed,'d',start+12);assert.ok(placed);assert.equal(placed.find(p=>p.id==='d').x,start);assert.ok(validPlacement(c,shed,placed));
 placed=moveOpening(c,shed,placed,'d',115);assert.ok(placed);assert.ok(placed.find(p=>p.id==='d').x>placed.find(p=>p.id==='w').x);assert.ok(validPlacement(c,shed,placed));
 placed=moveOpening(c,shed,placed,'d',0);assert.ok(placed);assert.ok(placed.find(p=>p.id==='d').x<placed.find(p=>p.id==='w').x);assert.ok(validPlacement(c,shed,placed));
});
test('moves preserve shutters, ramps, other walls and clearances over repeated layout changes',()=>{
 const shed={...s.shed,width:10,length:16};
 let placed=redistributeOpenings(c,shed,[{id:'d',code:'door-4-double',wall:'front',x:0,y:0,rampRemoved:false},{id:'a',code:'window-18x27',wall:'front',x:0,y:40,shutters:true},{id:'b',code:'window-18x27',wall:'front',x:0,y:40},{id:'side',code:'window-18x27',wall:'left',x:0,y:40}]);
 const side=placed.find(p=>p.id==='side');
 for(const id of ['d','a','b'])for(const x of [0,48,96,192,24,140]){placed=moveOpening(c,shed,placed,id,x);assert.ok(placed);assert.ok(validPlacement(c,shed,placed));assert.deepEqual(placed.find(p=>p.id==='side'),side);assert.equal(placed.find(p=>p.id==='a').shutters,true);assert.equal(placed.find(p=>p.id==='d').rampRemoved,false);}
});

test('reordering spaces all openings evenly and a single door stays centred',()=>{
 const shed={...s.shed,width:10,length:16};
 let placed=redistributeOpenings(c,shed,[{id:'d',code:'door-4-double',wall:'front',x:0,y:0},{id:'a',code:'window-18x27',wall:'front',x:0,y:40},{id:'b',code:'window-18x27',wall:'front',x:0,y:40}]);
 for(const x of [0,192,65,120]){
  placed=moveOpening(c,shed,placed,'d',x);assert.ok(placed);
  assert.deepEqual(placed,redistributeOpenings(c,shed,placed));assert.ok(validPlacement(c,shed,placed));
 }
 const only=moveOpening(c,shed,[placed.find(p=>p.id==='d')],'d',0);assert.equal(only[0].x,96);
});
test('a tight 10 foot wall fits a four foot door and shuttered window while retaining the 4 inch gap',()=>{
 const shed={...s.shed,width:8,length:10};
 let placed=redistributeOpenings(c,shed,[{id:'d',code:'door-4-double',wall:'front',x:0,y:0},{id:'w',code:'window-18x27',wall:'front',x:0,y:40,shutters:true}]);
 assert.ok(validPlacement(c,shed,placed));placed=moveOpening(c,shed,placed,'d',120);assert.ok(placed);assert.ok(validPlacement(c,shed,placed));assert.ok(placed.find(p=>p.id==='d').x>placed.find(p=>p.id==='w').x);
});

test('a lone single or double door has only left, center and right positions',()=>{
 for(const code of ['door-32-single','door-36-single','door-4-double','door-5-double']){
  const shed={...s.shed,width:10,length:16};
  let placed=redistributeOpenings(c,shed,[{id:'d',code,wall:'front',x:0,y:0,rampRemoved:false}]);
  const center=96;assert.equal(placed[0].x,center);
  placed=offsetOpening(c,shed,placed,'d',-1);assert.ok(placed);assert.equal(placed[0].alignment,'left');assert.ok(placed[0].x<center);
  assert.equal(offsetOpening(c,shed,placed,'d',-1),null);assert.deepEqual(redistributeOpenings(c,shed,placed),placed);
  placed=offsetOpening(c,shed,placed,'d',1);assert.equal(placed[0].x,center);
  placed=offsetOpening(c,shed,placed,'d',1);assert.equal(placed[0].alignment,'right');assert.ok(placed[0].x>center);
  assert.equal(offsetOpening(c,shed,placed,'d',1),null);assert.equal(placed[0].rampRemoved,false);assert.ok(validPlacement(c,shed,placed));
  const window=placeOpening(c,shed,placed,'window-18x27','front','w');const shared=redistributeOpenings(c,shed,[...placed,window]);
  assert.equal(offsetOpening(c,shed,shared,'d',-1),null);assert.ok(validPlacement(c,shed,shared));
 }
});

test('arrows swap a door with its adjacent window in screen direction on every wall',()=>{
 for(const wall of ['front','back','left','right']){
  const shed={...s.shed,width:12,length:16};
  const original=redistributeOpenings(c,shed,[{id:'d',code:'door-4-double',wall,x:0,y:0,rampRemoved:false,color:{name:'Naval',hex:'#112233'}},{id:'w',code:'window-18x27',wall,x:0,y:40,shutters:true},{id:'other',code:'window-18x27',wall:wall==='front'?'back':'front',x:0,y:40}]);
  const direction=wall==='back'||wall==='right'?-1:1;
  const changed=stepOpening(c,shed,original,'d',direction);assert.ok(changed);
  assert.ok(changed.find(p=>p.id==='d').x>changed.find(p=>p.id==='w').x);assert.deepEqual(redistributeOpenings(c,shed,changed),changed);
  assert.ok(original.find(p=>p.id==='d').x<original.find(p=>p.id==='w').x);
  assert.deepEqual(changed.find(p=>p.id==='other'),original.find(p=>p.id==='other'));
  assert.equal(changed.find(p=>p.id==='d').rampRemoved,false);assert.equal(changed.find(p=>p.id==='w').shutters,true);
  assert.equal(stepOpening(c,shed,changed,'d',direction),null);
  const restored=stepOpening(c,shed,changed,'d',-direction);assert.deepEqual(restored,original);
  assert.equal(offsetOpening(c,shed,changed,'d',direction),null);
 }
});
