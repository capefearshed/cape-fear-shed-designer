import React,{useRef,useLayoutEffect} from 'react';
import {Matrix4} from 'three';
import {cutWallGeometry} from './wallCutout.js';

export default function SidingCutout({holes,battenHoles=holes,children}){
 const root=useRef(null);
 useLayoutEffect(()=>{
  if(!holes.length)return;
  root.current.updateWorldMatrix(true,true);
  const inverse=new Matrix4().copy(root.current.matrixWorld).invert(),changed=[];
  root.current.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.geometry.attributes.position)return;
   const original=mesh.geometry;
   let node=mesh,batten=false;while(node&&node!==root.current){batten ||= Boolean(node.userData?.batten);node=node.parent;}
   const cut=cutWallGeometry(original,new Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),batten?battenHoles:holes);
   mesh.geometry=cut;changed.push({mesh,original,cut});
  });
  return ()=>changed.forEach(({mesh,original,cut})=>{if(mesh.geometry===cut)mesh.geometry=original;cut.dispose();});
 },[holes,battenHoles,children]);
 return <group ref={root}>{children}</group>;
}
