import test from 'node:test';
import assert from 'node:assert/strict';
import {metalProfile,metalRoofAllowed} from '../src/metalRoofGeometry.js';
test('ribbed metal profile stays within roof length and repeats raised trapezoids at 9 inches',()=>{
 for(const length of [6+8/12,10+8/12,24+1]){
  const profile=metalProfile(length);
  assert.equal(profile[0][0],-length/2);assert.equal(profile.at(-1)[0],length/2);
  for(let i=0;i<profile.length;i++){const [x,y]=profile[i];assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(y>=0&&y<=.75/12);if(i)assert.ok(x>=profile[i-1][0]);}
  const peaks=profile.filter(([,y])=>y===.75/12);
  assert.ok(peaks.length>6);
  const tops=[];for(let i=0;i<peaks.length-1;i++){if(Math.abs(peaks[i+1][0]-peaks[i][0]-(2/12*.34))<1e-7)tops.push((peaks[i][0]+peaks[i+1][0])/2);}
  for(let i=1;i<tops.length;i++)assert.ok(Math.abs(tops[i]-tops[i-1]-9/12)<1e-7);
 }
});
test('first metal roof release is limited to standard gables and never dormers',()=>{
 assert.equal(metalRoofAllowed('gable',false),true);
 assert.equal(metalRoofAllowed('gable',true),false);
 assert.equal(metalRoofAllowed('lean-to',false),false);
});
