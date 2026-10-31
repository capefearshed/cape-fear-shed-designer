import test from 'node:test';
import assert from 'node:assert/strict';
import {framingOpacity} from '../src/framingVisibility.js';
test('framing fades smoothly as camera approaches and restores at overview distance',()=>{
 assert.equal(framingOpacity(30,30),1);
 assert.equal(framingOpacity(60,30),1);
 assert.equal(framingOpacity(0,30),.08);
 let previous=0;
 for(let d=0;d<=30;d+=.1){const opacity=framingOpacity(d,30);assert.ok(opacity>=previous);assert.ok(opacity>=.08&&opacity<=1);previous=opacity;}
 assert.ok(framingOpacity(15,30)<.5);
 assert.ok(Number.isFinite(framingOpacity(0,0)));
});
