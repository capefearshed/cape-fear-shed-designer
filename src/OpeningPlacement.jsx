import React,{useRef} from 'react';
import {Matrix4,Plane,Vector3} from 'three';
export default function OpeningPlacement({position,rotation,o,onSelect,onMove,children}){
 const root=useRef(null),drag=useRef(null);
 function begin(e){
  if(!onMove)return;e.stopPropagation();onSelect(o.id);
  root.current.updateWorldMatrix(true,false);
  const inverse=new Matrix4().copy(root.current.matrixWorld).invert(),point=e.point.clone().applyMatrix4(inverse);
  const normal=new Vector3(0,0,1).transformDirection(root.current.matrixWorld),origin=new Vector3().setFromMatrixPosition(root.current.matrixWorld);
  drag.current={id:e.pointerId,x:o.x,localX:point.x,inverse,plane:new Plane().setFromNormalAndCoplanarPoint(normal,origin)};
  e.target.setPointerCapture(e.pointerId);
 }
 function move(e){
  const d=drag.current;if(!d||d.id!==e.pointerId)return;e.stopPropagation();
  const point=e.ray.intersectPlane(d.plane,new Vector3());if(!point)return;
  point.applyMatrix4(d.inverse);const sign=o.wall==='back'||o.wall==='right'?-1:1;
  onMove(o.id,d.x+(point.x-d.localX)*12*sign);
 }
 function end(e){if(drag.current?.id!==e.pointerId)return;e.stopPropagation();drag.current=null;e.target.releasePointerCapture(e.pointerId);}
 return <group ref={root} position={position} rotation={rotation} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onClick={e=>{e.stopPropagation();onSelect(o.id);}}>{children}</group>;
}
