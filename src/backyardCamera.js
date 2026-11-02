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
 const extent=Math.max(box.max.x-box.min.x,box.max.z-box.min.z,box.max.y-box.min.y);
 function fit(distance){
  camera.position.copy(center).addScaledVector(direction,distance);camera.position.y=eyeHeight;
  const target=center.clone();
  // Center the projected bounds, rather than the perspective-skewed world center.
  for(let i=0;i<8;i++){
   camera.lookAt(target);camera.updateMatrixWorld(true);
   const projected=points.map(point=>point.clone().project(camera));
   const midpoint=(Math.min(...projected.map(p=>p.x))+Math.max(...projected.map(p=>p.x)))/2;
   const right=new Vector3().setFromMatrixColumn(camera.matrixWorld,0);
   target.addScaledVector(right,midpoint*camera.position.distanceTo(target)*Math.tan(camera.fov*Math.PI/360)*camera.aspect);
  }
  camera.lookAt(target);camera.updateMatrixWorld(true);
  return points.every(point=>{const p=point.clone().project(camera);return p.z>-1&&p.z<1&&Math.abs(p.x)<.86&&Math.abs(p.y)<.86;});
 }
 let low=extent*.25,high=extent*2;
 for(let i=0;i<20&&!fit(high);i++)high*=1.5;
 if(!fit(high))throw new Error('Could not frame the shed');
 for(let i=0;i<32;i++){const mid=(low+high)/2;if(fit(mid))high=mid;else low=mid;}
 fit(high);return center;
}
