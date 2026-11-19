import test from 'node:test';
import assert from 'node:assert/strict';
import {openingActionsForScroll} from '../src/openingScroll.js';
test('add controls hide down, reveal up, ignore jitter, and remain visible at the top',()=>{
 let state={top:0,hidden:false};
 state=openingActionsForScroll(state,40);assert.equal(state.hidden,true);
 assert.deepEqual(openingActionsForScroll(state,45),state);
 state=openingActionsForScroll(state,100);assert.equal(state.hidden,true);
 state=openingActionsForScroll(state,91);assert.equal(state.hidden,false);
 assert.deepEqual(openingActionsForScroll(state,96),state);
 state=openingActionsForScroll(state,104);assert.equal(state.hidden,true);
 assert.equal(openingActionsForScroll(state,24).hidden,false);
 assert.deepEqual(openingActionsForScroll(state,-20),{top:0,hidden:false});
});
