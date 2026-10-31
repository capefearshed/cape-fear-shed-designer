import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {roofDimensions} from './shedGeometry.js';
import {metalProfile,rakeStripData,ridgeCapSection,METAL_TRIM} from './metalRoofGeometry.js';
export {METAL_COLORS} from './metalColors.js';
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
function FoldedRake({end,length,color}){
 const geometry=useMemo(()=>{
  const {vertices,indices}=rakeStripData(end,length);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[end,length]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={color} metalness={.45} roughness={.46} side={THREE.DoubleSide}/></mesh>;
}
function WhiteEaveEdge({length,edge,side}){
 return <group>
  <Box at={[0,-.002,edge-side*2.25/24]} size={[length,.012/12,2.25/12]} color="#F2F0EB" metal/>
  <Box at={[0,-1.5/24,edge+side*.018]} size={[length,1.5/12,.012/12]} color="#F2F0EB" metal/>
  <Box at={[0,-1.5/12,edge+side*.025]} size={[length,.012/12,.035]} color="#F2F0EB" metal/>
 </group>;
}
export default function MetalRoof({w,l,pitch,wall,trim,color='#BFC4C5',overhangInches=4}){
 const d=roofDimensions(w,l,pitch,wall,overhangInches);
 const dripOffset=.018,extension=dripOffset+METAL_TRIM.eaveProjectionIn/12,capLength=d.roofLength+.012;
 const ridge=useMemo(()=>{
  const vertices=[],indices=[],section=ridgeCapSection(d.angle);
  for(let i=0;i<section.length-1;i++){const [z,y]=section[i],[nextZ,nextY]=section[i+1],offset=vertices.length/3;vertices.push(-capLength/2,y,z,capLength/2,y,z,capLength/2,nextY,nextZ,-capLength/2,nextY,nextZ);indices.push(offset,offset+2,offset+1,offset,offset+3,offset+2);}
  // Folded end tabs close the gap between the cap and the two roof slopes.
  // Each end is folded down in the rake plane rather than leaving an open cap.
  const polygon=[...section.map(([z,y])=>new THREE.Vector2(z,y)),new THREE.Vector2(7/12,.035-7/12*Math.tan(d.angle)),new THREE.Vector2(0,.035),new THREE.Vector2(-7/12,.035-7/12*Math.tan(d.angle))];
  const triangles=THREE.ShapeUtils.triangulateShape(polygon,[]);
  for(const end of [-1,1]){
   const offset=vertices.length/3;
   for(const p of polygon)vertices.push(end*capLength/2,p.y,p.x);
   for(const triangle of triangles)indices.push(...triangle.map(i=>offset+i));
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[capLength,d.angle]);
 useEffect(()=>()=>ridge.dispose(),[ridge]);
 return <group>
  {[-1,1].map(side=><group key={side} position={[0,(d.ridgeY+d.eaveY)/2,side*d.run/2]} rotation={[side*d.angle,0,0]}>
   <Box at={[0,-.045,0]} size={[d.roofLength,.09,d.slope]} color={trim}/>
   <group position={[0,0,side*extension/2]}><RibbedSheet length={d.roofLength} slope={d.slope+extension} color={color}/></group>
   {[-1,1].map(end=><group key={end} position={[end*capLength/2,.11,side*extension/2]}><FoldedRake end={end} length={d.slope+extension} color={color}/></group>)}
   <WhiteEaveEdge length={d.roofLength} edge={side*d.slope/2} side={side}/>
  </group>)}
  <mesh position={[0,d.ridgeY,0]} geometry={ridge} castShadow receiveShadow><meshStandardMaterial color={color} metalness={.45} roughness={.46} side={THREE.DoubleSide}/></mesh>
 </group>;
}
