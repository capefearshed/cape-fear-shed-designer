import {WebGLRenderTarget,HalfFloatType,Color} from 'three';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
// A landscape reference independent of phone canvas size prevents portrait-to-landscape reshaping.
export function captureBackyardReference(state,camera){
 const {gl,scene}=state,width=1536,height=1024;
 const oldTarget=gl.getRenderTarget(),oldColor=gl.getClearColor(new Color()).clone(),oldAlpha=gl.getClearAlpha(),background=scene.background;
 const target=new WebGLRenderTarget(width,height,{type:HalfFloatType,samples:4}),output=new WebGLRenderTarget(width,height,{depthBuffer:false}),display=new OutputPass();
 try{
  scene.background=null;gl.setClearColor('#F3F4F1',0);
  gl.setRenderTarget(target);gl.render(scene,camera);display.render(gl,output,target);
  const pixels=new Uint8Array(width*height*4);gl.readRenderTargetPixels(output,0,0,width,height,pixels);
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
  const context=canvas.getContext('2d'),result=context.createImageData(width,height),row=width*4;
  for(let y=0;y<height;y++)result.data.set(pixels.subarray((height-y-1)*row,(height-y)*row),y*row);
  for(let i=0;i<result.data.length;i+=4){const alpha=result.data[i+3]/255;for(let c=0;c<3;c++)result.data[i+c]=Math.round(result.data[i+c]*alpha+[243,244,241][c]*(1-alpha));result.data[i+3]=255;}
  context.putImageData(result,0,0);
  for(const quality of [.9,.85,.75,.65]){const image=canvas.toDataURL('image/jpeg',quality);if(image.length<1800000)return image;}
  throw new Error('The reference picture is too large. Please try again.');
 }finally{scene.background=background;gl.setClearColor(oldColor,oldAlpha);gl.setRenderTarget(oldTarget);display.dispose();target.dispose();output.dispose();}
}
