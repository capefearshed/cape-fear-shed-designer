import test from 'node:test';
import assert from 'node:assert/strict';
import {BoxGeometry,Mesh,Group,PerspectiveCamera,Vector3,Box3} from 'three';
import {frameBackyardCamera} from '../src/backyardCamera.js';
test('full shed stays framed with a door visible across sizes and screen shapes',()=>{
 for(const [w,l,h] of [[4,6,8],[10,12,11],[16,24,14]])for(const aspect of [.6,1,1.5,2])for(const wall of ['front','back','left','right']){
  const object=new Group();object.rotation.y=-.2;const mesh=new Mesh(new BoxGeometry(l,h,w));mesh.position.y=h/2;object.add(mesh);
  const camera=new PerspectiveCamera(39,aspect,.1,500);frameBackyardCamera(camera,object,[{kind:'door',wall},{kind:'window',wall:'right'}]);
  const box=new Box3().setFromObject(object);assert.ok(Math.abs(camera.position.y-(box.min.y+5.5))<.001);
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
   const p=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<.9&&Math.abs(p.y)<.9);
  }
  const local=camera.position.clone().sub(box.getCenter(new Vector3())).applyAxisAngle(new Vector3(0,1,0),.2);
  assert.ok(wall==='front'?local.z>0:wall==='back'?local.z<0:wall==='right'?local.x>0:local.x<0);
  mesh.geometry.dispose();mesh.material.dispose();
 }
});
