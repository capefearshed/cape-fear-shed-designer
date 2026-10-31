import DiamondPlate from './DiamondPlate.jsx';
import {rollupThreshold} from './rollupGeometry.js';
import React,{useMemo,useEffect} from 'react';
import {BufferGeometry,Float32BufferAttribute} from 'three';

function Box({at,size,color='#F2F0EB',metalness=.25,map}){
 return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metalness} roughness={.5} map={map} bumpMap={map} bumpScale={map?.008:0}/></mesh>;
}
export default function RollupDoor({width,height,trim,recess=4/12,floorOffset=0}){
 const threshold=rollupThreshold(recess,floorOffset);
 const geometry=useMemo(()=>{
  const vertices=[],indices=[],rows=Math.ceil(height/(2.5/12));
  for(let i=0;i<=rows*4;i++){
   const y=-height/2+height*i/(rows*4),phase=i%4;
   const z=-recess-(phase===0||phase===3?.027:0);
   vertices.push(-width/2+.07,y,z,width/2-.07,y,z);
   if(i){const a=(i-1)*2;indices.push(a,a+1,a+3,a,a+3,a+2);}
  }
  const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[width,height,recess]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <group>
  {/* Exterior casing stays at the siding face; the curtain is 4in behind it. */}
  {[-1,1].map(side=><group key={side}>
   <Box at={[side*(width/2+3.5/24),0,.035]} size={[3.5/12,height,.75/12]} color={trim}/>
   <Box at={[side*(width/2+.025),0,-recess/2]} size={[.05,height,recess]} color={trim}/>
   <Box at={[side*(width/2-.045),0,-recess+.025]} size={[.09,height,.07]}/>
  </group>)}
  <Box at={[0,height/2+3.5/24,.035]} size={[width+8/12,3.5/12,.75/12]} color={trim}/>
  <Box at={[0,height/2-.025,-recess/2]} size={[width,.05,recess]} color={trim}/>
  <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color="#F2F0EB" roughness={.5} metalness={.25}/></mesh>
  <Box at={[0,-height/2+.065,-recess+.025]} size={[width-.12,.13,.075]} color="#b9c0c2" metalness={.7}/>
  {/* Bottom pull and side slide-bolt latch match the supplied examples. */}
  <Box at={[0,-height/2+.09,-recess+.095]} size={[.4,.045,.055]} color="#aeb8bd" metalness={.75}/>
  <Box at={[width/2-.28,-.25,-recess+.06]} size={[.4,.18,.035]} color="#aeb8bd" metalness={.75}/>
  <Box at={[width/2-.22,-.24,-recess+.10]} size={[.34,.045,.045]} color="#818d92" metalness={.8}/>
  <group position={[0,-height/2+threshold.y,threshold.z]}><DiamondPlate width={width} depth={threshold.depth} thickness={threshold.thickness}/></group>
 </group>;
}
