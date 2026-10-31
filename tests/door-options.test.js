import test from 'node:test';
import assert from 'node:assert/strict';
import {DOOR_OPTIONS,doorAllowed,isResidentialDoor} from '../src/doorOptions.js';
import {distributeAll} from '../src/openingLayout.js';
import {openingRects} from '../src/interiorLayout.js';
test('residential entry units require 8 foot sidewalls and retain 80 inch interior openings',()=>{
 for(const option of DOOR_OPTIONS.filter(isResidentialDoor)){
  assert.equal(doorAllowed(option,6.5),false);
  assert.equal(doorAllowed(option,7),false);
  assert.equal(doorAllowed(option,8),true);
  const opening={...option,id:'entry',kind:'door',wall:'front',x:60,y:0,transom:false};
  assert.ok(distributeAll([opening],8,10));
  assert.equal(openingRects('front',8,10,[opening])[0].top,80/12);
 }
});
test('six foot glazed units need more wall space than a six foot wall',()=>{
 for(const option of DOOR_OPTIONS.filter(o=>o.width===72)){
  const door={...option,id:'entry',kind:'door',wall:'left',x:0,y:0};
  assert.equal(distributeAll([door],6,8),null);
  assert.ok(distributeAll([door],8,8));
 }
 assert.ok(DOOR_OPTIONS.filter(o=>!isResidentialDoor(o)).every(o=>doorAllowed(o,6.5)));
});
