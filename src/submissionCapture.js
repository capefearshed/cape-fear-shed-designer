import {wallCameraFit} from './wallLayout.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {Box3,Vector3,OrthographicCamera,PerspectiveCamera,WebGLRenderTarget,HalfFloatType,Color} from 'three';

export const IMAGE_VIEWS=['render','front','left','back','right'];
export const IMAGE_WIDTH=1500,IMAGE_HEIGHT=1000;
// The same world-unit scale on every elevation. The widest elevation fills 80%.
export function elevationCameras(bounds){
 const size=bounds.getSize(new Vector3()),center=bounds.getCenter(new Vector3());
 const halfHeight=Math.max(size.y,Math.max(size.x,size.z)/1.5)/1.6;
 const distance=Math.max(size.x,size.y,size.z)*3+10;
 return ['front','left','back','right'].map(view=>{
  const camera=new OrthographicCamera(-halfHeight*1.5,halfHeight*1.5,halfHeight,-halfHeight,.1,distance*3);
  const direction={front:[0,0,1],left:[-1,0,0],back:[0,0,-1],right:[1,0,0]}[view];
  camera.position.copy(center).addScaledVector(new Vector3(...direction),distance);
  camera.lookAt(center);camera.updateMatrixWorld(true);return {view,camera};
 });
}
// Quote pictures use the approved designer wall view, including its perspective.
export function quoteWallCameras(object){
 return ['front','left','back','right'].map(view=>{
  const camera=new PerspectiveCamera(39,IMAGE_WIDTH/IMAGE_HEIGHT,.1,1000);
  const fit=wallCameraFit(camera,object,view);
  camera.position.set(fit.center.x+Math.sin(fit.angle)*fit.radius,fit.center.y,fit.center.z+Math.cos(fit.angle)*fit.radius);
  camera.lookAt(fit.center);camera.updateMatrixWorld(true);return {view,camera};
 });
}
export async function captureSubmissionImages(state,object,lastRender=null,renderSource=null){
 let renderedImage=null;
 if(lastRender){renderedImage=new Image();renderedImage.src=lastRender;await renderedImage.decode();}
 const {gl,scene}=state,rotation=object.rotation.clone(),visibility=scene.children.map(node=>[node,node.visible]);
 const shadowEnabled=gl.shadowMap.enabled,oldTarget=gl.getRenderTarget(),oldColor=gl.getClearColor(new Color()).clone(),oldAlpha=gl.getClearAlpha();
 const background=scene.background;
 // Render linear HDR first, then apply the SAME display transform as the viewer.
 // Reading a scene render target directly bypasses Three's tone mapping/output conversion.
 const target=new WebGLRenderTarget(IMAGE_WIDTH,IMAGE_HEIGHT,{type:HalfFloatType,samples:4});
 const output=new WebGLRenderTarget(IMAGE_WIDTH,IMAGE_HEIGHT,{depthBuffer:false});
 const display=new OutputPass();
 const canvases=[];
 try{
  object.visible=true;object.updateWorldMatrix(true,true);
  for(const [node] of visibility)if(node!==object&&!node.isLight)node.visible=false;
  scene.background=null;gl.setClearColor('#F3F4F1',0);gl.shadowMap.enabled=shadowEnabled;
  const bounds=new Box3().setFromObject(object),elevations=quoteWallCameras(object);
  const center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3());
  const camera=new PerspectiveCamera(39,1.5,.1,1000);
  const direction=new Vector3(1,.65,1).normalize();let distance=Math.max(size.x,size.y,size.z);
  const corners=[];for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])corners.push(new Vector3(x,y,z));
  do{distance*=1.08;camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld(true);}while(corners.some(p=>{const v=p.clone().project(camera);return Math.abs(v.x)>.8||Math.abs(v.y)>.8;}));
  for(const {view,camera:shotCamera} of [{view:'render',camera},...elevations]){
   const canvas=document.createElement('canvas');canvas.width=IMAGE_WIDTH;canvas.height=IMAGE_HEIGHT;const context=canvas.getContext('2d');
   if(view==='render'&&renderedImage){
    context.fillStyle='#F3F4F1';context.fillRect(0,0,IMAGE_WIDTH,IMAGE_HEIGHT);
    const scale=Math.min(IMAGE_WIDTH/renderedImage.width,IMAGE_HEIGHT/renderedImage.height),w=renderedImage.width*scale,h=renderedImage.height*scale;
    context.drawImage(renderedImage,(IMAGE_WIDTH-w)/2,(IMAGE_HEIGHT-h)/2,w,h);
   }else{
    gl.setRenderTarget(target);gl.render(scene,shotCamera);
    display.render(gl,output,target);
    const pixels=new Uint8Array(IMAGE_WIDTH*IMAGE_HEIGHT*4);gl.readRenderTargetPixels(output,0,0,IMAGE_WIDTH,IMAGE_HEIGHT,pixels);
    const result=context.createImageData(IMAGE_WIDTH,IMAGE_HEIGHT),row=IMAGE_WIDTH*4;
    for(let y=0;y<IMAGE_HEIGHT;y++)result.data.set(pixels.subarray((IMAGE_HEIGHT-y-1)*row,(IMAGE_HEIGHT-y)*row),y*row);
    // Composite transparent edges onto the exact required plain background.
    for(let i=0;i<result.data.length;i+=4){const alpha=result.data[i+3]/255;for(let c=0;c<3;c++)result.data[i+c]=Math.round(result.data[i+c]*alpha+[243,244,241][c]*(1-alpha));result.data[i+3]=255;}
    context.putImageData(result,0,0);
   }
   canvases.push({view,canvas});
  }
  // Preserve dimensions and reduce quality only if needed for the JSON body.
  for(const quality of [.85,.75,.65,.55,.45,.35]){
   const images=canvases.map(({view,canvas})=>({view,...(view==='render'&&renderSource?{source:renderSource}:{}),type:'image/jpeg',data:canvas.toDataURL('image/jpeg',quality)}));
   if(new TextEncoder().encode(JSON.stringify(images)).length<3600000&&images.every(i=>i.data.length*3/4<1000000))return images;
  }
  throw new Error('The design pictures are too large. Please try again without a backyard photo.');
 }finally{
  display.dispose();output.dispose();
  object.rotation.copy(rotation);for(const [node,visible] of visibility)node.visible=visible;
  object.updateWorldMatrix(true,true);scene.background=background;gl.shadowMap.enabled=shadowEnabled;
  gl.setClearColor(oldColor,oldAlpha);gl.setRenderTarget(oldTarget);target.dispose();gl.render(scene,state.camera);
 }
}
