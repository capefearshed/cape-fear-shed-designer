import test from 'node:test';
import assert from 'node:assert/strict';
import {lapShade,lapEaveClearance} from '../src/lapShading.js';
test('lap top is darker and clipped pieces retain original course shading',()=>{
 assert.equal(lapShade(0,0,.5),1);assert.ok(Math.abs(lapShade(.5,0,.5)-.7)<1e-10);
 assert.ok(lapShade(.48,0,.5)<lapShade(.1,0,.5));
 assert.equal(lapShade(.38,0,.5),1);
 assert.equal(lapShade(2.25,2,.5),lapShade(.25,0,.5));
});

test('lap eave cut clears roof even when 8ft wall ends in a partial course',()=>{
 for(const wall of [6.5,7,8+1/12])for(const pitch of [5,6,7,8]){
  const top=wall-lapEaveClearance(pitch);
  assert.ok(top+.085*pitch/12<wall);
 }
 assert.ok(lapEaveClearance(5,true)>.085*Math.tan(Math.PI/18));
});
