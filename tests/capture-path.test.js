import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3} from 'three';
import {createCapturePath} from '../src/capturePath.js';

test('capture-only path guides run straight outward from all four door walls',()=>{
 for(const wall of ['front','back','left','right'])for(const ramp of [false,true])for(const foundation of ['framed','slab']){
  const guide=createCapturePath([{kind:'door',wall,width:48,x:48,ramp}],8,12,foundation);
  guide.updateMatrixWorld(true);
  const mesh=guide.children[0].children[0];
  const start=new Vector3(0,9,0).applyMatrix4(mesh.matrixWorld);
  const end=new Vector3(0,-9,0).applyMatrix4(mesh.matrixWorld);
  const expected={front:[0,0,1],back:[0,0,-1],right:[1,0,0],left:[-1,0,0]}[wall];
  assert.ok(end.clone().sub(start).normalize().distanceTo(new Vector3(...expected))<1e-8);
  assert.ok(Math.abs(start.y-(foundation==='slab'?-.004:-.34))<1e-8);
  assert.equal(mesh.geometry.parameters.width,4);
  assert.equal(guide.children.length,1);
  guide.userData.dispose();
 }
 assert.equal(createCapturePath([{kind:'window'}],8,12,'slab').children.length,0);
});
