import test from 'node:test';
import assert from 'node:assert/strict';
import {Color,Group,Scene,PerspectiveCamera} from 'three';
import {cutoutBounds,captureShedCutout} from '../src/shedCutout.js';
import {backyardPhotoRequest} from '../src/api.js';
import {captureRendererMethods} from './capture-fixture.js';
test('alpha bounds retain white foreground and reject empty or opaque backgrounds',()=>{
 const pixels=new Uint8ClampedArray(4*3*4);
 pixels.set([255,255,255,255],(1*4+1)*4);
 pixels.set([255,255,255,40],(1*4+2)*4);
 assert.deepEqual(cutoutBounds(pixels,4,3),{x:.25,y:1/3,width:.5,height:1/3});
 assert.throws(()=>cutoutBounds(new Uint8ClampedArray(48),4,3),/invalid/);
 pixels.fill(255);assert.throws(()=>cutoutBounds(pixels,4,3),/invalid/);
});
test('transparent capture hides scene siblings and restores state even when encoding exceeds budget',()=>{
 const previous=globalThis.document,scene=new Scene(),shed=new Group(),ground=new Group();scene.add(shed,ground);shed.visible=false;
 const originalBackground=new Color('red');scene.background=originalBackground;
 const pixels=new Uint8ClampedArray(1536*1024*4);
 for(let y=200;y<800;y++)for(let x=300;x<1100;x++)pixels.set([70,60,50,255],(y*1536+x)*4);
 let oversize=false,clearAlpha=1;
 const gl={...captureRendererMethods(),getRenderTarget:()=>null,setRenderTarget(){},getClearColor:c=>c.set('red'),getClearAlpha:()=>1,setClearColor(c,a){clearAlpha=a;},render(){assert.equal(scene.background,null);assert.equal(clearAlpha,0);assert.equal(shed.visible,true);assert.equal(ground.visible,false);}};
 globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:pixels})}),toDataURL:type=>{assert.equal(type,'image/png');return oversize?'x'.repeat(2800001):'data:image/png;base64,test';}})};
 try{
  const camera=new PerspectiveCamera(),before=camera.toJSON();
  const result=captureShedCutout({gl,scene},camera,shed);
  assert.equal(result.metadata.version,'cfs-cutout-v1');assert.equal(result.metadata.width,1536);assert.deepEqual(camera.toJSON(),before);
  assert.equal(scene.background,originalBackground);assert.equal(shed.visible,false);assert.equal(ground.visible,true);
  oversize=true;assert.throws(()=>captureShedCutout({gl,scene},camera,shed),/too large/);
  assert.equal(scene.background,originalBackground);assert.equal(shed.visible,false);assert.equal(ground.visible,true);
 }finally{globalThis.document=previous;}
});
test('cutout contract survives photo requests and total UTF-8 body is bounded',()=>{
 const metadata={cutout:{version:'cfs-cutout-v1',width:1536,height:1024,sameCameraAsShedImage:true,bounds:{x:.1,y:.1,width:.8,height:.8}}};
 const body=backyardPhotoRequest('jpeg',{}, {shedCutout:'data:image/png;base64,test',referenceDetails:metadata});
 assert.equal(body.shedCutout,'data:image/png;base64,test');assert.deepEqual(body.referenceDetails,metadata);
 assert.equal('shedCutout' in backyardPhotoRequest('jpeg',{}),false);
 assert.throws(()=>backyardPhotoRequest('x'.repeat(4000000),{}),/too large/);
 assert.throws(()=>backyardPhotoRequest('é'.repeat(2000000),{}),/too large/);
});
