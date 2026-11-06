import {captureSceneCanvas} from './captureCanvas.js';
import {showReferenceExterior} from './referenceValidation.js';
export const CUTOUT_WIDTH=1536,CUTOUT_HEIGHT=1024;
// Scan rendered alpha, never RGB: white doors and trim are legitimate foreground.
export function cutoutBounds(pixels,width,height){
 let left=width,top=height,right=-1,bottom=-1,clear=0,opaque=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const alpha=pixels[(y*width+x)*4+3];
  if(alpha===0)clear++;
  if(alpha===255)opaque++;
  if(alpha>0){left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
 }
 if(right<0||!clear||!opaque)throw new Error('The transparent shed capture is invalid. Please try again.');
 return {x:left/width,y:top/height,width:(right-left+1)/width,height:(bottom-top+1)/height};
}
export function captureShedCutout(state,camera,object,{separateUpload=false}={}){
 const restore=showReferenceExterior(state.scene,object);
 try{
  // Browser canvas serialization supplies straight-alpha PNG/WebP. No manual
  // unpremultiplication (which would damage antialiased edges).
  const canvas=captureSceneCanvas(state,camera,CUTOUT_WIDTH,CUTOUT_HEIGHT,null);
  const bounds=cutoutBounds(canvas.getContext('2d').getImageData(0,0,CUTOUT_WIDTH,CUTOUT_HEIGHT).data,CUTOUT_WIDTH,CUTOUT_HEIGHT);
  const image=canvas.toDataURL('image/png');
  if(image.length>(separateUpload?11184834:2800000))throw new Error('The transparent shed picture is too large. Please try again.');
  return {image,metadata:{version:'cfs-cutout-v1',width:CUTOUT_WIDTH,height:CUTOUT_HEIGHT,sameCameraAsShedImage:true,bounds}};
 }finally{restore();}
}
