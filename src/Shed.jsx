import React, {useMemo, useEffect} from 'react';
import * as THREE from 'three';
import {FLOOR_HEIGHT as FLOOR, roofDimensions} from './shedGeometry.js';

// Seeded, local textures: no image downloads or per-frame texture work.
function surfaceTexture(kind) {
 const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=512;
 const ctx=canvas.getContext('2d'); let seed=93;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 ctx.fillStyle=kind==='siding'?'#e8e8e8':'#888888';ctx.fillRect(0,0,512,512);
 if(kind==='siding'){
  for(let i=0;i<5500;i++){const v=180+Math.floor(random()*65);ctx.strokeStyle=`rgba(${v},${v},${v},.34)`;const x=random()*512,y=random()*512;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x-2,y+6,x+3,y+15,x,y+25+random()*35);ctx.stroke()}
  // Four 8-inch panel grooves per repeat, recessed through the bump map.
  for(let x=0;x<512;x+=128){ctx.fillStyle='#686868';ctx.fillRect(x,0,3,512);ctx.fillStyle='#fafafa';ctx.fillRect(x+3,0,1,512)}
 }else{
  for(let row=0;row<8;row++)for(let col=-1;col<8;col++){
   const x=col*80+(row%2)*40,y=row*64,v=95+Math.floor(random()*65);
   ctx.fillStyle=`rgb(${v},${v},${v})`;ctx.fillRect(x,y,79,64);
   ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(x,y+59,80,5);
   ctx.fillStyle='rgba(255,255,255,.16)';ctx.fillRect(x,y,79,2);
   if(random()>.35){ctx.fillStyle='rgba(0,0,0,.16)';ctx.fillRect(x+16,y+31,35,28)}
  }
  for(let i=0;i<42000;i++){const v=random()>.5?230:25;ctx.fillStyle=`rgba(${v},${v},${v},.22)`;ctx.fillRect(random()*512,random()*512,1.5,1.5)}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function useSurface(kind,width,height){
 const map=useMemo(()=>{const t=surfaceTexture(kind);t.repeat.set(width/(kind==='siding'?8/3:8),height/(kind==='siding'?4:10/3));return t},[kind,width,height]);
 useEffect(()=>()=>map.dispose(),[map]);return map;
}
function Box({at,size,color,rotation,metalness=0,roughness=.8,...props}){
 return <mesh position={at} rotation={rotation} castShadow receiveShadow {...props}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness}/></mesh>
}
function Siding({width,height,paint,gable=false}){
 const map=useSurface('siding',width,height);
 const geometry=useMemo(()=>{
  const positions=gable?[-width/2,0,0,width/2,0,0,0,height,0]:[-width/2,0,0,width/2,0,0,width/2,height,0,-width/2,height,0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(gable?[0,0,1,0,.5,1]:[0,0,1,0,1,1,0,1],2));
  g.setIndex(gable?[0,1,2]:[0,1,2,0,2,3]);g.computeVertexNormals();return g;
 },[width,height,gable]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={paint} map={map} bumpMap={map} bumpScale={.018} roughness={.92} side={THREE.DoubleSide}/></mesh>
}
function Vent({rise,trim}){
 const h=Math.min(.85,rise*.4),width=.85;
 return <group position={[0,rise*.43,.065]}>
  <Box at={[0,0,0]} size={[width+.16,h+.16,.12]} color={trim}/>
  <Box at={[0,0,.068]} size={[width,h,.03]} color="#343d38"/>
  {Array.from({length:6},(_,i)=><Box key={i} at={[0,-h/2+(i+.5)*h/6,.1]} size={[width,.045,.075]} color={trim} rotation={[.35,0,0]}/>)}
 </group>
}
function Opening({o,w,l,selected,onSelect,paint,trim}){
 const long=o.wall==='front'||o.wall==='back',span=long?l:w,a=o.x/12-span/2;
 const pos=long?[a,FLOOR+o.y/12+o.height/24,(o.wall==='front'?1:-1)*(w/2+.045)]:[(o.wall==='right'?1:-1)*(l/2+.045),FLOOR+o.y/12+o.height/24,a];
 const rotation=[0,long?(o.wall==='front'?0:Math.PI):(o.wall==='right'?Math.PI/2:-Math.PI/2),0];
 const wd=o.width/12,ht=o.height/12,frame=selected?'#c49351':trim;
 return <group position={pos} rotation={rotation} onClick={e=>{e.stopPropagation();onSelect(o.id)}}>
  <group>
   <Box at={[0,0,.025]} size={[wd+.03,ht+.03,.08]} color="#26342e"/>
   {[-1,1].map(s=><Box key={s} at={[s*(wd/2+.115),0,.105]} size={[.23,ht+.46,.16]} color={frame}/>)}
   <Box at={[0,ht/2+.115,.105]} size={[wd+.46,.23,.16]} color={frame}/>
   {o.kind==='door'?<>
    <group position={[0,-ht/2,.095]}><Siding width={wd} height={ht} paint={paint}/></group>
    <Box at={[0,0,.14]} size={[.055,ht,.075]} color={trim}/>
    {[-1,1].map(s=><group key={s}>
     {[-.38,.38].map(y=><Box key={y} at={[s*wd/4,y*ht,.14]} size={[wd/2-.07,.17,.075]} color={trim}/>)}
     {[-.34,0,.34].map(y=><group key={y} position={[s*(wd/2-.13),ht*y,.21]}>
      <Box at={[-s*.12,0,0]} size={[.32,.065,.025]} color="#242728" metalness={.75} roughness={.4}/>
      <mesh rotation={[0,0,0]}><cylinderGeometry args={[.035,.035,.15,8]}/><meshStandardMaterial color="#303335" metalness={.7} roughness={.35}/></mesh>
      {[-.2,-.07].map(x=><mesh key={x} position={[s*x,0,.018]}><sphereGeometry args={[.014,6,4]}/><meshStandardMaterial color="#949797" metalness={.8}/></mesh>)}
     </group>)}
    </group>)}
    <Box at={[.12,0,.205]} size={[.12,.25,.035]} color="#25292a" metalness={.7}/>
    <mesh position={[.12,0,.255]}><torusGeometry args={[.065,.014,6,16,Math.PI*1.7]}/><meshStandardMaterial color="#303335" metalness={.8} roughness={.3}/></mesh>
    <Box at={[0,-ht/2+.025,.13]} size={[wd,.05,.24]} color="#777c7b" metalness={.65}/>
   </>:<>
    <Box at={[0,-ht/2-.08,.14]} size={[wd+.58,.16,.32]} color={frame}/>
    <Box at={[0,0,.07]} size={[wd,ht,.04]} color="#182c31"/>
    <mesh position={[0,0,.105]}><planeGeometry args={[wd-.1,ht-.1]}/><meshPhysicalMaterial color="#78a4ad" metalness={.25} roughness={.14} transparent opacity={.76} clearcoat={1} envMapIntensity={.6}/></mesh>
    {[-1,1].map(s=><group key={s}><Box at={[s*(wd/2-.035),0,.14]} size={[.07,ht,.065]} color={trim}/><Box at={[0,s*(ht/2-.035),.14]} size={[wd,.07,.065]} color={trim}/></group>)}
    <Box at={[0,0,.15]} size={[wd,.07,.07]} color={trim}/>
    <Box at={[0,0,.15]} size={[.045,ht,.06]} color={trim}/>
    <Box at={[0,ht/2+.255,.11]} size={[wd+.58,.045,.23]} color={trim}/>
   </>}
  </group>
 </group>
}
function Roof({w,l,pitch,wall,roofColor,trim}){
 const d=roofDimensions(w,l,pitch,wall);
 const map=useSurface('shingles',d.roofLength,d.slope);
 const color={charcoal:'#555b60',gray:'#93989a',driftwood:'#a29582'}[roofColor]||'#555b60';
 return <group>
  {[-1,1].map(s=><group key={s} position={[0,(d.ridgeY+d.eaveY)/2,s*d.run/2]} rotation={[s*d.angle,0,0]}>
   <Box at={[0,-.055,0]} size={[d.roofLength,.11,d.slope]} color={trim}/>
   <mesh position={[0,.015,0]} castShadow receiveShadow><boxGeometry args={[d.roofLength,.035,d.slope]}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} roughness={.98}/></mesh>
   {/* Thin raised shingle course edges; surface grain and staggered tabs live in the shared texture. */}
   {Array.from({length:Math.floor(d.slope/(5/12))},(_,i)=><Box key={i} at={[0,.038,-d.slope/2+(i+1)*5/12]} size={[d.roofLength,.009,.025]} color={color}/>)}
   {[-1,1].map(end=><Box key={end} at={[end*(d.roofLength/2-.028),-.085,0]} size={[.075,.21,d.slope+.05]} color={trim}/>)}
   <Box at={[0,-.09,s*d.slope/2]} size={[d.roofLength,.22,.075]} color={trim}/>
   <Box at={[0,.024,s*(d.slope/2-.015)]} size={[d.roofLength,.025,.065]} color="#606666" metalness={.65}/>
  </group>)}
  {/* Individual overlapping ridge caps follow both roof slopes. */}
  {Array.from({length:Math.ceil(d.roofLength/.8)},(_,i)=>{
   const length=Math.min(.8,d.roofLength-i*.8);
   return <group key={i} position={[-d.roofLength/2+i*.8+length/2,d.ridgeY+.055,0]}>{[-1,1].map(s=><Box key={s} at={[0,-.055,s*.13]} rotation={[s*d.angle,0,0]} size={[length,.045,.29]} color={color}/>)}</group>
  })}
 </group>
}
function Foundation({w,l}){
 const rows=w>=12?[-w/2+1,0,w/2-1]:[-w/2+1,w/2-1];
 const count=Math.ceil((l-2)/5)+1;
 return <group>
  {rows.map(z=><group key={z}>
   <Box at={[0,.32,z]} size={[l-.5,.42,.3]} color="#786b4d"/>
   {Array.from({length:count},(_,i)=><group key={i} position={[-l/2+1+i*(l-2)/(count-1),-.1,z]}>
    <mesh castShadow receiveShadow rotation={[0,Math.PI/4,0]}><cylinderGeometry args={[.38,.62,.54,4]}/><meshStandardMaterial color="#393c3b" roughness={.93}/></mesh>
    {[-1,1].map(s=><Box key={s} at={[0,.23,s*.21]} size={[.46,.15,.12]} color="#484b49"/>)}
    <Box at={[0,.18,0]} size={[.32,.04,.28]} color="#222725"/>
   </group>)}
  </group>)}
  <Box at={[0,.58,0]} size={[l,.22,w]} color="#8d795a"/>
 </group>
}
export default function Shed({w,l,pitch,wallHeight,paint,trim,roofColor,openings,selected,setSelected}){
 const wall=wallHeight===6.5?6.5:wallHeight===7?83/12:92/12,rise=w/2*pitch/12;
 return <group>
  <Foundation w={w} l={l}/>
  {[-1,1].map(s=><group key={'wall'+s} position={[0,FLOOR,s*w/2]} rotation={[0,s===1?0:Math.PI,0]}><Siding width={l} height={wall} paint={paint}/></group>)}
  {[-1,1].map(s=><group key={'gable'+s} position={[s*l/2,FLOOR,0]} rotation={[0,s*Math.PI/2,0]}>
   <Siding width={w} height={wall} paint={paint}/>
   <group position={[0,wall,0]}><Siding width={w} height={rise} paint={paint} gable/><Vent rise={rise} trim={trim}/></group>
  </group>)}
  {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x},${z}`}>
   <Box at={[x*(l/2-.13),FLOOR+wall/2,z*(w/2+.04)]} size={[.27,wall,.09]} color={trim}/>
   <Box at={[x*(l/2+.04),FLOOR+wall/2,z*(w/2-.13)]} size={[.09,wall,.27]} color={trim}/>
  </group>))}
  <Roof w={w} l={l} pitch={pitch} wall={wall} roofColor={roofColor} trim={trim}/>
  {openings.map(o=><Opening key={o.id} o={o} w={w} l={l} paint={paint} trim={trim} selected={selected===o.id} onSelect={setSelected}/>)}
 </group>
}
