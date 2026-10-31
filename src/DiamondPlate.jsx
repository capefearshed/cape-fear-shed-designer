import React,{useMemo,useLayoutEffect,useEffect,useRef} from 'react';
import {Shape,ExtrudeGeometry,Object3D,CanvasTexture,RepeatWrapping} from 'three';
import {diamondTreadLayout} from './rollupGeometry.js';

export default function DiamondPlate({width,depth,thickness}){
 const ribs=useRef(null);
 const treads=useMemo(()=>diamondTreadLayout(width,depth),[width,depth]);
 const geometry=useMemo(()=>{
  const length=1.1/12,halfWidth=.13/12,shape=new Shape();
  shape.moveTo(-length/2,0);
  shape.quadraticCurveTo(-length*.23,halfWidth,length*.23,halfWidth);
  shape.quadraticCurveTo(length/2,halfWidth*.6,length/2,0);
  shape.quadraticCurveTo(length*.23,-halfWidth,-length*.23,-halfWidth);
  shape.quadraticCurveTo(-length/2,-halfWidth*.6,-length/2,0);
  const g=new ExtrudeGeometry(shape,{depth:.025/12,bevelEnabled:true,bevelThickness:.015/12,bevelSize:.025/12,bevelSegments:2,curveSegments:6,steps:1});
  g.rotateX(-Math.PI/2);return g;
 },[]);
 const brushed=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#c3c3c3';ctx.fillRect(0,0,256,128);
  let seed=73;
  for(let y=0;y<128;y++){
   seed=(seed*1664525+1013904223)>>>0;const tone=175+(seed%30);
   ctx.fillStyle=`rgb(${tone},${tone},${tone})`;ctx.fillRect(0,y,256,1);
  }
  const texture=new CanvasTexture(canvas);texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(width*2,depth*2);return texture;
 },[width,depth]);
 useLayoutEffect(()=>{
  const dummy=new Object3D();
  treads.forEach(({x,z,angle},i)=>{dummy.position.set(x,thickness/2+.0015,z);dummy.rotation.set(0,angle,0);dummy.updateMatrix();ribs.current.setMatrixAt(i,dummy.matrix);});
  ribs.current.instanceMatrix.needsUpdate=true;ribs.current.computeBoundingSphere();
 },[treads,thickness]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useEffect(()=>()=>brushed.dispose(),[brushed]);
 return <group>
  <mesh receiveShadow><boxGeometry args={[width,thickness,depth]}/><meshStandardMaterial color="#c6cdd1" metalness={.7} roughness={.36} bumpMap={brushed} bumpScale={.00025}/></mesh>
  <instancedMesh ref={ribs} args={[geometry,undefined,treads.length]} receiveShadow>
   <meshStandardMaterial color="#d2d8db" metalness={.78} roughness={.3}/>
  </instancedMesh>
 </group>;
}
