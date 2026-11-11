import test from 'node:test';
import assert from 'node:assert/strict';
import {Color,PerspectiveCamera,Scene,Vector2} from 'three';
import {captureSceneCanvas} from '../src/captureCanvas.js';
import {capturePixels,captureRendererMethods} from './capture-fixture.js';
test('copies the freshly rendered visible canvas and restores size after success or blank failure',()=>{
 const previous=globalThis.document,scene=new Scene(),background=new Color('red');scene.background=background;
 let target={old:true},rendered=false,blank=false,copied=false;
 const gl={...captureRendererMethods(),getRenderTarget:()=>target,setRenderTarget:t=>{target=t;},getClearColor:c=>c.set('red'),getClearAlpha:()=>.5,setClearColor(){},render(){assert.equal(target,null);assert.deepEqual(gl.getSize(new Vector2()).toArray(),[1536,1024]);rendered=true;}};
 globalThis.document={createElement(){return {getContext:()=>({drawImage(source){assert.equal(source,gl.domElement);assert.equal(rendered,true);copied=true;},getImageData:()=>({data:blank?new Uint8ClampedArray(64*64*4):capturePixels()})})};}};
 try{
  captureSceneCanvas({gl,scene},new PerspectiveCamera(),1536,1024);assert.equal(copied,true);
  assert.equal(gl.getPixelRatio(),1.5);assert.deepEqual(gl.getSize(new Vector2()).toArray(),[800,600]);assert.equal(scene.background,background);assert.equal(target.old,true);
  blank=true;assert.throws(()=>captureSceneCanvas({gl,scene},new PerspectiveCamera(),1536,1024),/blank/);
  assert.equal(gl.getPixelRatio(),1.5);assert.deepEqual(gl.getSize(new Vector2()).toArray(),[800,600]);assert.equal(scene.background,background);assert.equal(target.old,true);
 }finally{globalThis.document=previous;}
});
