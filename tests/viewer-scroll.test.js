import test from 'node:test';
import assert from 'node:assert/strict';
import {viewerShrinkTarget} from '../src/viewerScroll.js';
test('first controls stay still, then viewer collapse changes gradually and stops at its cap',()=>{
 for(const top of [-20,0,48,96])assert.equal(viewerShrinkTarget(top,800),0);
 let previous=0;for(let top=97;top<=700;top++){const next=viewerShrinkTarget(top,800);assert.ok(next>=previous);assert.ok(next-previous<.7);previous=next;}
 assert.equal(viewerShrinkTarget(616,800),240);assert.equal(viewerShrinkTarget(2000,800),240);
});
