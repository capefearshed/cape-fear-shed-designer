import {Vector3,Box3} from 'three';
export function frameBackyardCamera(camera,object,openings=[]){
 object.updateWorldMatrix(true,true);
 const box=new Box3().setFromObject(object);
 if(box.isEmpty())throw new Error('Shed is not ready');
 const center=box.getCenter(new Vector3());
 const corners=[['front','right',1,1],['front','left',-1,1],['back','right',1,-1],['back','left',-1,-1]];
 const doors=openings.filter(o=>o.kind==='door');
 const candidates=doors.length?corners.filter(c=>doors.some(o=>c.includes(o.wall))):corners;
 const score=c=>openings.reduce((n,o)=>n+(c.includes(o.wall)?(o.kind==='door'?100:10):0),0);
 const best=candidates.reduce((best,c)=>score(c)>score(best)?c:best,candidates[0]);
 const direction=new Vector3(best[2],.65,best[3]).normalize().applyAxisAngle(new Vector3(0,1,0),object.rotation.y);
 camera.position.copy(center).add(direction);camera.lookAt(center);camera.updateMatrixWorld(true);
 const right=new Vector3(1,0,0).applyQuaternion(camera.quaternion),up=new Vector3(0,1,0).applyQuaternion(camera.quaternion);
 const halfV=Math.tan(camera.fov*Math.PI/360),halfH=halfV*camera.aspect;
 let distance=0;
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const point=new Vector3(x,y,z).sub(center),depth=point.dot(direction);
  distance=Math.max(distance,depth+Math.abs(point.dot(right))*1.18/halfH,depth+Math.abs(point.dot(up))*1.18/halfV);
 }
 camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld(true);
 return center;
}
