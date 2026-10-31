import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {elevationCameras,IMAGE_VIEWS,IMAGE_WIDTH,IMAGE_HEIGHT} from '../src/submissionCapture.js';
for(const [width,length] of [[4,6],[8,12],[12,16],[16,24]])test(`all four elevations fit at identical scale for ${width}x${length}`,()=>{
 const box=new Box3(new Vector3(-length/2,-.4,-width/2),new Vector3(length/2,12,width/2));
 const shots=elevationCameras(box);
 assert.deepEqual(IMAGE_VIEWS,['render','front','left','back','right']);
 assert.equal(IMAGE_WIDTH,1500);assert.equal(IMAGE_HEIGHT,1000);
 assert.equal(new Set(shots.map(s=>s.camera.top)).size,1);
 for(const {view,camera} of shots){
  assert.equal(camera.isOrthographicCamera,true);
  for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
   const p=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=.80001&&Math.abs(p.y)<=.80001,view+' is clipped');
  }
 }
});
