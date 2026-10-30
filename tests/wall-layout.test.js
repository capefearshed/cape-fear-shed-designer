import test from 'node:test';
import assert from 'node:assert/strict';
import {BoxGeometry,Mesh,Group,PerspectiveCamera,Vector3} from 'three';
import {wallCameraFit} from '../src/wallLayout.js';
import {distributeAll,framedWidth} from '../src/openingLayout.js';
test('6-foot walls accept 32, 36 and 48-inch doors, reject 60-inch and collisions',()=>{
 for(const wall of ['left','right'])for(const width of [32,36,48]){
  const door={id:'d',kind:'door',wall,width};const result=distributeAll([door],6,8);assert.ok(result);assert.equal(result[0].x,36);
 }
 assert.equal(distributeAll([{id:'d',kind:'door',wall:'right',width:60}],6,8),null);
 assert.equal(distributeAll([{id:'d',kind:'door',wall:'right',width:48},{id:'w',kind:'window',wall:'right',width:19.75}],6,8),null);
});
test('single door can be offset while keeping corner clearance, position survives relayout',()=>{
 for(const alignment of ['left','center','right']){
  const door={id:'d',kind:'door',wall:'front',width:48,alignment};
  const [placed]=distributeAll([door],6,8);
  assert.equal(placed.x,alignment==='left'?7.5+framedWidth(door)/2:alignment==='right'?96-7.5-framedWidth(door)/2:48);
  assert.equal(distributeAll([placed],6,10)[0].alignment,alignment);
 }
});
test('all four wall elevations fit horizontally and vertically, including 6x8 on a wide phone viewport',()=>{
 for(const [l,w,h] of [[8,6,9],[24,16,14]])for(const aspect of [.65,1.3,1.7,2.2])for(const wall of ['front','back','left','right']){
  const group=new Group();group.rotation.y=-.2;const mesh=new Mesh(new BoxGeometry(l,h,w));mesh.position.y=h/2;group.add(mesh);
  const camera=new PerspectiveCamera(39,aspect,.1,500),fit=wallCameraFit(camera,group,wall);
  camera.position.set(fit.center.x+Math.sin(fit.angle)*fit.radius,fit.center.y,fit.center.z+Math.cos(fit.angle)*fit.radius);camera.lookAt(fit.center);camera.updateMatrixWorld(true);
  for(const x of [-l/2,l/2])for(const y of [0,h])for(const z of [-w/2,w/2]){
   const p=new Vector3(x,y,z).applyMatrix4(group.matrixWorld).project(camera);assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<.9);
  }
  mesh.geometry.dispose();mesh.material.dispose();
 }
});
