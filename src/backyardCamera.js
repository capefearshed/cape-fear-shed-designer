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
 // Human eye height and a shallow three-quarter angle, rather than a roof view.
 const primary=doors.find(o=>best.includes(o.wall))?.wall||best[0];
 const direction=new Vector3(best[2]*(primary==='front'||primary==='back'?.48:1),0,best[3]*(primary==='left'||primary==='right'?.48:1)).normalize().applyAxisAngle(new Vector3(0,1,0),object.rotation.y);
 const points=[];
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new Vector3(x,y,z));
 const eyeHeight=box.min.y+5.5;
 let distance=Math.max(box.max.x-box.min.x,box.max.z-box.min.z,box.max.y-box.min.y)*1.5;
 for(let i=0;i<80;i++){
  camera.position.copy(center).addScaledVector(direction,distance);camera.position.y=eyeHeight;
  camera.lookAt(center);camera.updateMatrixWorld(true);
  if(points.every(point=>{const p=point.clone().project(camera);return p.z>-1&&p.z<1&&Math.abs(p.x)<.84&&Math.abs(p.y)<.84;}))return center;
  distance*=1.08;
 }
 throw new Error('Could not frame the shed');
}
