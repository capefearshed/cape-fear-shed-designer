import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {roofDimensions} from './shedGeometry.js';
import {metalProfile} from './metalRoofGeometry.js';
export const METAL_COLORS=[['slate','Slate Gray','#747f82'],['black','Black','#303437'],['bronze','Bronze','#887a65']];
function Box({at,size,color,metal=false}){return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal?.45:0} roughness={metal?.46:.9}/></mesh>;}
function RibbedSheet({length,slope,color}){
 const geometry=useMemo(()=>{
  const profile=metalProfile(length),vertices=[],indices=[];
  for(let i=0;i<profile.length-1;i++){
   const [x,y]=profile[i],[nextX,nextY]=profile[i+1],offset=vertices.length/3;
   vertices.push(x,y,-slope/2,x,y,slope/2,nextX,nextY,slope/2,nextX,nextY,-slope/2);
   indices.push(offset,offset+1,offset+2,offset,offset+2,offset+3);
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[length,slope]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} position={[0,.035,0]} castShadow receiveShadow><meshStandardMaterial color={color} metalness={.45} roughness={.46} side={THREE.DoubleSide}/></mesh>;
}
export default function MetalRoof({w,l,pitch,wall,trim,color='#747f82',overhangInches=4}){
 const d=roofDimensions(w,l,pitch,wall,overhangInches);
 const ridge=useMemo(()=>{
  const vertices=[],indices=[],section=[[-7/12,-7/12*Math.tan(d.angle)+.11],[-.08,.12],[0,.13],[.08,.12],[7/12,-7/12*Math.tan(d.angle)+.11]];
  for(let i=0;i<section.length-1;i++){const [z,y]=section[i],[nextZ,nextY]=section[i+1],offset=vertices.length/3;vertices.push(-d.roofLength/2,y,z,d.roofLength/2,y,z,d.roofLength/2,nextY,nextZ,-d.roofLength/2,nextY,nextZ);indices.push(offset,offset+2,offset+1,offset,offset+3,offset+2);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[d.roofLength,d.angle]);
 useEffect(()=>()=>ridge.dispose(),[ridge]);
 return <group>
  {[-1,1].map(side=><group key={side} position={[0,(d.ridgeY+d.eaveY)/2,side*d.run/2]} rotation={[side*d.angle,0,0]}>
   <Box at={[0,-.045,0]} size={[d.roofLength,.09,d.slope]} color={trim}/>
   <RibbedSheet length={d.roofLength} slope={d.slope} color={color}/>
   {[-1,1].map(end=><Box key={end} at={[end*(d.roofLength/2+.006),-.035,0]} size={[.025,3/12,d.slope+.015]} color={color} metal/>)}
   <Box at={[0,-.04,side*d.slope/2]} size={[d.roofLength,2/12,.025]} color={color} metal/>
  </group>)}
  <mesh position={[0,d.ridgeY,0]} geometry={ridge} castShadow receiveShadow><meshStandardMaterial color={color} metalness={.45} roughness={.46} side={THREE.DoubleSide}/></mesh>
 </group>;
}
