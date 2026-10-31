import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {elevationCameras,technicalCameras,TECHNICAL_VIEWS,IMAGE_VIEWS,IMAGE_WIDTH,IMAGE_HEIGHT} from '../src/submissionCapture.js';
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
 object.add(new Mesh(new BoxGeometry(12,9,8),new MeshBasicMaterial()));object.children[0].receiveShadow=true;object.rotation.y=-.2;object.visible=false;scene.add(object,other,light);
 const originalBackground=new Color('white');scene.background=originalBackground;
 const previousDocument=globalThis.document,frames=[];let target=null,shadowChecks=0,displayChecks=0,oversizedTechnical=false;
 const gl={outputColorSpace:'srgb',toneMapping:4,toneMappingExposure:1,shadowMap:{enabled:true},getRenderTarget:()=>target,setRenderTarget:t=>{target=t;},getClearColor:c=>c.set('white'),getClearAlpha:()=>.5,setClearColor(){},render(s,c){if(target&&s===scene){assert.equal(other.visible,false);assert.equal(object.visible,true);assert.equal(gl.shadowMap.enabled,c.isPerspectiveCamera===true);assert.equal(target.samples,4);assert.equal(object.children[0].receiveShadow,c.isPerspectiveCamera===true);assert.equal(light.visible,true);shadowChecks++;}else if(target){assert.ok('SRGB_TRANSFER' in s.material.defines);assert.ok('ACES_FILMIC_TONE_MAPPING' in s.material.defines);displayChecks++;}},readRenderTargetPixels(t,x,y,w,h,pixels){assert.ok(w===1500||w===1200);assert.equal(h,w===1500?1000:800);assert.equal(t.depthBuffer,false);pixels.fill(255);}};
 globalThis.document={createElement(){const canvas={width:0,height:0,getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};},toDataURL(type,quality){frames.push({width:this.width,height:this.height,type,quality});return this.width===1200&&quality===.8&&oversizedTechnical?'data:image/jpeg;base64,'+'a'.repeat(1000000):'data:image/jpeg;base64,/9j/';}};return canvas;}};
 try{
  const images=await captureSubmissionImages({gl,scene,camera:new PerspectiveCamera()},object);
  assert.deepEqual(images.map(i=>i.view),[...IMAGE_VIEWS,...TECHNICAL_VIEWS]);assert.equal(shadowChecks,9);assert.equal(displayChecks,9);
  assert.ok(frames.slice(0,5).every(f=>f.width===1500&&f.height===1000&&f.type==='image/jpeg'&&f.quality===.85));
  assert.ok(frames.slice(5).every(f=>f.width===1200&&f.height===800&&f.quality===.8));
  assert.ok(images.slice(5).every(i=>i.hidden===true&&i.pxPerFt>0&&i.groundY>=0&&i.groundY<=800));
  assert.equal(object.visible,false);assert.equal(object.children[0].receiveShadow,true);assert.equal(object.rotation.y,-.2);assert.equal(other.visible,true);assert.equal(light.visible,true);assert.equal(scene.children.length,3);assert.equal(gl.shadowMap.enabled,true);assert.equal(target,null);assert.equal(scene.background,originalBackground);
  oversizedTechnical=true;frames.length=0;
  await captureSubmissionImages({gl,scene,camera:new PerspectiveCamera()},object);
  assert.ok(frames.filter(f=>f.width===1500).every(f=>f.quality===.85),'customer quality must remain unchanged when technical compression can fit');
  assert.ok(frames.some(f=>f.width===1200&&f.quality===.65),'technical JPEG quality is lowered first');
 }finally{globalThis.document=previousDocument;}
});

test('quote cameras match the approved designer wall camera rather than orthographic roof shape',async()=>{
 const {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera}=await import('three');
 const {quoteWallCameras}=await import('../src/submissionCapture.js');
 const {wallCameraFit}=await import('../src/wallLayout.js');
 const object=new Group();object.add(new Mesh(new BoxGeometry(12,9,10),new MeshBasicMaterial()));object.rotation.y=-.2;
 for(const {view,camera} of quoteWallCameras(object)){
  const fit=wallCameraFit(new PerspectiveCamera(39,1.5,.1,1000),object,view);
  assert.equal(camera.isPerspectiveCamera,true);assert.ok(Math.abs(camera.position.distanceTo(fit.center)-fit.radius)<1e-8);
  assert.ok(Math.abs(camera.position.y-fit.center.y)<1e-8);
 }
});

for(const [width,length,height] of [[4,6,9],[12,16,13],[16,24,14]])test(`technical scale and top-origin ground line are accurate for ${width}x${length}`,()=>{
 const bounds=new Box3(new Vector3(-length/2,-.375,-width/2),new Vector3(length/2,height,width/2));
 const shots=technicalCameras(bounds);assert.deepEqual(shots.map(s=>s.view),TECHNICAL_VIEWS);
 assert.equal(new Set(shots.map(s=>s.pxPerFt)).size,1);assert.equal(new Set(shots.map(s=>s.groundY)).size,1);
 for(const shot of shots){
  assert.equal(shot.camera.isOrthographicCamera,true);
  const ground=new Vector3(0,bounds.min.y,0).project(shot.camera),above=new Vector3(0,bounds.min.y+1,0).project(shot.camera);
  assert.ok(Math.abs((above.y-ground.y)*400-shot.pxPerFt)<1e-7);
  assert.ok(Math.abs((1-ground.y)*400-shot.groundY)<1e-7);
 }
});
