import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Group,Mesh,BoxGeometry,MeshBasicMaterial,Vector3,PerspectiveCamera,PCFShadowMap} from 'three';
import {pathPlacements,groundHeight,createShadowLayerScene,blackShadowPixels,captureGroundLayers} from '../src/photoGroundLayers.js';
import {captureRendererMethods} from './capture-fixture.js';
import {FLOOR_HEIGHT} from '../src/shedGeometry.js';
test('all wall paths retain door width, offset and perpendicular axis including actual ramp endpoint',()=>{
 for(const wall of ['front','back','left','right']){
  const object=new Group();object.rotation.y=-.2;object.add(new Mesh(new BoxGeometry(16,8,10)));object.updateMatrixWorld(true);
  const design={width:10,length:16,foundation:'slab',openings:[{id:'door',kind:'door',wall,width:72,x:60}]};
  const [placement]=pathPlacements(design,object);
  assert.equal(placement.width,6);assert.equal(placement.start,0);
  const direction=new Vector3(Math.sin(placement.angle),0,Math.cos(placement.angle));
  const expected={front:[0,0,1],back:[0,0,-1],left:[-1,0,0],right:[1,0,0]}[wall];assert.ok(direction.distanceTo(new Vector3(...expected))<1e-8);
  assert.equal(groundHeight(design,object),FLOOR_HEIGHT-5/12);
 }
 const object=new Group();object.rotation.y=-.2;
 const ramp=new Mesh(new BoxGeometry(4,.1,2.8));ramp.position.set(0,0,6.5);ramp.userData.photoRampId='door';object.add(ramp);
 const design={width:10,length:16,foundation:'framed',openings:[{id:'door',kind:'door',wall:'front',width:48,x:96,ramp:true}]};
 assert.ok(Math.abs(pathPlacements(design,object)[0].start-2.9)<1e-6);
 assert.equal(pathPlacements({...design,openings:[]},object).length,0);
});
test('shadow pass uses real geometry and ground height without modifying or disposing original materials',()=>{
 const object=new Group(),material=new MeshBasicMaterial({color:'white'}),mesh=new Mesh(new BoxGeometry(16,8,10),material);mesh.position.y=4;object.add(mesh);object.rotation.y=-.2;object.updateWorldMatrix(true,true);
 const original=object.toJSON(),layer=createShadowLayerScene({foundation:'slab'},object);
 const catcher=layer.scene.children.find(o=>o.material?.isShadowMaterial);assert.equal(catcher.position.y,FLOOR_HEIGHT-5/12);assert.equal(catcher.receiveShadow,true);assert.equal(catcher.material.color.getHex(),0);
 const caster=layer.scene.children.find(o=>o.isGroup).children[0];assert.equal(caster.castShadow,true);assert.equal(caster.material.colorWrite,false);assert.equal(caster.material.depthWrite,false);
 assert.deepEqual(object.toJSON(),original);layer.dispose();assert.equal(mesh.material,material);assert.equal(mesh.castShadow,false);
 const pixels=new Uint8ClampedArray([123,45,67,80,255,255,255,0]);assert.deepEqual([...blackShadowPixels(pixels)],[0,0,0,80,0,0,0,0]);
});
test('empty layers are allowed, shadow RGB is zero, and renderer state restores after failure',()=>{
 const originalDocument=globalThis.document,object=new Group(),scene=new Scene();object.add(new Mesh(new BoxGeometry(10,8,8)));scene.add(object);let fail=false,passes=0;
 const gl={...captureRendererMethods(),shadowMap:{enabled:false,type:PCFShadowMap,autoUpdate:false,needsUpdate:false},getRenderTarget:()=>null,setRenderTarget(){},getClearColor:c=>c.set('red'),getClearAlpha:()=>1,setClearColor(){},render(){passes++;if(fail)throw new Error('test render failure');}};
 globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(1536*1024*4)}),putImageData(image){assert.ok(image.data.every(v=>v===0));}}),toDataURL:()=> 'data:image/png;base64,empty'})};
 try{
  const camera=new PerspectiveCamera(),before=camera.toJSON();
  assert.deepEqual(captureGroundLayers({gl,scene},camera,object,{foundation:'slab',openings:[]}),{pathLayer:'data:image/png;base64,empty',shadowLayer:'data:image/png;base64,empty'});
  assert.equal(passes,2);assert.deepEqual(camera.toJSON(),before);assert.equal(gl.shadowMap.enabled,false);assert.equal(gl.shadowMap.type,PCFShadowMap);
  fail=true;assert.throws(()=>captureGroundLayers({gl,scene},camera,object,{foundation:'slab',openings:[]}),/test render failure/);assert.equal(gl.shadowMap.autoUpdate,false);assert.equal(gl.shadowMap.enabled,false);
 }finally{globalThis.document=originalDocument;}
});
