import React,{useMemo,useEffect} from 'react';
import * as THREE from 'three';
import {FLOOR_HEIGHT} from './shedGeometry.js';
import {interiorLayout,wallPose,openingRects,wallPanels} from './interiorLayout.js';

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
  <mesh position={[0,top-.5/24,0]} castShadow receiveShadow><boxGeometry args={[width,.5/12,depth]}/><meshStandardMaterial map={map} roughness={1}/></mesh>
  {legs&&[-1,1].flatMap(a=>[-1,1].map(b=><Timber key={a+','+b} position={[a*(width/2-.12),bottom/2,b*(depth/2-.12)]} size={[board,bottom,3.5/12]}/>))}
 </group>;
}
function Beam({a,b,thickness=.125,depth=3.5/12,opacity=1}){
 const direction=new THREE.Vector3(...b).sub(new THREE.Vector3(...a)),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),direction.clone().normalize());
 return <mesh position={a.map((v,i)=>(v+b[i])/2)} quaternion={q}><boxGeometry args={[thickness,direction.length(),depth]}/><meshStandardMaterial color="#b99260" roughness={.9} transparent={opacity<1} opacity={opacity}/></mesh>;
}
function WallFraming({wall,w,l,height,openings,map}){
 const pose=wallPose(wall,w,l),rects=openingRects(wall,w,l,openings);
 const far=wall==='left'||wall==='back',span=pose.span,stud=1.5/12;
 const regular=Array.from({length:Math.floor(span/(16/12))+1},(_,i)=>-span/2+.0625+i*16/12);
 const studs=[...regular,...rects.flatMap(r=>[r.x-r.width/2-stud/2,r.x+r.width/2+stud/2])];
 return <group position={pose.position} rotation={[0,pose.angle,0]}>
  {far&&wallPanels(span,height,rects).map((p,i)=><mesh key={'panel'+i} position={[p.x,p.y,0]}><boxGeometry args={[p.width,p.height,.04]}/><meshStandardMaterial map={map} color="#eee1c7" roughness={1}/></mesh>)}
  {studs.map((x,i)=>{const cut=rects.find(r=>x>r.x-r.width/2-.01&&x<r.x+r.width/2+.01);const ranges=cut?[[.125,cut.bottom],[cut.top+.25,height-.25]]:[[.125,height-.25]];return ranges.filter(([a,b])=>b>a).map(([a,b],j)=><Timber key={i+','+j} position={[x,(a+b)/2,-.15]} size={[stud,b-a,3.5/12]}/>);})}
  <Timber position={[0,height-.125,-.15]} size={[span,.25,3.5/12]}/>
  {wallPanels(span,.125,rects.filter(r=>r.bottom===0)).map((p,i)=><Timber key={'plate'+i} position={[p.x,.0625,-.15]} size={[p.width,.125,3.5/12]}/>)}
  {rects.map(r=><group key={r.id}>
   <Timber position={[r.x,r.top+.125,-.15]} size={[r.width+.5,.25,3.5/12]}/>
   {r.kind==='window'&&<>
    <Timber position={[r.x,r.bottom-.0625,-.15]} size={[r.width+.25,.125,3.5/12]}/>
    <mesh position={[r.x,(r.bottom+r.top)/2,-.02]}><boxGeometry args={[r.width,r.top-r.bottom,.025]}/><meshStandardMaterial color="#91b9c3" transparent opacity={.22}/></mesh>
    <Timber position={[r.x,(r.bottom+r.top)/2,-.05]} size={[.05,r.top-r.bottom,.04]} color="#e4e4dd"/>
    <Timber position={[r.x,(r.bottom+r.top)/2,-.05]} size={[r.width,.05,.04]} color="#e4e4dd"/>
   </>}
  </group>)}
 </group>;
}
export default function InteriorShed({w,l,wallHeight,accessories,placements={},openings=[],pitch=5,roofStyle='gable',dowelLengthIn=18,concreteSlab=false}){
 const layout=interiorLayout(w,l,accessories,placements,openings),map=useOSB();
 const wall=(({6.5:73.5,7:78.5,8:87.5}[wallHeight]??73.5)+4.5)/12;
 const lean=roofStyle==='lean-to',rise=lean?w*Math.tan(Math.PI/18):w/2*pitch/12;
 const rack=layout.surfRack,pose=wallPose(rack.wall,w,l);
 const rafters=Array.from({length:Math.ceil(l/(16/12))+1},(_,i)=>-l/2+i*l/Math.ceil(l/(16/12)));
 return <group position={[0,FLOOR_HEIGHT,0]}>
  <mesh position={[0,-.04,0]} receiveShadow><boxGeometry args={[l,.08,w]}/><meshStandardMaterial map={concreteSlab?null:map} color={concreteSlab?'#bcbcb5':'#ffffff'} roughness={1}/></mesh>
  {['front','back','left','right'].map(side=><WallFraming key={side} wall={side} w={w} l={l} height={wall+(lean&&side==='front'?rise:0)} openings={openings} map={map}/>)}
  {/* Open roof framing follows the selected roof profile without hiding the loft. */}
  {rafters.map((x,i)=><group key={'rafter'+i}>{lean?<Beam a={[x,wall,-w/2]} b={[x,wall+rise,w/2]} opacity={.48}/>:<><Beam a={[x,wall,-w/2]} b={[x,wall+rise,0]} opacity={.48}/><Beam a={[x,wall+rise,0]} b={[x,wall,w/2]} opacity={.48}/></>}</group>)}
  {!lean&&<Beam a={[-l/2,wall+rise,0]} b={[l/2,wall+rise,0]} opacity={.6}/>}
  {[-1,1].map(side=>lean?<Beam key={side} a={[side*l/2,wall,-w/2]} b={[side*l/2,wall+rise,w/2]}/>:<group key={side}><Beam a={[side*l/2,wall,-w/2]} b={[side*l/2,wall+rise,0]}/><Beam a={[side*l/2,wall+rise,0]} b={[side*l/2,wall,w/2]}/></group>)}
  {[-1,1].flatMap(side=>Array.from({length:Math.ceil(w/(16/12))-1},(_,i)=>{const z=-w/2+(i+1)*w/Math.ceil(w/(16/12)),top=lean?wall+(z+w/2)*Math.tan(Math.PI/18):wall+rise-Math.abs(z)*pitch/12;return top>wall+.01?<Beam key={'gable-stud'+side+','+i} a={[side*l/2,wall,z]} b={[side*l/2,top,z]}/>:null;}))}
  {accessories.loft&&<Platform layout={{...layout.loft,width:layout.loft.depth,depth:layout.loft.width}} rotation={Math.PI/2} map={map}/>}
  {accessories.workbench&&<Platform layout={{...layout.workbench,width:layout.workbench.depth,depth:layout.workbench.width}} rotation={Math.PI/2} map={map} legs/>}
  {accessories.surfRack&&rack.count>0&&<group position={pose.position} rotation={[0,pose.angle,0]}>
   <Timber position={[rack.center,rack.height,-.35]} size={[rack.railWidth,5.5/12,1.5/12]}/>
   {rack.dowels.map(x=><group key={x} position={[rack.center+x,rack.height,-.4-dowelLengthIn/24]}>
    <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.5/12,.5/12,dowelLengthIn/12,20]}/><meshStandardMaterial color="#d5b785" roughness={.8}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.7/12,.7/12,Math.max(.1,dowelLengthIn/12-.15),20]}/><meshStandardMaterial color="#242525" roughness={.95}/></mesh>
   </group>)}
  </group>}
 </group>;
}
