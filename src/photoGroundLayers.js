import {Scene,Group,Mesh,PlaneGeometry,MeshStandardMaterial,MeshBasicMaterial,ShadowMaterial,DirectionalLight,CanvasTexture,RepeatWrapping,SRGBColorSpace,DoubleSide,PCFSoftShadowMap,Box3,Vector3} from 'three';
import {captureSceneCanvas} from './captureCanvas.js';
import {CUTOUT_WIDTH,CUTOUT_HEIGHT} from './shedCutout.js';
import {FLOOR_HEIGHT} from './shedGeometry.js';

export function groundHeight(design,object){
 return design.foundation==='slab'?FLOOR_HEIGHT-5/12:new Box3().setFromObject(object).min.y;
}
export function pathPlacements(design,object){
 object.updateWorldMatrix(true,true);
 return (design.openings||[]).filter(o=>o.kind==='door').map(door=>{
  const long=['front','back'].includes(door.wall),offset=door.x/12-(long?design.length:design.width)/2;
  const angle={front:0,back:Math.PI,right:Math.PI/2,left:-Math.PI/2}[door.wall];
  const outward=new Vector3(Math.sin(angle),0,Math.cos(angle));
  const origin=new Vector3(long?offset:Math.sign(outward.x)*design.length/2,0,long?Math.sign(outward.z)*design.width/2:offset);
  let start=0;
  // Read the real selected ramp's geometry, including opening/siding offsets.
  // Never guess a nominal three-foot ramp or move the path toward the camera.
  if(door.ramp&&design.foundation!=='slab')object.traverse(ramp=>{
   if(!door.id||ramp.userData?.photoRampId!==door.id)return;
   ramp.traverse(mesh=>{
    const positions=mesh.geometry?.attributes?.position;if(!positions)return;
    for(let i=0;i<positions.count;i++){
     const local=object.worldToLocal(new Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld));
     start=Math.max(start,local.sub(origin).dot(outward));
    }
   });
  });
  return {origin,angle,start,width:door.width/12};
 });
}
// A repeatable four-foot material tile. Its stone pattern varies, never its path edges.
export function pathTexture(setting){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
 const ctx=canvas.getContext('2d');let seed=12437;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 ctx.fillStyle='#827e71';ctx.fillRect(0,0,512,512);
 if(setting==='lawn'){
  for(let i=0;i<18000;i++){
   const gray=100+Math.floor(random()*75);ctx.fillStyle=`rgb(${gray},${gray},${gray-4})`;
   const x=random()*512,y=random()*512,r=1+random()*3;ctx.fillRect(x,y,r,r);
  }
 }else{
  const rows=setting==='garden'?5:2,cols=setting==='garden'?4:2;
  for(let row=-1;row<=rows;row++)for(let col=-1;col<=cols;col++){
   const w=512/cols,h=512/rows,x=col*w+(row%2)*w/2,y=row*h,gap=3;
   const shade=163+Math.floor(random()*35);ctx.fillStyle=`rgb(${shade},${shade-5},${shade-15})`;
   ctx.beginPath();ctx.moveTo(x+gap+random()*8,y+gap);ctx.lineTo(x+w-gap,y+gap+random()*7);ctx.lineTo(x+w-gap-random()*7,y+h-gap);ctx.lineTo(x+gap,y+h-gap-random()*7);ctx.closePath();ctx.fill();
  }
  for(let i=0;i<15000;i++){
   ctx.fillStyle=random()>.5?'rgba(255,255,255,.035)':'rgba(30,25,20,.025)';ctx.fillRect(random()*512,random()*512,1+random()*5,1+random()*3);
  }
 }
 const texture=new CanvasTexture(canvas);texture.wrapS=texture.wrapT=RepeatWrapping;texture.colorSpace=SRGBColorSpace;texture.anisotropy=8;
 return texture;
}
export function createPathLayerScene(design,object,sourceScene,setting){
 const scene=new Scene(),root=new Group();root.matrixAutoUpdate=false;root.matrix.copy(object.matrixWorld);scene.add(root);
 const resources=[];
 for(const placement of pathPlacements(design,object)){
  const length=200,texture=pathTexture(setting);texture.repeat.set(placement.width/4,length/4);
  const material=new MeshStandardMaterial({map:texture,roughness:1,side:DoubleSide});
  const geometry=new PlaneGeometry(placement.width,length),plane=new Mesh(geometry,material),group=new Group();
  group.position.copy(placement.origin);group.position.y=groundHeight(design,object)+.003;group.rotation.y=placement.angle;
  plane.rotation.x=-Math.PI/2;plane.position.z=placement.start+length/2;group.add(plane);root.add(group);resources.push(texture,material,geometry);
 }
 for(const source of sourceScene.children.filter(o=>o.isLight)){
  const light=source.clone();light.castShadow=false;scene.add(light);
 }
 return {scene,dispose:()=>resources.forEach(r=>r.dispose())};
}
export function createShadowLayerScene(design,object){
 const scene=new Scene(),bounds=new Box3().setFromObject(object),center=bounds.getCenter(new Vector3());
 const size=bounds.getSize(new Vector3()),extent=Math.max(size.x,size.y,size.z);
 const caster=object.clone(true),hiddenMaterial=new MeshBasicMaterial({colorWrite:false,depthWrite:false,side:DoubleSide});
 caster.matrixAutoUpdate=false;caster.matrix.copy(object.matrixWorld);caster.visible=true;
 caster.traverse(node=>{if(node.isMesh){node.material=hiddenMaterial;node.castShadow=true;node.receiveShadow=false;}});
 scene.add(caster);
 // Match the viewer's principal directional light, independently of siding flags.
 const light=new DirectionalLight(0xffffff,1);light.position.copy(center).addScaledVector(new Vector3(9,20,12).normalize(),extent*3);
 light.target.position.copy(center);light.castShadow=true;light.shadow.mapSize.set(2048,2048);
 Object.assign(light.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:.1,far:extent*7});
 light.shadow.camera.updateProjectionMatrix();light.shadow.normalBias=.005;light.shadow.bias=-.00002;light.shadow.radius=3;
 scene.add(light,light.target);
 const geometry=new PlaneGeometry(400,400),material=new ShadowMaterial({color:0x000000,opacity:.48});
 const ground=new Mesh(geometry,material);ground.rotation.x=-Math.PI/2;ground.position.y=groundHeight(design,object);ground.receiveShadow=true;scene.add(ground);
 return {scene,dispose(){geometry.dispose();material.dispose();hiddenMaterial.dispose();light.shadow.map?.dispose();light.shadow.mapPass?.dispose();}};
}
export function blackShadowPixels(pixels){
 for(let i=0;i<pixels.length;i+=4)pixels[i]=pixels[i+1]=pixels[i+2]=0;
 return pixels;
}
export function captureGroundLayers(state,camera,object,design,setting='coastal'){
 let path,shadow;
 const saved={enabled:state.gl.shadowMap.enabled,type:state.gl.shadowMap.type,autoUpdate:state.gl.shadowMap.autoUpdate,needsUpdate:state.gl.shadowMap.needsUpdate};
 try{
  path=createPathLayerScene(design,object,state.scene,setting);shadow=createShadowLayerScene(design,object);
  const pathCanvas=captureSceneCanvas({...state,scene:path.scene},camera,CUTOUT_WIDTH,CUTOUT_HEIGHT,null,{allowEmpty:true});
  state.gl.shadowMap.enabled=true;state.gl.shadowMap.type=PCFSoftShadowMap;state.gl.shadowMap.autoUpdate=true;state.gl.shadowMap.needsUpdate=true;
  const shadowCanvas=captureSceneCanvas({...state,scene:shadow.scene},camera,CUTOUT_WIDTH,CUTOUT_HEIGHT,null,{allowEmpty:true});
  const ctx=shadowCanvas.getContext('2d'),pixels=ctx.getImageData(0,0,CUTOUT_WIDTH,CUTOUT_HEIGHT);blackShadowPixels(pixels.data);ctx.putImageData(pixels,0,0);
  return {pathLayer:pathCanvas.toDataURL('image/png'),shadowLayer:shadowCanvas.toDataURL('image/png')};
 }finally{Object.assign(state.gl.shadowMap,saved);path?.dispose();shadow?.dispose();}
}
