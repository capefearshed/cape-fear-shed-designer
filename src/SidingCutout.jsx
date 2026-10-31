import React,{useRef,useLayoutEffect} from 'react';
import {Matrix4} from 'three';
import {cutWallGeometry} from './wallCutout.js';

export default function SidingCutout({holes,children}){
 const root=useRef(null);
 useLayoutEffect(()=>{
  if(!holes.length)return;
  root.current.updateWorldMatrix(true,true);
  const inverse=new Matrix4().copy(root.current.matrixWorld).invert(),changed=[];
  root.current.traverse(mesh=>{
   if(!mesh.isMesh||!mesh.geometry.attributes.position)return;
   const original=mesh.geometry;
   const cut=cutWallGeometry(original,new Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),holes);
   mesh.geometry=cut;changed.push({mesh,original,cut});
  });
  return ()=>changed.forEach(({mesh,original,cut})=>{if(mesh.geometry===cut)mesh.geometry=original;cut.dispose();});
 },[holes,children]);
 return <group ref={root}>{children}</group>;
}
