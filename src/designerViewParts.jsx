import React, {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, ContactShadows} from '@react-three/drei';
import {Download, Plus, Trash2, MoveHorizontal, Check, Eye, DoorClosed, PanelsTopLeft, AppWindow, ChevronDown, Ruler, House, Paintbrush, DoorOpen, PanelsTopLeft as InteriorIcon, ClipboardCheck} from 'lucide-react';
import './styles.css';
import {METAL_COLORS} from './MetalRoof.jsx';
import {metalRoofAllowed} from './metalRoofGeometry.js';
import InteriorShed from './InteriorShed.jsx';
import {INTERIOR_SPECS,interiorLayout} from './interiorLayout.js';
import Shed,{shingleThumbnail} from './Shed.jsx';
import BackyardPreview from './BackyardPreview.jsx';
import {createCapturePath} from './capturePath.js';
import {frameBackyardCamera} from './backyardCamera.js';
import {Box3,Vector3} from 'three';
import {wallCameraFit} from './wallLayout.js';
import {WALLS,wallSpan,framedWidth,distributeAll} from './openingLayout.js';
import {constructionSpecs} from './constructionSpecs.js';

function WallCamera({active,wall,length,width,controlsRef,shedRef,shapeKey}){
 const {camera}=useThree();
 const orbit=useRef(null);
 useFrame((state,delta)=>{
  if(!active){orbit.current=null;return;}
  if(!shedRef.current)return;
  const key=wall+shapeKey+state.size.width+':'+state.size.height;
  let current=orbit.current;
  if(!current||current.key!==key){
   const fit=wallCameraFit(camera,shedRef.current,wall);if(!fit)return;
   current={key,fit,angle:current?.angle??Math.atan2(camera.position.x,camera.position.z),radius:Math.max(fit.radius,current?.radius||Math.hypot(camera.position.x,camera.position.z))};
   orbit.current=current;
  }
  const {fit}=current,step=1-Math.exp(-6*Math.min(delta,.1));
  const difference=Math.atan2(Math.sin(fit.angle-current.angle),Math.cos(fit.angle-current.angle));
  current.angle+=difference*step;
  // Keep the entire shed visible while turning, then fill the wall view.
  const desiredRadius=Math.abs(difference)>.05?Math.max(fit.radius,Math.hypot(length,width)*1.6):fit.radius;
  current.radius=Math.max(fit.radius,current.radius+(desiredRadius-current.radius)*step);
  const radius=current.radius;
  camera.position.set(fit.center.x+Math.sin(current.angle)*radius,fit.center.y,fit.center.z+Math.cos(current.angle)*radius);
  if(controlsRef.current){controlsRef.current.target.copy(fit.center);controlsRef.current.update();}
  else camera.lookAt(fit.center);
 });
 return null;
}
function InteriorCamera({shedRef,controlsRef,width,length}){
 const {camera,size}=useThree();
 useLayoutEffect(()=>{
  const original=camera.position.clone(),target=controlsRef.current?.target.clone();
  const box=new Box3().setFromObject(shedRef.current),center=box.getCenter(new Vector3());
  const direction=new Vector3(1,.85,1).normalize().applyAxisAngle(new Vector3(0,1,0),-.2);
  const corners=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])corners.push(new Vector3(x,y,z));
  let distance=Math.max(width,length)*1.2;
  for(let i=0;i<80;i++){camera.position.copy(center).addScaledVector(direction,distance);camera.lookAt(center);camera.updateMatrixWorld(true);if(corners.every(p=>{const q=p.clone().project(camera);return Math.abs(q.x)<.87&&Math.abs(q.y)<.87;}))break;distance*=1.07;}
  if(controlsRef.current){controlsRef.current.target.copy(center);controlsRef.current.update();}
  return ()=>{camera.position.copy(original);if(target&&controlsRef.current){controlsRef.current.target.copy(target);controlsRef.current.update();}};
 },[camera,width,length,size.width,size.height,shedRef,controlsRef]);
 return null;
}
// Material profile drawings are previews only; they do not alter shed geometry.
// Material samples: front-facing profile cuts with visible projected edges and realistic course shadows.
// Orthographic material samples: each shadow follows a raised lip, groove or batten return.
function SidingSample({type}){
 const wood=!type.startsWith('vinyl');
 const id=type.replace(/[^a-z]/g,'');
 const woodFace='url(#wood-'+id+')', vinylFace='url(#vinyl-'+id+')';
 return <span className="siding-profile-art" aria-hidden="true"><svg className="siding-sample-svg" viewBox="0 0 180 110" preserveAspectRatio="xMidYMid slice">
  <defs>
   <linearGradient id={'wood-'+id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#D1BFA8"/><stop offset=".48" stopColor="#C7B397"/><stop offset="1" stopColor="#B7A085"/></linearGradient>
   <linearGradient id={'vinyl-'+id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FCFBF7"/><stop offset=".45" stopColor="#EAE8E1"/><stop offset="1" stopColor="#CFCDC5"/></linearGradient>
   <linearGradient id={'under-'+id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#95816B"/><stop offset=".45" stopColor="#A58F76"/><stop offset="1" stopColor="#B49C83"/></linearGradient>
   <linearGradient id={'groove-'+id} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#6C5945"/><stop offset=".34" stopColor="#8D775F"/><stop offset=".75" stopColor="#AD977C"/><stop offset="1" stopColor="#E3D2BA"/></linearGradient>
   <linearGradient id={'batten-'+id} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#8A745A"/><stop offset=".19" stopColor="#B39C7E"/><stop offset=".36" stopColor="#D6C1A4"/><stop offset=".79" stopColor="#C6B095"/><stop offset="1" stopColor="#877259"/></linearGradient>
   <linearGradient id={'dutch-'+id} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#EDEBE5"/><stop offset=".09" stopColor="#E0DED8"/><stop offset=".15" stopColor="#B4B1AA"/><stop offset=".21" stopColor="#86837D"/><stop offset=".30" stopColor="#A3A098"/><stop offset=".41" stopColor="#D1CEC7"/><stop offset=".53" stopColor="#F0EEE8"/><stop offset=".76" stopColor="#E7E5DE"/><stop offset="1" stopColor="#D0CEC6"/></linearGradient>
   <pattern id={'grain-'+id} width="47" height="110" patternUnits="userSpaceOnUse"><path d="M4 0q-1 15 1 23t0 25t-1 33M12 0q2 16-1 33t1 35M24 0q-2 18 1 35t-1 31M33 0q1 18 0 29t1 43M41 0q-1 13 1 22t-2 45" fill="none" stroke="#685640" strokeWidth=".6" opacity=".22"/><path d="M8 0v110M29 0v110M38 0v110" stroke="#F7E8D4" strokeWidth=".65" opacity=".22"/></pattern>
  </defs>
  <rect width="180" height="110" fill={wood?'#C5B195':'#E5E3DD'}/>
  {type==='lp-panel'&&<>
   <rect width="180" height="110" fill={woodFace}/><rect width="180" height="110" fill={'url(#grain-'+id+')'}/>
   {[0,39,78,117,156].map(x=><g key={x}><rect x={x} width="4" height="110" fill={'url(#groove-'+id+')'}/><rect x={x+4} width="1" height="110" fill="#F0DFC7" opacity=".65"/></g>)}
  </>}
  {type==='board-batten'&&<>
   <rect width="180" height="110" fill={woodFace}/><rect width="180" height="110" fill={'url(#grain-'+id+')'}/>
   {[-7,66,139,212].map(x=><g key={x}><rect x={x-3} width="3" height="110" fill="#554939" opacity=".18"/><rect x={x} width="10" height="110" fill={'url(#batten-'+id+')'}/><rect x={x} width="10" height="110" fill={'url(#grain-'+id+')'} opacity=".16"/><rect x={x+10} width="2" height="110" fill="#715F4A" opacity=".19"/></g>)}
  </>}
  {type==='lap'&&Array.from({length:7},(_,i)=>{const y=i*19-13;return <g key={i}>
    <rect y={y+18} width="180" height="3" fill="#786550" opacity=".10"/>
    <path d={`M0 ${y}H180V${y+16.7}H0Z`} fill={woodFace}/>
    <path d={`M0 ${y}H180V${y+16.7}H0Z`} fill={'url(#grain-'+id+')'} opacity=".35"/>
    <path d={`M0 ${y+17.2}H180V${y+19}H0Z`} fill={'url(#under-'+id+')'}/>
    <path d={`M0 ${y+.8}H180`} stroke="#F6E8D5" strokeWidth=".9" opacity=".55"/>
   </g>})}
  {type==='vinyl-straight'&&Array.from({length:8},(_,i)=>{const y=i*15-7;return <g key={i}>
   <rect y={y+14} width="180" height="2.2" fill="#8E8A81" opacity=".20"/>
   <path d={`M0 ${y}H180V${y+13.4}H0Z`} fill={vinylFace}/>
   <path d={`M0 ${y+.9}H180`} stroke="#FFFFFF" strokeWidth="1" opacity=".85"/>
   <path d={`M0 ${y+13.4}H180V${y+14.5}H0Z`} fill="#ABA79E"/>
  </g>})}
  {type==='vinyl-dutch'&&Array.from({length:6},(_,i)=>{const y=i*21.5-8;return <g key={i}>
   {/* Dutch lap has a narrow cove at the TOP, then a mostly flat face. */}
   <rect y={y} width="180" height="21.5" fill={'url(#dutch-'+id+')'}/>
   <path d={`M0 ${y+2.8}H180`} stroke="#FFFFFF" strokeWidth=".65" opacity=".45"/>
   <path d={`M0 ${y+7}H180`} stroke="#87847D" strokeWidth=".85" opacity=".40"/>
   <path d={`M0 ${y+20.7}H180`} stroke="#B4B1AA" strokeWidth=".8" opacity=".38"/>
  </g>})}
  <rect width="180" height="110" fill="none" stroke="#655946" strokeOpacity=".12"/>
 </svg></span>;
}

export {WallCamera,InteriorCamera,SidingSample};
