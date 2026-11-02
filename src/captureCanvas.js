import {Color,Vector2,Vector4} from 'three';
import {assertReferencePixels} from './referenceValidation.js';
// Copy immediately after rendering: do not depend on a preserved drawing buffer,
// half-float multisample readback, or alpha from an offscreen OutputPass.
export function captureSceneCanvas({gl,scene},camera,width,height,background='#F3F4F1'){
 const size=gl.getSize(new Vector2()).clone(),ratio=gl.getPixelRatio(),target=gl.getRenderTarget();
 const color=gl.getClearColor(new Color()).clone(),alpha=gl.getClearAlpha(),oldBackground=scene.background;
 const viewport=gl.getViewport?.(new Vector4()).clone(),scissor=gl.getScissor?.(new Vector4()).clone(),scissorTest=gl.getScissorTest?.();
 try{
  if(gl.getContext?.().isContextLost())throw new Error('The shed preview needs to reload before pictures can be captured.');
  gl.setRenderTarget(null);gl.setPixelRatio(1);gl.setSize(width,height,false);gl.setScissorTest?.(false);
  scene.background=new Color(background);gl.setClearColor(background,1);camera.updateMatrixWorld(true);
  gl.clear?.(true,true,true);gl.render(scene,camera);
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('The shed picture could not be captured.');
  ctx.drawImage(gl.domElement,0,0,width,height);
  assertReferencePixels(ctx.getImageData(0,0,width,height).data);
  return canvas;
 }finally{
  scene.background=oldBackground;gl.setClearColor(color,alpha);gl.setPixelRatio(ratio);gl.setSize(size.x,size.y,false);gl.setRenderTarget(target);
  if(viewport)gl.setViewport(viewport);if(scissor)gl.setScissor(scissor);if(scissorTest!==undefined)gl.setScissorTest(scissorTest);
 }
}
