import {Box3,Matrix4,Vector3} from 'three';
// Fit the whole building elevation, independent of the selected opening.
export function wallCameraFit(camera,object,wall){
 object.updateWorldMatrix(true,true);
 const inverse=new Matrix4().copy(object.matrixWorld).invert(),bounds=new Box3();
 object.traverse(node=>{
  if(!node.isMesh||!node.geometry)return;
  if(!node.geometry.boundingBox)node.geometry.computeBoundingBox();
  const b=node.geometry.boundingBox,matrix=new Matrix4().multiplyMatrices(inverse,node.matrixWorld);
  for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])bounds.expandByPoint(new Vector3(x,y,z).applyMatrix4(matrix));
 });
 if(bounds.isEmpty())return null;
 const center=bounds.getCenter(new Vector3()).applyMatrix4(object.matrixWorld);
 const long=wall==='front'||wall==='back';
 const span=long?bounds.max.x-bounds.min.x:bounds.max.z-bounds.min.z;
 const depth=long?bounds.max.z-bounds.min.z:bounds.max.x-bounds.min.x;
 const height=bounds.max.y-bounds.min.y,tanV=Math.tan(camera.fov*Math.PI/360),tanH=tanV*camera.aspect;
 // Eight percent edge clearance. Both width and height constrain the distance.
 const radius=depth/2+Math.max(span/(2*tanH),height/(2*tanV))*1.16;
 return {center,radius,angle:({front:0,back:Math.PI,right:Math.PI/2,left:-Math.PI/2}[wall]||0)+object.rotation.y};
}
