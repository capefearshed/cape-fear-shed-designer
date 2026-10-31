import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {FLOOR_HEIGHT} from './shedGeometry.js';
import {interiorLayout} from './interiorLayout.js';

function Timber({position,size,color='#c7a578'}){
 return <mesh position={position} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.9}/></mesh>;
}
function useOSB(){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#b99867';ctx.fillRect(0,0,256,256);
  let seed=527;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  for(let i=0;i<1800;i++){ctx.save();ctx.translate(random()*256,random()*256);ctx.rotate(random()*Math.PI);ctx.fillStyle=['#9b7a4d','#d2b480','#c6a471','#ac8a58'][Math.floor(random()*4)];ctx.fillRect(-6,-1,5+random()*18,1+random()*3);ctx.restore();}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);return map;
 },[]);
 useEffect(()=>()=>texture.dispose(),[texture]);return texture;
}
function Platform({layout,map,legs=false,rotation=0}){
 const {x,z,width,depth,bottom,top}=layout,frameHeight=3.5/12,board=1.5/12;
 const centerY=bottom+frameHeight/2;
 const joists=Math.max(1,Math.ceil(width/(16/12)));
 return <group position={[x,0,z]} rotation={[0,rotation,0]}>
  {[-1,1].map(side=><Timber key={'edge'+side} position={[0,centerY,side*(depth/2-board/2)]} size={[width,frameHeight,board]}/>)}
  {Array.from({length:joists+1},(_,i)=><Timber key={i} position={[-width/2+board/2+i*(width-board)/joists,centerY,0]} size={[board,frameHeight,depth-board*2]}/>)}
  <mesh position={[0,top-.5/24,0]} receiveShadow><boxGeometry args={[width,.5/12,depth]}/><meshStandardMaterial map={map} roughness={1}/></mesh>
  {legs&&[-1,1].flatMap(a=>[-1,1].map(b=><Timber key={a+','+b} position={[a*(width/2-.12),bottom/2,b*(depth/2-.12)]} size={[board,bottom,3.5/12]}/>))}
 </group>;
}
export default function InteriorShed({w,l,wallHeight,accessories,dowelLengthIn=18,concreteSlab=false}){
 const layout=interiorLayout(w,l,accessories),map=useOSB();
 const wall=(({6.5:73.5,7:78.5,8:87.5}[wallHeight]??73.5)+4.5)/12;
 const {insideLength:il}=layout;const endStudCount=Math.ceil(w*12/16)+1,rearStudCount=Math.ceil(l*12/16)+1;
 return <group position={[0,FLOOR_HEIGHT,0]}>
  <mesh position={[0,-.04,0]} receiveShadow><boxGeometry args={[l,.08,w]}/><meshStandardMaterial map={concreteSlab?null:map} color={concreteSlab?'#bcbcb5':'#ffffff'} roughness={1}/></mesh>
  {/* Two far walls remain; the roof and near walls are cut away for visibility. */}
  <Timber position={[-l/2,wall/2,0]} size={[.06,wall,w]} color='#d5c7ad'/>
  <Timber position={[0,wall/2,-w/2]} size={[l,wall,.06]} color='#d5c7ad'/>
  {Array.from({length:endStudCount},(_,i)=>{const z=-w/2+i*w/(endStudCount-1);return <Timber key={'end'+i} position={[-l/2+.15,wall/2,z]} size={[3.5/12,wall,1.5/12]}/>;})}
  {Array.from({length:rearStudCount},(_,i)=>{const x=-l/2+i*l/(rearStudCount-1);return <Timber key={'rear'+i} position={[x,wall/2,-w/2+.15]} size={[1.5/12,wall,3.5/12]}/>;})}
  {[.0625,wall-.125].map(y=><group key={y}><Timber position={[-l/2+.15,y,0]} size={[3.5/12,.125,w]}/><Timber position={[0,y,-w/2+.15]} size={[l,.125,3.5/12]}/></group>)}
  {accessories.loft&&<Platform layout={{...layout.loft,width:layout.loft.depth,depth:layout.loft.width}} rotation={Math.PI/2} map={map}/>}
  {accessories.workbench&&<Platform layout={layout.workbench} map={map} legs/>}
  {accessories.surfRack&&<group>
   {[-1,1].map(side=><group key={side} position={[il/2,0,side*layout.surfRack.postSpacing/2]}>
    <Timber position={[0,4.25,0]} size={[3.5/12,3.5,1.5/12]}/>
    {layout.surfRack.levels.map(y=><mesh key={y} position={[-dowelLengthIn/24,y,0]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.5/12,.5/12,dowelLengthIn/12,16]}/><meshStandardMaterial color='#d5b785' roughness={.8}/></mesh>)}
   </group>)}
  </group>}
 </group>;
}
