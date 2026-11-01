import test from 'node:test';
import assert from 'node:assert/strict';
import {lapShade} from '../src/lapShading.js';
test('lap top is darker and clipped pieces retain original course shading',()=>{
 assert.equal(lapShade(0,0,.5),1);assert.ok(Math.abs(lapShade(.5,0,.5)-.7)<1e-10);
 assert.ok(lapShade(.48,0,.5)<lapShade(.1,0,.5));
 assert.equal(lapShade(.38,0,.5),1);
 assert.equal(lapShade(2.25,2,.5),lapShade(.25,0,.5));
});
