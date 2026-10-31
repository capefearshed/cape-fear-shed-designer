import test from 'node:test';
import assert from 'node:assert/strict';
import catalogRaw from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {readDraft,saveDraft} from '../src/draftStorage.js';
const catalog=applyApprovedColors(catalogRaw);
test('saved design retains geometry, placements, colors and optional extras for a later visit',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const state=sampleStates(catalog)[1];assert.equal(saveDraft(catalog,state,storage),true);assert.deepEqual(readDraft(catalog,storage).state,state);
 const bad=structuredClone(state);bad.placed[0].x=-100;saveDraft(catalog,bad,storage);assert.equal(readDraft(catalog,storage),null);
});
test('unavailable storage, corrupted drafts and incompatible catalog versions do not block the designer',()=>{
 const state=sampleStates(catalog)[0],blocked={getItem(){throw new Error('blocked');},setItem(){throw new Error('full');}};
 assert.equal(readDraft(catalog,blocked),null);assert.equal(saveDraft(catalog,state,blocked),false);
 assert.equal(readDraft(catalog,{getItem:()=>'{invalid'}),null);
 assert.equal(readDraft(catalog,{getItem:()=>JSON.stringify({catalogVersion:'old',state})}),null);
});
