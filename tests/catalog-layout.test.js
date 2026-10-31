import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog} from '../src/api.js';
import {redistributeOpenings,validPlacement,placeOpening,openingFootprint} from '../src/catalogLayout.js';
import {sampleStates} from '../src/sampleStates.js';
const c=await getCatalog(),s=sampleStates(c)[0];
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
