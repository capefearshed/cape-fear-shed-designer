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

test('capture isolates exterior, uses ordered fixed-size frames and restores renderer state',async()=>{
 const {Scene,Group,Mesh,BoxGeometry,MeshBasicMaterial,DirectionalLight,PerspectiveCamera,Color}=await import('three');
 const {captureSubmissionImages}=await import('../src/submissionCapture.js');
 const scene=new Scene(),object=new Group(),other=new Group(),light=new DirectionalLight();
 object.add(new Mesh(new BoxGeometry(12,9,8),new MeshBasicMaterial()));object.rotation.y=-.2;object.visible=false;scene.add(object,other,light);
 const originalBackground=new Color('white');scene.background=originalBackground;
 const previousDocument=globalThis.document,frames=[];let target=null,shadowChecks=0,displayChecks=0;
 const gl={outputColorSpace:'srgb',toneMapping:4,toneMappingExposure:1,shadowMap:{enabled:true},getRenderTarget:()=>target,setRenderTarget:t=>{target=t;},getClearColor:c=>c.set('white'),getClearAlpha:()=>.5,setClearColor(){},render(s,c){if(target&&s===scene){assert.equal(other.visible,false);assert.equal(object.visible,true);assert.equal(gl.shadowMap.enabled,false);assert.equal(target.samples,4);assert.equal(light.visible,false);shadowChecks++;}else if(target){assert.ok('SRGB_TRANSFER' in s.material.defines);assert.ok('ACES_FILMIC_TONE_MAPPING' in s.material.defines);displayChecks++;}},readRenderTargetPixels(t,x,y,w,h,pixels){assert.equal(w,1500);assert.equal(h,1000);assert.equal(t.depthBuffer,false);pixels.fill(255);}};
 globalThis.document={createElement(){const canvas={width:0,height:0,getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};},toDataURL(type,quality){frames.push({width:this.width,height:this.height,type,quality});return 'data:image/jpeg;base64,/9j/';}};return canvas;}};
 try{
  const images=await captureSubmissionImages({gl,scene,camera:new PerspectiveCamera()},object);
  assert.deepEqual(images.map(i=>i.view),IMAGE_VIEWS);assert.equal(shadowChecks,5);assert.equal(displayChecks,5);
  assert.ok(frames.every(f=>f.width===1500&&f.height===1000&&f.type==='image/jpeg'&&f.quality===.85));
  assert.equal(object.visible,false);assert.equal(object.rotation.y,-.2);assert.equal(other.visible,true);assert.equal(light.visible,true);assert.equal(scene.children.length,3);assert.equal(gl.shadowMap.enabled,true);assert.equal(target,null);assert.equal(scene.background,originalBackground);
 }finally{globalThis.document=previousDocument;}
});
