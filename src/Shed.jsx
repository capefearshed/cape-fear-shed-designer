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
 const wd=o.width/12,ht=o.height/12,frame=trim;
 const trimThickness=0.75/12; // Actual 3/4-inch LP trim
 const hingeReveal=0.375/12; // 3/8-inch clear gap to hinge-side casing
 return <group position={pos} rotation={rotation} onClick={e=>{e.stopPropagation();onSelect(o.id)}}>
  <group position={[0,0,-.10]}>
   {/* Flat, nominal 1x4 exterior casing: restrained projection, square joints. */}
   <Box at={[0,0,.025]} size={[wd+.015,ht+.015,.045]} color={o.kind==='door'?paint:'#26342e'}/>
   {[-1,1].map(side=><Box key={side} at={[side*(wd/2+.145),.145,.08625]} size={[.29,ht+.29,trimThickness]} color={frame}/>)}
   <Box at={[0,ht/2+.145,.08625]} size={[wd+.58,.29,trimThickness]} color={frame}/>
   {o.kind==='door'?<>
    {/* Explicit 3/8-inch top, hinge-side and center reveals; two separate door leaves. */}
    {[-1,1].map(side=>{
     const gap=3/8/12;
     const leafWidth=(wd-3*gap)/2;
     const leafHeight=ht-gap;
     const centerX=side*(gap/2+leafWidth/2);
     const outerX=side*(wd/2-gap);
     const innerX=side*gap/2;
     const topY=ht/2-gap;
     const bottomY=-ht/2;
     const midY=(topY+bottomY)/2;
     return <group key={side}>
      <group position={[centerX,bottomY,.066]}><Siding width={leafWidth} height={leafHeight} paint={paint}/></group>
      {/* Photo-accurate door leaf stiles, top/bottom rails and central mid rail. */}
      <Box at={[outerX-side*.125,midY,.119]} size={[.25,leafHeight,trimThickness]} color={trim}/>
      <Box at={[innerX+side*.125,midY,.119]} size={[.25,leafHeight,trimThickness]} color={trim}/>
      {[topY-.125,midY,bottomY+.125].map((y,i)=><Box key={i} at={[centerX,y,.119]} size={[leafWidth,.25,trimThickness]} color={trim}/>)}
      {/* Black tee hinges: tall plate beyond the barrel, visible barrel, long
          straight-sided strap tapering to a generously rounded nose. */}
      {[topY-.125,midY,bottomY+.125].map((y,i)=>{
       const dir=-side,shape=new THREE.Shape();
       // Cape Fear Shed reference: stamped T-hinge with a small, blunt rounded nose.
       // Strap approx 4.4in long, 1.35in tall at barrel, narrowing smoothly.
       shape.moveTo(0,-.057);
       shape.lineTo(dir*.04,-.057);
       shape.lineTo(dir*.337,-.022);
       shape.quadraticCurveTo(dir*.37,-.019,dir*.37,0);
       shape.quadraticCurveTo(dir*.37,.019,dir*.337,.022);
       shape.lineTo(dir*.04,.057);
       shape.lineTo(0,.057);
       shape.closePath();
       const mountX=side*(wd/2+.07);
       const barrelX=side*(wd/2-gap*.45);
       // Dimensions in feet: hinge steel is 1/8in, knuckle max 1/2in thick.
       // Door leaf trim and outer casing have different face planes.
       const steel=0.125/12;
       const doorTrimFace=.119+trimThickness/2;
       const casingFace=.08625+trimThickness/2;
       const barrelRadius=.25/12;
       return <group key={i}>
        {/* 1/8in plate mounted directly to exterior casing. */}
        <Box at={[mountX,y,casingFace+steel/2]} size={[.16,.245,steel]} color="#151718" metalness={.35}/>
        {[-.080,.080].map(yy=><mesh key={yy} position={[mountX,y+yy,casingFace+steel+.001]}>
         <circleGeometry args={[.016,12]}/><meshStandardMaterial color="#454747" metalness={.55}/>
        </mesh>)}
        {/* Hinge pin is the only bulky component, at about 1/2in diameter. */}
        <mesh position={[barrelX,y,doorTrimFace+barrelRadius]} rotation={[Math.PI/2,0,0]}>
         <cylinderGeometry args={[barrelRadius,barrelRadius,.22,16]}/><meshStandardMaterial color="#171919" metalness={.55}/>
        </mesh>
        {/* Thin steel strap lies on the face of the door leaf trim. */}
        <mesh position={[barrelX,y,doorTrimFace]}>
         <extrudeGeometry args={[shape,{depth:steel,bevelEnabled:false,steps:1}]}/>
         <meshStandardMaterial color="#151718" metalness={.4} roughness={.55}/>
        </mesh>
        {[.085,.205,.325].map((xx,j)=><mesh key={j} position={[barrelX+dir*xx,y,doorTrimFace+steel+.001]}>
         <circleGeometry args={[.013,12]}/><meshStandardMaterial color="#484b4c" metalness={.55}/>
        </mesh>)}
       </group>;
      })}
     </group>;
    })}
    {/* Keyed T-handle: oval backplate, raised barrel, horizontal black grips,
        and silver key cylinder on active right-hand leaf. */}
    <group position={[.225,-.02,.19]}>
     <mesh scale={[.08,.135,.028]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#191b1c" roughness={.53} metalness={.35}/></mesh>
     <mesh position={[0,0,.045]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.039,.039,.11,20]}/><meshStandardMaterial color="#202324" metalness={.35}/></mesh>
     <Box at={[0,0,.11]} size={[.255,.065,.054]} color="#202224" metalness={.35}/>
     {[-1,1].map(side=><mesh key={side} position={[side*.13,0,.11]} scale={[.037,.037,.035]}>
      <sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#202224" metalness={.35}/>
     </mesh>)}
     <mesh position={[0,0,.149]}><circleGeometry args={[.028,20]}/><meshStandardMaterial color="#aab0b0" metalness={.8} roughness={.28}/></mesh>
     <Box at={[0,0,.152]} size={[.026,.006,.003]} color="#25292a"/>
    </group>
    <Box at={[0,-ht/2+.02,.072]} size={[wd,.045,.075]} color="#777c7b" metalness={.65}/>
   </>:<>
    {/* Photo reference: simple white 1x4 casing, projecting head and sill, 2-over-2 panes in each sash. */}
    <Box at={[0,-ht/2-.145,.08625]} size={[wd+.58,.29,trimThickness]} color={frame}/>
    <Box at={[0,0,.07]} size={[wd,ht,.045]} color="#273436"/>
    <mesh position={[0,0,.103]}><planeGeometry args={[wd-.12,ht-.12]}/><meshPhysicalMaterial color="#526e70" metalness={.16} roughness={.18} transparent opacity={.74} clearcoat={.7} envMapIntensity={.4}/></mesh>
    {[-1,1].map(side=><group key={side}>
      <Box at={[side*(wd/2-.07),0,.13]} size={[.11,ht,.055]} color={trim}/>
      <Box at={[0,side*(ht/2-.07),.13]} size={[wd,.11,.055]} color={trim}/>
    </group>)}
    {/* Wide meeting rail delineates upper and lower double-hung sashes. */}
    <Box at={[0,0,.165]} size={[wd,.115,.065]} color={trim}/>
    <Box at={[0,0,.16]} size={[.045,ht,.04]} color={trim}/>
    {[-1,1].map(side=><Box key={side} at={[0,side*ht/4,.16]} size={[wd,.045,.04]} color={trim}/>)}
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
 // Prototype foundation details follow Cape Fear Shed's verified width-specific rules.
 // Sizes above 12ft wide (other than 16ft) need their own verified support schedule.
 const skidFoundation=w===16;
 const outerRows=[-w/2+.18,w/2-.18];
 const count=l<=10?2:l<=14?3:l<=20?4:Math.ceil(l/5);
 const xPositions=Array.from({length:count},(_,i)=>-l/2+.195+i*(l-.39)/(count-1));
 const postRows=outerRows.map(z=>Math.sign(z)*(Math.abs(z)+.065-.15));
 return <group>
  {/* Exposed pressure-treated 2x6 outer bands and floor platform. */}
  {outerRows.map(z=><Box key={'band'+z} at={[0,.45,z]} size={[l,.46,.13]} color="#aa926e"/>)}
  {[-l/2+.12,l/2-.12].map(x=><Box key={'end'+x} at={[x,.45,0]} size={[.15,.46,w-.18]} color="#aa926e"/>)}
  {/* Visible floor joists bear on the center girder or 4x6 skids. */}
  {Array.from({length:Math.floor(l*12/16)+1},(_,i)=>{
   const x=-l/2+.18+i*(l-.36)/Math.max(1,Math.floor(l*12/16));
   return <Box key={'joist'+i} at={[x,.45,0]} size={[.13,.46,w-.36]} color="#a58a63"/>;
  })}
  <Box at={[0,.695,0]} size={[l,.045,w]} color="#927d60"/>
  {skidFoundation?
   [-w/2+1,0,w/2-1].map(z=><Box key={'skid'+z} at={[0,-.06,z]} size={[l-.09,.56,.46]} color="#88704d"/>):
   <>
    {postRows.flatMap(z=>xPositions.map((x,i)=><group key={z+'-'+i} position={[x,0,z]}>
      {/* TuffBlock and vertical 4x4 post, its outside face flush with the outside band face. */}
      <mesh position={[0,-.235,0]} castShadow receiveShadow rotation={[0,Math.PI/4,0]}>
       <cylinderGeometry args={[.32,.43,.18,4]}/>
       <meshStandardMaterial color="#242727" roughness={.92}/>
      </mesh>
      <Box at={[0,.025,0]} size={[.30,.40,.30]} color="#9e8058"/>
     </group>))}
    {w===12&&<Box at={[0,.06,0]} size={[l-.09,.32,.30]} color="#9e8058"/>}
   </>}
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
