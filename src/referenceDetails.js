import {Box3,Vector3} from 'three';
// Normalized bounds refer to the exact full-reference camera, including rotation.
function projectedBounds(box,camera){
 if(box.isEmpty())return undefined;
 const points=[];
 for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
  const point=new Vector3(x,y,z).project(camera);
  if(point.z<=-1||point.z>=1)return undefined;
  points.push({x:(point.x+1)/2,y:(1-point.y)/2});
 }
 const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
 // Skip cropped/off-camera dormers rather than providing an ambiguous detail.
 if(left<0||top<0||right>1||bottom>1)return undefined;
 const pad=.015,x=Math.max(0,left-pad),y=Math.max(0,top-pad);
 return {x,y,width:Math.min(1,right+pad)-x,height:Math.min(1,bottom+pad)-y};
}

export function referenceDetails(object,camera){
 object.updateWorldMatrix(true,true);camera.updateMatrixWorld(true);
 let dormer;const transoms=new Box3(),cameraPosition=camera.getWorldPosition(new Vector3());
 object.traverse(node=>{
  if(node.userData?.photoDetail==='dormer')dormer=node;
  if(node.userData?.photoDetail==='door-transom'){
   const towardCamera=cameraPosition.clone().sub(node.getWorldPosition(new Vector3()));
   // Never supply a detail for the far wall hidden behind the shed.
   if(node.getWorldDirection(new Vector3()).dot(towardCamera)>0)transoms.union(new Box3().setFromObject(node));
  }
 });
 const details={};
 const dormerBounds=dormer&&projectedBounds(new Box3().setFromObject(dormer),camera);
 const transomBounds=projectedBounds(transoms,camera);
 if(dormerBounds)details.dormer=dormerBounds;
 if(transomBounds)details.doorTransoms=transomBounds;
 return Object.keys(details).length?details:undefined;
}
