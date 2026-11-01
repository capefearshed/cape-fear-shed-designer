import {useLayoutEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Box3,Vector3} from 'three';
import {frameBackyardCamera} from './backyardCamera.js';
export default function ChoiceCamera({active,focus,objectRef,controlsRef,shapeKey}){
 const {camera,size}=useThree(),goal=useRef(null);
 useLayoutEffect(()=>{
  if(!active||!objectRef.current){goal.current=null;return;}
  const object=objectRef.current,preview=camera.clone();let target;
  if(focus==='roof'){
   const bounds=new Box3().setFromObject(object);target=bounds.getCenter(new Vector3());
   const direction=new Vector3(.65,1.1,1).normalize().applyAxisAngle(new Vector3(0,1,0),object.rotation.y),points=[];
   for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z])points.push(new Vector3(x,y,z));
   let distance=bounds.getSize(new Vector3()).length();
   for(let i=0;i<80;i++){preview.position.copy(target).addScaledVector(direction,distance);preview.lookAt(target);preview.updateMatrixWorld(true);if(points.every(p=>{const q=p.clone().project(preview);return Math.abs(q.x)<.84&&Math.abs(q.y)<.84;}))break;distance*=1.08;}
  }else target=frameBackyardCamera(preview,object);
  goal.current={position:preview.position.clone(),target};
 },[active,focus,shapeKey,size.width,size.height,camera]);
 useFrame((_,delta)=>{if(!active||!goal.current)return;const step=1-Math.exp(-5*Math.min(delta,.1));camera.position.lerp(goal.current.position,step);if(controlsRef.current){controlsRef.current.target.lerp(goal.current.target,step);controlsRef.current.update();}else camera.lookAt(goal.current.target);if(camera.position.distanceTo(goal.current.position)<.01&&(!controlsRef.current||controlsRef.current.target.distanceTo(goal.current.target)<.01))goal.current=null;});
 return null;
}
