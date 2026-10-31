import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,PerspectiveCamera,Color} from 'three';
import {captureBackyardReference} from '../src/referenceCapture.js';
test('photo reference uses full landscape resolution and restores renderer state',()=>{
 const previousDocument=globalThis.document,scene=new Scene(),camera=new PerspectiveCamera(39,1.5),background=new Color('white');scene.background=background;
 let target=null,frame;const gl={outputColorSpace:'srgb',toneMapping:4,toneMappingExposure:1,getRenderTarget:()=>target,setRenderTarget:t=>{target=t;},getClearColor:c=>c.set('#abcdef'),getClearAlpha:()=>.25,setClearColor(){},render(){},readRenderTargetPixels(t,x,y,w,h,p){assert.equal(w,1536);assert.equal(h,1024);p.fill(255);}};
 globalThis.document={createElement(){return {width:0,height:0,getContext(){return {createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData(){}};},toDataURL(type,quality){frame={width:this.width,height:this.height,type,quality};return 'data:image/jpeg;base64,/9j/';}};}};
 try{assert.match(captureBackyardReference({gl,scene},camera),/^data:image\/jpeg/);assert.deepEqual(frame,{width:1536,height:1024,type:'image/jpeg',quality:.9});assert.equal(target,null);assert.equal(scene.background,background);}finally{globalThis.document=previousDocument;}
});
