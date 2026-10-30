import React, {useMemo, useEffect} from 'react';
import {constructionSpecs} from './constructionSpecs.js';
import * as THREE from 'three';
import {FLOOR_HEIGHT as FLOOR, roofDimensions} from './shedGeometry.js';

// Seeded, local textures: no image downloads or per-frame texture work.
function surfaceTexture(kind,roofTone) {
 const canvas=document.createElement('canvas');
 // Forty independently patterned 8-inch LP bays: >26ft before repeat.
 // Keep the texture 512px high and 128px per bay for mobile performance.
 const sidingBays=32;
 canvas.width=kind==='siding'?sidingBays*96:512; canvas.height=kind==='siding'?1024:512;
 const ctx=canvas.getContext('2d'); let seed=93;
 const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 ctx.fillStyle=kind==='siding'?'#e8e8e8':'#888888';ctx.fillRect(0,0,canvas.width,canvas.height);
 if(kind==='siding'){
  // Rough cedar grain matched to the customer's LP SmartSide photo.
  // Distinct irregular, mostly vertical embossed fibers (not drawn waves).
  const bay=canvas.width/sidingBays;
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,canvas.width,canvas.height);
  for(let panel=0;panel<sidingBays;panel++){
   const left=panel*bay;
   // Individual long grain ridges break, branch and change prominence.
   // Multiple segments keep the material organic without sine-wave repetition.
   const fibers=46+Math.floor(random()*24);
   for(let j=0;j<fibers;j++){
    const x=left+3+random()*(bay-6);
    let y=-30-random()*100;
    let drift=(random()-.5)*.65;
    while(y<canvas.height){
     const length=3+random()*17;
     const next=x+drift+(random()-.5)*2;
     const strength=.055+random()*.13;
     ctx.strokeStyle=random()>.47?`rgba(255,255,255,${strength})`:`rgba(74,74,74,${strength*.58})`;
     ctx.lineWidth=.3+random()*.65;
     ctx.beginPath();ctx.moveTo(x+drift,y);
     ctx.lineTo(next,y+length);
     ctx.stroke();
     y+=length+random()*9;
     drift=Math.max(-3,Math.min(3,drift+(random()-.5)*.8));
    }
   }
   // Scattered knot eyes with tight, irregular grain around them.
   // Keep each knot confined to a few inches rather than tall V-shaped waves.
   const knots=random()>.35?1+(random()>.83?1:0):0;
   for(let n=0;n<knots;n++){
    const cx=left+bay*(.23+random()*.54),cy=65+random()*(canvas.height-130);
    const rx=2.1+random()*2.5,ry=6+random()*9;
    for(let ring=0;ring<4;ring++){
     ctx.beginPath();
     ctx.ellipse(cx+(random()-.5)*1.4,cy+(random()-.5)*2.5,
      rx+ring*1.7,ry+ring*3.5,(random()-.5)*.16,0,Math.PI*2);
     ctx.strokeStyle=ring%2===0?'rgba(82,82,82,.25)':'rgba(255,255,255,.30)';
     ctx.lineWidth=.6+random()*.4;ctx.stroke();
    }
   }
   // Broken embossed flakes seen in the real painted rough-cedar texture.
   for(let i=0;i<420;i++){
    const x=left+3+random()*(bay-6),y=random()*canvas.height,len=1+random()*8;
    ctx.strokeStyle=random()>.51?'rgba(255,255,255,.21)':'rgba(81,81,81,.11)';
    ctx.lineWidth=.4+random()*.65;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(random()-.5),y+len);ctx.stroke();
   }
  }
  // Real 3/8-inch-wide recessed grooves, 8 inches center-to-center.
  for(let x=0;x<canvas.width;x+=bay){
   const groove=bay*constructionSpecs.siding.lpPanel.grooveWidthIn/constructionSpecs.siding.lpPanel.grooveSpacingIn;
   // Defined but paint-colored groove: shaded left edge, muted recess,
   // and a soft light-catching right lip, not a black painted stripe.
   ctx.fillStyle='#d6d6d6';ctx.fillRect(x,0,groove,canvas.height);
   ctx.fillStyle='rgba(85,85,85,.12)';ctx.fillRect(x,0,Math.max(1,groove*.22),canvas.height);
   ctx.fillStyle='rgba(245,245,245,.72)';ctx.fillRect(x+groove-1.6,0,1.6,canvas.height);
  }
 }else{
  // Reference: compact staggered charcoal laminate blocks with restrained
  // mineral shade variation and fine seams, rather than continuous stripes.
  // One tile covers 96 x 40 inches at the existing world-space UV scale.
  const pxPerIn=512/96, course=512/8;
  ctx.fillStyle='#cccccc';ctx.fillRect(0,0,512,512);
  for(let row=0;row<8;row++){
   const top=row*course;
   let x=-(row%2?3:0)*pxPerIn;
   while(x<512){
    const width=(4+random()*2.5)*pxPerIn;
    const tone=random();
    // Predominantly dark charcoal, with occasional muted lighter granules.
    const shade=roofTone==='gray'?(tone<.10?200:tone<.22?209:tone<.88?216:223):(tone<.18?230:tone<.52?211:tone<.83?196:183);
    // Four corners, broad flat top and bottom: a modest taper, no points.
    // Keep the backing close to the face shade so exposed corners don't
    // read as contrasting triangular cutouts.
    // Driftwood blends weathered gray, taupe and muted red-brown per shingle.
    // Other roof tones retain their approved neutral texture byte-for-byte.
    const tint=roofTone==='desert-tan'?(tone<.18?[1,.89,.79]:tone<.52?[1,.94,.83]:tone<.83?[1,.93,.81]:[.96,.94,.89]):roofTone==='driftwood'?(tone<.18?[1,.92,.85]:tone<.52?[.94,.97,.96]:tone<.83?[1,.96,.87]:[.98,.93,.87]):roofTone==='gray'?(tone<.10?[.99,1,1]:tone<.22?[1,.985,.96]:[1,1,.99]):[1,1,1];
    const asphalt=value=>`rgb(${tint.map(channel=>Math.round(value*channel)).join(',')})`;
    ctx.fillStyle=asphalt(shade-5);
    ctx.fillRect(x,top,width+.5,course);
    const taper=width*.085;
    ctx.beginPath();
    ctx.moveTo(x+taper,top);ctx.lineTo(x+width-taper,top);
    ctx.lineTo(x+width,top+course);ctx.lineTo(x,top+course);ctx.closePath();
    ctx.fillStyle=asphalt(shade);ctx.fill();
    ctx.save();ctx.clip();
    // Short layered lower pieces break up the stagger without large tiles.
    if(random()>.58){
     const band=course*(.3+random()*.22);
     const lower=shade+(random()>.5?9:-9);
     ctx.fillStyle=asphalt(roofTone==='gray'?shade+(lower-shade)*.35:lower);
     ctx.fillRect(x,top+course-band,width,band);
    }
    // Independent stable selection preserves the approved layout and colors.
    // Texture height represents 40 inches, so 1 inch is 12.8 pixels.
    {
     const hash=Math.sin((row+1)*127.1+(x+512)*311.7)*43758.5453;
     const pick=hash-Math.floor(hash);
     { // Every shingle receives the approved soft top shadow.
      const depth=1*512/40;
      const strength=.16+pick*.12;
      const topShadow=ctx.createLinearGradient(0,top,0,top+depth);
      topShadow.addColorStop(0,'rgba(12,12,12,0)');
      topShadow.addColorStop(.12,`rgba(12,12,12,${strength*.75})`);
      topShadow.addColorStop(.25,`rgba(12,12,12,${strength})`);
      topShadow.addColorStop(.55,`rgba(12,12,12,${strength*.42})`);
      topShadow.addColorStop(.8,`rgba(12,12,12,${strength*.10})`);
      topShadow.addColorStop(1,'rgba(12,12,12,0)');
      ctx.fillStyle=topShadow;ctx.fillRect(x,top,width,depth);
     }
    }
    ctx.restore();
    // Shaded tapered side seam stays narrow instead of outlining triangles.
    ctx.strokeStyle='rgba(20,20,20,.18)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.moveTo(x+taper,top);ctx.lineTo(x,top+course);ctx.stroke();
    x+=width;
   }
   ctx.fillStyle='rgba(20,20,20,.19)';ctx.fillRect(0,top+course-1,512,1);
  }
  // Cast shadows from the upper course onto the next exposed course.
  // Draw after all faces so subsequent rows cannot erase these shadows.
  for(let row=0;row<8;row++){
   const y=row*course;
   const shadow=ctx.createLinearGradient(0,y,0,y+5);
   shadow.addColorStop(0,'rgba(12,12,12,.10)');
   shadow.addColorStop(.3,'rgba(12,12,12,.06)');
   shadow.addColorStop(1,'rgba(12,12,12,0)');
   ctx.fillStyle=shadow;ctx.fillRect(0,y,512,5);
  }
  // Mineral grain stays fine and neutral across every charcoal shade.
  for(let i=0;i<135000;i++){
   const v=random()>.5?245:95;
   ctx.fillStyle=`rgba(${v},${v},${v},${.07+random()*.13})`;
   const size=.45+random()*.9;
   ctx.fillRect(random()*512,random()*512,size,size);
  }
 }
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function useSurface(kind,width,height,originX=0,roofTone){
 const map=useMemo(()=>{
  const t=surfaceTexture(kind,roofTone);
  const repeatWidth=kind==='siding'?(32*constructionSpecs.siding.lpPanel.grooveSpacingIn/12):8; // Forty distinct 8in LP sections
  t.repeat.set(width/repeatWidth,height/(kind==='siding'?8:10/3));
  // Offset door panels by their real position on the wall so their groove
  // centers and cedar grain scale match the adjoining LP SmartSide siding.
  if(kind==='siding'){
   t.offset.x=originX/repeatWidth;
   t.wrapT=THREE.ClampToEdgeWrapping; // no mid-wall repeat seam on 6.5ft / 7ft / 8ft siding
  }
  return t;
 },[kind,width,height,originX,roofTone]);
 useEffect(()=>()=>map.dispose(),[map]);return map;
}
// Shallow embossed cedar grain for painted LP exterior trim. Bump-only,
// so trim keeps its selected color instead of inheriting a photographic tint.
let trimGrainMap;
function getTrimGrain(){
 if(trimGrainMap)return trimGrainMap;
 const canvas=document.createElement('canvas');canvas.width=256;canvas.height=512;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#bcbcbc';ctx.fillRect(0,0,256,512);
 let seed=7143;
 const rand=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let j=0;j<500;j++){
  const x=rand()*256;
  let y=-20+rand()*500;
  const length=5+rand()*66;
  ctx.beginPath();ctx.moveTo(x,y);
  ctx.bezierCurveTo(x+(rand()-.5)*2,y+length*.3,x+(rand()-.5)*3,y+length*.7,x+(rand()-.5)*2,y+length);
  ctx.strokeStyle=rand()>.5?'rgba(250,250,250,.45)':'rgba(60,60,60,.27)';
  ctx.lineWidth=.5+rand()*1.3;ctx.stroke();
 }
 trimGrainMap=new THREE.CanvasTexture(canvas);
 trimGrainMap.wrapS=trimGrainMap.wrapT=THREE.RepeatWrapping;
 trimGrainMap.repeat.set(1,1);trimGrainMap.anisotropy=4;
 return trimGrainMap;
}
// Solid pressure-treated deck boards: elongated fibers, soft growth rings and
// variation along the grain. Reused across all six boards, with per-board offsets.
let deckGrainMap;
function getDeckGrain(){
 if(deckGrainMap)return deckGrainMap;
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#c6b59b';ctx.fillRect(0,0,1024,256);
 let seed=62185;const rnd=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296};
 for(let band=0;band<120;band++){
  const y=rnd()*256,amp=1+rnd()*7,phase=rnd()*6.28;
  ctx.beginPath();
  for(let x=0;x<=1024;x+=7){
   const yy=y+Math.sin(x/(110+rnd()*55)+phase)*amp+Math.sin(x/42+phase)*amp*.24;
   if(x===0)ctx.moveTo(x,yy);else ctx.lineTo(x,yy);
  }
  ctx.strokeStyle=rnd()>.5?'rgba(81,65,43,.28)':'rgba(250,241,219,.45)';
  ctx.lineWidth=.5+rnd()*2.2;ctx.stroke();
 }
 for(let i=0;i<10000;i++){
  const x=rnd()*1024,y=rnd()*256;
  ctx.strokeStyle=rnd()>.5?'rgba(92,71,48,.07)':'rgba(255,248,229,.16)';
  ctx.lineWidth=.3+rnd()*.8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+3+rnd()*22,y+(rnd()-.5)*1.8);ctx.stroke();
 }
 deckGrainMap=new THREE.CanvasTexture(canvas);
 deckGrainMap.wrapS=deckGrainMap.wrapT=THREE.RepeatWrapping;
 deckGrainMap.colorSpace=THREE.SRGBColorSpace;deckGrainMap.anisotropy=4;
 return deckGrainMap;
}
function DeckBoard({width,depth,thickness,position,index}){
 const tex=useMemo(()=>{
  const map=getDeckGrain().clone();map.needsUpdate=true;
  map.repeat.set(width/5,1);
  map.offset.set(index*.127,index*.173);return map;
 },[width,index]);
 useEffect(()=>()=>tex.dispose(),[tex]);
 return <mesh position={position} castShadow receiveShadow>
  <boxGeometry args={[width,thickness,depth]}/>
  <meshStandardMaterial color="#e0d3bc" map={tex} bumpMap={tex} bumpScale={.012} roughness={.96}/>
 </mesh>;
}
function Box({at,size,color,rotation,metalness=0,roughness=.8,woodgrain=false,paintMap=false,...props}){
 // Wood trim has darker painted SIDE edges, not added cast shadows.
 // BoxGeometry face order: +X, -X, +Y, -Y, +Z (front), -Z.
 const faceTones=[.78,.78,.87,.87,1,.86];
 const trimColors=woodgrain?faceTones.map(t=>new THREE.Color(color).multiplyScalar(t)):null;
 return <mesh position={at} rotation={rotation} castShadow receiveShadow {...props}>
  <boxGeometry args={size}/>
  {woodgrain?trimColors.map((shade,i)=><meshStandardMaterial key={i} attach={`material-${i}`}
   color={shade} roughness={roughness} metalness={metalness}
   bumpMap={getTrimGrain()} bumpScale={.016}/>):
   <meshStandardMaterial color={color} roughness={roughness} metalness={metalness}
    map={paintMap?getSmoothPaintMap():null}/>}
 </mesh>;
}
function Siding({width,height,paint,gable=false,originX=0}){
 const map=useSurface('siding',width,height,originX);
 const geometry=useMemo(()=>{
  const positions=gable?[-width/2,0,0,width/2,0,0,0,height,0]:[-width/2,0,0,width/2,0,0,width/2,height,0,-width/2,height,0];
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('uv',new THREE.Float32BufferAttribute(gable?[0,0,1,0,.5,1]:[0,0,1,0,1,1,0,1],2));
  g.setIndex(gable?[0,1,2]:[0,1,2,0,2,3]);g.computeVertexNormals();return g;
 },[width,height,gable]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={paint} map={map} bumpMap={map} bumpScale={.016} roughness={.92} side={THREE.DoubleSide}/></mesh>
}
// Alternative siding profiles are intentionally separate from the approved
// vertical LP panel material. All dimensions here are visual-design geometry.
// Neutral painted-wood albedo, matched to the light-gray base used by
// the approved LP door panels. Never changes the chosen paint hue.
// Each physical lap course has its own deterministic grain, not a repeated
// wallpaper texture. Gray albedo keeps every painted course the selected hue.
const lapBoardTextures=new Map();
function getLapBoardTexture(id){
 if(lapBoardTextures.has(id))return lapBoardTextures.get(id);
 const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#dedede';ctx.fillRect(0,0,768,192);
 let seed=(Math.imul(id+101,2654435761)>>>0)||1;
 const rand=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 // Short irregular horizontal embossed fibers: avoid periodic waves and
 // continuous stripes across multiple boards.
 for(let k=0;k<1900;k++){
  const x=rand()*768,y=rand()*192,span=3+rand()*42;
  const dy=(rand()-.5)*2;
  ctx.beginPath();ctx.moveTo(x,y);
  ctx.bezierCurveTo(x+span*.28,y+dy,x+span*.67,y-dy*.5,x+span,y+dy);
  const value=rand()>.5?241:165,alpha=.07+rand()*.12;
  ctx.strokeStyle='rgba('+value+','+value+','+value+','+alpha+')';
  ctx.lineWidth=.3+rand()*.7;ctx.stroke();
 }
 // Natural isolated grain curls, differently located in every board.
 for(let knot=0;knot<2;knot++){
  if(rand()<.45)continue;
  const cx=80+rand()*600,cy=24+rand()*144;
  for(let j=0;j<3;j++){
   ctx.beginPath();
   ctx.ellipse(cx,cy,12+j*9,2+j*2,(rand()-.5)*.06,0,Math.PI*2);
   ctx.strokeStyle='rgba(118,118,118,.065)';
   ctx.lineWidth=.6;ctx.stroke();
  }
 }
 const tex=new THREE.CanvasTexture(canvas);
 tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;
 lapBoardTextures.set(id,tex);
 return tex;
}
// Flat, untextured board-and-batten backing, including a continuous gable face.
// Match the approved painted LP panel's neutral underlying albedo,
// without introducing woodgrain or grooves on the smooth backing.
let smoothPaintMap;
function getSmoothPaintMap(){
 if(smoothPaintMap)return smoothPaintMap;
 const canvas=document.createElement('canvas');canvas.width=4;canvas.height=4;
 const ctx=canvas.getContext('2d');ctx.fillStyle='#dddddd';ctx.fillRect(0,0,4,4);
 smoothPaintMap=new THREE.CanvasTexture(canvas);
 smoothPaintMap.colorSpace=THREE.SRGBColorSpace;
 return smoothPaintMap;
}
function SmoothSiding({width,height,gable=false,gableStart=null,paint}){
 const geometry=useMemo(()=>{
  const shape=new THREE.Shape();
  // Carry the solid backing below the batten feet so the bare timber
  // cannot peek through at the base, even at oblique camera angles.
  shape.moveTo(-width/2,-.065);shape.lineTo(width/2,-.065);
  if(gableStart!==null){shape.lineTo(width/2,gableStart);shape.lineTo(0,height);shape.lineTo(-width/2,gableStart);}
  else if(gable){shape.lineTo(0,height);}
  else{shape.lineTo(width/2,height);shape.lineTo(-width/2,height);}
  shape.closePath();
  return new THREE.ShapeGeometry(shape);
 },[width,height,gable,gableStart]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} position={[0,0,.018]} castShadow receiveShadow={false}>
  <meshBasicMaterial color={paint} map={getSmoothPaintMap()} side={THREE.DoubleSide}/>
 </mesh>;
}
// Vinyl courses have independent, smooth manufactured profiles. No faux
// woodgrain, thick wooden-board sides, or per-course cast shadows.
// Manufactured vinyl: independent course geometry and neutral color variation.
// The subtle vertical variation belongs to the profile itself (not a strip
// floating in front of it). Exactly 5in straight / 4.5in Dutch per course.
function VinylCourse({type,paint,base,top,rawBase,reveal,widthTop}){
 const dutch=type==='vinyl-dutch';
 const geometry=useMemo(()=>{
  // Fraction of exposed course from bottom (0) to top (1);
  // z is projection in feet and the final value is a gentle shade multiplier.
  // Straight lap tapers by precisely 1/2in from bottom to top.
  const profile=dutch
   // Dutch lap: long lower face matches the paint, with the short upper
   // return shaded only on the upper 1.25in of 4.5in. The lower 3.25in
   // remains at selected paint brightness; a short hollow near the lip
   // provides a realistic Dutch-lap recess like the approved reference.
   ? [[0,.065,.98],[.025,.064,1.0],[.08,.063,1.0],[.20,.061,1.0],[.40,.057,1.0],[.60,.052,1.0],[.722222,.048,1.0],[.77,.039,.97],[.83,.029,.91],[.89,.024,.84],[.94,.024,.79],[1,.026,.86]]
   // Straight lap: full 5-inch face slopes by 1/2 inch; the narrow upper
   // portion alone takes the shadow, with no brighter-than-paint values.
   : [[0,.070,1.0],[.045,.068,1.0],[.12,.065,1.0],[.27,.058,1.0],[.50,.048,.99],[.75,.037,.97],[.90,.070-.5/12+.003,.87],[1,.070-.5/12,.86]];
  const interpolate=(t,field)=>{
   for(let k=1;k<profile.length;k++)if(t<=profile[k][0]){
    const a=profile[k-1],b=profile[k],r=(t-a[0])/(b[0]-a[0]);
    return a[field]+r*(b[field]-a[field]);
   }
   return profile[profile.length-1][field];
  };
  const pts=[[base,(base-rawBase)/reveal],[top,(top-rawBase)/reveal]];
  for(const [fraction] of profile){
   const y=rawBase+fraction*reveal;
   if(y>base+.00001&&y<top-.00001)pts.push([y,fraction]);
  }
  pts.sort((a,b)=>a[0]-b[0]);
  const positions=[],colors=[],indices=[];
  // Color-neutral vertex shading: same selected paint as the door,
  // with ~10% local modulation to reveal the actual vinyl silhouette.
  for(const [y,t] of pts){
   const w=widthTop(y),z=interpolate(t,1),v=interpolate(t,2);
   positions.push(-w/2,y,z,w/2,y,z);
   colors.push(v,v,v,v,v,v);
  }
  for(let j=0;j<pts.length-1;j++){
   const i=2*j;
   indices.push(i,i+1,i+3,i,i+3,i+2);
  }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  g.setIndex(indices);g.computeVertexNormals();
  return g;
 },[dutch,base,top,rawBase,reveal,widthTop]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh geometry={geometry} castShadow={false} receiveShadow={false}>
  <meshStandardMaterial color={paint} map={getSmoothPaintMap()}
   vertexColors roughness={.93} metalness={0} side={THREE.DoubleSide}/>
 </mesh>;
}
// Trim a raised gable batten to the actual rake angle at BOTH edges.
// Flat-topped boxes left a visible horizontal step under the rake fascia.
function GableRakeBatten({x,width,height,peakStart,lower,upper,roofCut,paint,inset}){
 const battenWidth=2.5/12,battenDepth=.75/12,edgeWidth=.38/12;
 const topLine=xx=>peakStart+(height-peakStart)*Math.max(0,1-Math.abs(xx)/(width/2))-inset;
 const left=x-battenWidth/2,right=x+battenWidth/2;
 const leftTop=roofCut?topLine(left):upper,rightTop=roofCut?topLine(right):upper;
 const geometry=useMemo(()=>{
  const shape=new THREE.Shape();
  shape.moveTo(left,lower);shape.lineTo(right,lower);
  shape.lineTo(right,rightTop);shape.lineTo(left,leftTop);shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:battenDepth,bevelEnabled:false,steps:1});
 },[left,right,lower,leftTop,rightTop]);
 const edgeShapes=useMemo(()=>[-1,1].map(side=>{
  const a=x+side*(battenWidth/2-edgeWidth),b=a+edgeWidth;
  const shape=new THREE.Shape();
  shape.moveTo(a,lower);shape.lineTo(b,lower);
  shape.lineTo(b,roofCut?topLine(b):upper);
  shape.lineTo(a,roofCut?topLine(a):upper);shape.closePath();
  return new THREE.ShapeGeometry(shape);
 }),[x,lower,upper,roofCut,width,height,peakStart,inset]);
 useEffect(()=>()=>{geometry.dispose();edgeShapes.forEach(g=>g.dispose())},[geometry,edgeShapes]);
 return <group>
  <mesh geometry={geometry} position={[0,0,.007]} castShadow={false} receiveShadow={false}>
   {[1,.65].map((tone,i)=><meshBasicMaterial key={i} attach={`material-${i}`}
    color={new THREE.Color(paint).multiplyScalar(tone)} map={getSmoothPaintMap()} side={THREE.DoubleSide}/>)}
  </mesh>
  {edgeShapes.map((g,i)=><mesh key={i} geometry={g} position={[0,0,battenDepth+.011]}>
   <meshBasicMaterial color={new THREE.Color(paint).multiplyScalar(.55)} side={THREE.DoubleSide}/>
  </mesh>)}
 </group>;
}
function ExteriorSiding({width,height,paint,type='lp-panel',gable=false,originX=0,courseOrigin=0,gableStart=null,ventCutout=null,battenEaveInset=0}){
 if(type==='lp-panel')return <Siding width={width} height={height} paint={paint} gable={gable} originX={originX}/>;
 const horizontal=type!=='board-batten';
 // All alternative siding uses the customer's selected paint color.
 // The lap profiles are solid 3D geometry, with non-repeating course texture.
 const lapPaint=paint; // Exact selected siding color, without albedo tint.
 const widthTop=(y)=>gableStart!==null? (y<=gableStart?width:Math.max(0,width*(1-(y-gableStart)/(height-gableStart)))) : gable?Math.max(0,width*(1-y/height)):width;
 if(horizontal){
  // Six-inch painted lap reveal; vinyl profiles use a provisional 4in course
  // until the manufacturer/profile is confirmed by the owner.
  const reveal=({lap:6,'vinyl-dutch':4.5,'vinyl-straight':5}[type]??6)/12;
  const phase=((courseOrigin%reveal)+reveal)%reveal;
  // Start the first gable course BELOW the eave when needed, then clip at y=0.
  // Starting above zero exposed a wedge of bare gable at the wall junction.
  const first=phase<.00001||reveal-phase<.00001?0:-phase;
  const n=Math.ceil((height-first)/reveal);
  return <group>
   {Array.from({length:n},(_,i)=>{
    const rawBase=first+i*reveal,base=Math.max(0,rawBase),top=Math.min(height,rawBase+reveal),h=top-base;
    if(h<=0)return null;
    const bottomWidth=widthTop(base),topWidth=widthTop(top);
    if(bottomWidth<=0)return null;
    // Physical lap: the lower edge stands proud of the upper edge.
    // The overlapping lip casts a soft shadow onto the next course.
    const isWood=type==='lap';
    if(!isWood)return <VinylCourse key={i} type={type} paint={paint} base={base} top={top} rawBase={rawBase} reveal={reveal} widthTop={widthTop}/>;
    // Straight vinyl lap has a shallow wedge profile: a 1/2-inch proud lower lip.
    const topDepth=type==='vinyl-straight'?.025:isWood?.041:.035;
    const bottomDepth=type==='vinyl-straight'?topDepth+.5/12:isWood?.085:.049;
    // Both the rectangular wall and the triangular gable are CLIPS of the
    // same uninterrupted 6-inch courses. At the eave they must have identical
    // front-face depth; otherwise two different slopes meet and make the huge
    // false "double lap" shadow. Interpolate BOTH clipped ends of each course.
    const depthAt=y=>bottomDepth+(topDepth-bottomDepth)*((y-rawBase)/reveal);
    const clippedBottomDepth=depthAt(base);
    const clippedTopDepth=depthAt(top);
    // A solid, closed lap board instead of a single surface. 7/16in thick
    // from front to back, including the lower lip and both gable-cut edges.
    const thickness=7/16/12;
    const vertices=new Float32Array([
     -bottomWidth/2,base,clippedBottomDepth, bottomWidth/2,base,clippedBottomDepth,
      topWidth/2,top,clippedTopDepth, -topWidth/2,top,clippedTopDepth,
     -bottomWidth/2,base,clippedBottomDepth-thickness, bottomWidth/2,base,clippedBottomDepth-thickness,
      topWidth/2,top,clippedTopDepth-thickness, -topWidth/2,top,clippedTopDepth-thickness
    ]);
    const courseShape=new THREE.BufferGeometry();
    courseShape.setAttribute('position',new THREE.BufferAttribute(vertices,3));
    // Duplicate faces are not needed; the physical bottom, top, sides and
    // back close the previously open gaps between successive courses.
    courseShape.setIndex([
      0,1,2,0,2,3, 5,4,7,5,7,6,
      4,5,1,4,1,0, 3,2,6,3,6,7,
      0,3,7,0,7,4, 1,5,6,1,6,2
    ]);
    courseShape.setAttribute('uv',new THREE.Float32BufferAttribute([
      0,base*2,1,base*2,1,top*2,0,top*2,
      0,base*2,1,base*2,1,top*2,0,top*2
    ],2));
    courseShape.computeVertexNormals();
    return <group key={i}>
     <mesh geometry={courseShape} castShadow={false} receiveShadow={false}>
      <meshStandardMaterial color={paint}
       map={isWood?getLapBoardTexture(i+(gable?100:0)+Math.round(width*7)*10):null}
       bumpMap={isWood?getLapBoardTexture(i+(gable?100:0)+Math.round(width*7)*10):null}
       bumpScale={isWood?.002:0} roughness={.88} side={THREE.DoubleSide}
       emissive={isWood?'#000000':paint} emissiveIntensity={isWood?0:.18}/>
     </mesh>
     {/* The narrow dark recess belongs behind the course's lower lip,
         not a painted black stripe across the face. */}
     {/* The lap itself produces the shadow; an extra strip would create a seam across the gable. */}
     {/* Dutch-lap profile is formed by the course geometry; no floating
         rectangular highlight strip that catches unrelated lighting. */}
    </group>;
   })}
  </group>;
 }
 // Smooth panel with true 2in-wide, 1/2in-raised battens on 16in centers.
 // Start at wall CENTER, then distribute identical spacing in both directions.
 const spacing=16/12,battenWidth=2.5/12,battenDepth=.75/12;
 const number=Math.ceil(width/(2*spacing));
 return <group>
  <SmoothSiding width={width} height={height} paint={paint} gable={gable} gableStart={gableStart}/>
  {Array.from({length:number*2+1},(_,i)=>{
   const x=(i-number)*spacing;
   // Leave 2 inches of clear siding between a batten edge and the 3.5-inch corner casing.
   // Do not render a batten behind or immediately beside corner trim.
   const cornerClearance=(3.5+2+2.5/2)/12;
   if(Math.abs(x)>width/2+.001||width/2-Math.abs(x)<cornerClearance)return null;
   const peakStart=gableStart!==null?gableStart:gable?0:null;
   // Rake battens must clear the roof at BOTH edges of their 2.5in width,
// not only at the center. Without this they stick through the shingles.
   const rakeSlope=peakStart===null?0:(height-peakStart)/(width/2);
   const rakeEdgeClearance=rakeSlope*battenWidth/2;
   const top=(peakStart===null?height:peakStart+(height-peakStart)*Math.max(0,1-Math.abs(x)/(width/2)))-battenEaveInset-(peakStart===null?rakeEdgeClearance:0);
   // Extend through the base of the panel; a positive bottom offset left
   // the visible tan gaps at every batten foot.
   const edgeShade=new THREE.Color(paint).multiplyScalar(.55);
   const edgeWidth=.38/12;
   const frontZ=battenDepth+.007;
   const pieces=ventCutout&&Math.abs(x)<ventCutout.halfWidth+battenWidth/2
     ? [[-.018,Math.min(top,ventCutout.bottom)],[Math.max(-.018,ventCutout.top),top]]
     : [[-.018,top]];
   return <group key={i}>
    {pieces.map(([bottom,upper],part)=>{
     if(upper<=bottom+.001)return null;
     const partHeight=upper-bottom,partCenter=(upper+bottom)/2;
     if(peakStart!==null)return <GableRakeBatten key={part} x={x} width={width} height={height}
      peakStart={peakStart} lower={bottom} upper={upper}
      roofCut={Math.abs(upper-top)<.0001} paint={paint} inset={battenEaveInset}/>;
     return <group key={part}>
      {/* Define the actual 3/4-inch side faces rather than relying on
           thin painted lines on the front: visibly stronger on pale siding. */}
      <mesh position={[x,partCenter,battenDepth/2+.007]} castShadow={false} receiveShadow={false}>
       <boxGeometry args={[battenWidth,partHeight,battenDepth]}/>
       {[.60,.60,.86,.86,1,.82].map((tone,face)=><meshBasicMaterial
        key={face} attach={`material-${face}`}
        color={new THREE.Color(paint).multiplyScalar(tone)}
        map={getSmoothPaintMap()} 
        />)}
      </mesh>
      {[-1,1].map(side=><mesh key={side}
        position={[x+side*(battenWidth/2-edgeWidth/2),partCenter,frontZ+.004]}>
         <boxGeometry args={[edgeWidth,partHeight,.006]}/>
         <meshBasicMaterial color={edgeShade}/>
        </mesh>)}
     </group>;
    })}
   </group>;
  })}
 </group>;
}
// Cape Fear Shed standard aluminum gable vent: 16in wide x 4in tall,
// thin white stamped face with three banks of five horizontal louvers.
// The visible plate/raised louvers have less than 1/8in total projection.
function Vent({rise,pitch,centerOverride=null}){
 const width=16/12,height=4/12;
 const plateDepth=.0045, slotDepth=.0007;
 const white='#eef0ec', shadow='#3e4544';
 const bankWidth=3.85/12,bankSpacing=5.05/12;
 // Top vent corners are 3in vertically below the sloped gable roofline.
 // At each 8in half-width: roof falls (8in * pitch/12) from the peak.
 const halfWidthIn=8, topClearanceIn=3;
 const centerAboveWall=rise-(halfWidthIn*pitch/12+topClearanceIn+2)/12;
 return <group position={[0,centerOverride??centerAboveWall,.012]}>
  {/* Narrow rectangular aluminum mounting flange and shallow pressed rim. */}
  <Box at={[0,0,0]} size={[width,height,plateDepth]} color={white} roughness={.4}/>
  {[-1,1].map(side=><React.Fragment key={side}>
   <Box at={[0,side*(height/2-.018),.003]} size={[width-.08,.012,.003]} color="#d8dedb"/>
   <Box at={[side*(width/2-.018),0,.003]} size={[.012,height-.06,.003]} color="#d8dedb"/>
  </React.Fragment>)}
  {[-1,0,1].flatMap((bank)=>Array.from({length:5},(_,i)=>{
   const x=bank*bankSpacing, y=(2-i)*(.73/12);
   return <group key={bank+'-'+i}>
    {/* Dark screened slot recessed into the white sheet metal. */}
    <Box at={[x,y-.008,.003]} size={[bankWidth,.021,slotDepth]} color={shadow}/>
    {/* Slim pressed aluminum hood: bright upper lip, softly shaded lower edge. */}
    <Box at={[x,y+.003,.006]} size={[bankWidth,.019,.003]} color={white} rotation={[-.22,0,0]}/>
    <Box at={[x,y-.015,.005]} size={[bankWidth-.014,.004,.002]} color="#b8c1bd"/>
   </group>;
  }))}
  {/* Six small fastener holes, matching the photographed flange. */}
  {[-1,0,1].flatMap(x=>[-1,1].map(y=>
   <mesh key={x+'-'+y} position={[x*(width/2-.075),y*(height/2-.027),.004]} rotation={[0,0,0]}>
    <circleGeometry args={[.007,10]}/>
    <meshStandardMaterial color="#59615f" roughness={.75}/>
   </mesh>
  ))}
 </group>;
}
// Shared dark warm gray-brown glazing: resembles an unlit, unfinished shed interior.
const WINDOW_PANE_COLOR='#3D3934';
function Opening({o,w,l,selected,onSelect,paint,trim,trimDepth=.75,sidingType='lp-panel'}){
 const long=o.wall==='front'||o.wall==='back',span=long?l:w,a=o.x/12-span/2;
 const isDoor=o.kind==='door';
 const isDouble=isDoor&&o.type==='double';
 const transom=isDoor&&Boolean(o.transom);
 const doorH=73.5/12;
 const transomH=transom?10.25/12:0;
 const assemblyHeight=isDoor?73.5+7/16:o.height;
 // Alternative siding projects farther than the original LP wall plane.
 // Bring the ENTIRE opening assembly forward, so glass and casing cannot
 // disappear behind lap courses or profile edges.
 // Alternate profiles sit close to the wall: the original .235ft offset made
 // the window and door assemblies float several inches in front of siding.
 const projection=sidingType==='lp-panel'?.045:.115;
 const pos=long?[a,FLOOR+o.y/12+assemblyHeight/24,(o.wall==='front'?1:-1)*(w/2+projection)]:[(o.wall==='right'?1:-1)*(l/2+projection),FLOOR+o.y/12+assemblyHeight/24,a];
 const rotation=[0,long?(o.wall==='front'?0:Math.PI):(o.wall==='right'?Math.PI/2:-Math.PI/2),0];
 const doorGap=7/16/12;
 // Standard 4ft double door: two exact 24 x 73.5in leaves plus three 7/16in reveals.
 const wd=isDoor?(o.width/12+(isDouble?3:2)*doorGap):o.width/12;
 const ht=isDoor?doorH+doorGap:o.height/12;
 const frame=trim;
 const vinylDoor=sidingType==='vinyl-straight'||sidingType==='vinyl-dutch';
 const defaultDoorPaint=vinylDoor?'#F2F0EB':paint;
 const doorPanelPaint=o.secondaryDoorColor&&o.doorPaint?o.doorPaint:defaultDoorPaint;
 const doorLeafTrimPaint=o.secondaryDoorColor&&o.doorPaint?o.doorPaint:(vinylDoor?'#F2F0EB':trim);
 const trimThickness=trimDepth/12; // 3/4in standard, true 1in on alternate siding
 const trimWidth=constructionSpecs.siding.lpPanel.trim.widthIn/12; // Standard LP SmartSide trim: 3-1/2in face
 const doorReveal=constructionSpecs.doubleDoor4Ft.revealIn/12; // Measured 7/16in reveal at both sides, top, and meeting stile
 return <group position={pos} rotation={rotation} onClick={e=>{e.stopPropagation();onSelect(o.id)}}>
  <group position={[0,0,sidingType==='lp-panel'?-.10:.018]}>
   {/* Flat, nominal 1x4 exterior casing: restrained projection, square joints. */}
   <Box at={[0,0,.025]} size={[wd+.015,ht+.015,.045]} color={o.kind==='door'?doorPanelPaint:'#26342e'}/>
   {o.kind==='window'?<>
    {/* Exact LP SmartSide window trim cut list:
        side pieces 27 3/8in; top and sill 26 1/4in.
        Top and sill project 1/2in beyond the outer edge of each side piece. */}
    {[-1,1].map(side=><Box key={'wcasing'+side}
      at={[side*(o.shutters?(26.25/2-.5-3.5+9/2):(26.25/2-.5-3.5/2))/12,0,.08625]}
      size={[(o.shutters?9:3.5)/12,27.375/12,trimThickness]} color={frame} woodgrain/>)}
    {[-1,1].map(side=><Box key={'whead'+side}
      at={[0,side*(27.375/2+3.5/2)/12,.08625]}
      size={[26.25/12,3.5/12,trimThickness]} color={frame} woodgrain/>)}
   </>:<>
    {[-1,1].map(side=><Box key={side} at={[side*(wd/2+trimWidth/2),trimWidth/2,.08625]} size={[trimWidth,ht+trimWidth,trimThickness]} color={frame} woodgrain/>)}
    <Box at={[0,ht/2+trimWidth/2,.08625]} size={[wd+2*trimWidth+1/12,trimWidth,trimThickness]} color={frame} woodgrain/>
   </>}
   {o.kind==='door'?<>
    {/* Measured 7/16-inch top, hinge-side and center reveals; two separate door leaves. */}
    {(isDouble?[-1,1]:[0]).map(side=>{
     const gap=doorReveal;
     const leafWidth=o.width/12/(isDouble?2:1);
     const leafHeight=doorH;
     // Two full-height 3.5in stiles frame three precisely cut rails.
     // 24in leaf: 17in rails; 30in: 23in; 32in: 25in; 36in: 29in.
     const railLength=(o.width/(isDouble?2:1)-2*constructionSpecs.siding.lpPanel.trim.widthIn)/12;
     const centerX=isDouble?side*(gap/2+leafWidth/2):0;
     const outerX=isDouble?side*(wd/2-gap):(wd/2-gap);
     const innerX=isDouble?side*gap/2:-(wd/2-gap);
     const topY=-ht/2+doorH;
     const bottomY=-ht/2;
     const midY=(topY+bottomY)/2;
     return <group key={side}>
      {/* Exact same LP SmartSide surface and paint as shed walls; the offset aligns
          each leaf's 8-inch groove pattern to its position on the full wall. */}
      <group position={[centerX,bottomY,.066]}><Siding width={leafWidth} height={leafHeight} paint={doorPanelPaint} originX={o.x/12+centerX-leafWidth/2}/></group>
      {/* Photo-accurate door leaf stiles, top/bottom rails and central mid rail. */}
      <Box at={[outerX-(isDouble?side:1)*trimWidth/2,midY,.119]} size={[trimWidth,leafHeight,trimThickness]} color={doorLeafTrimPaint} woodgrain/>
      <Box at={[isDouble?innerX+side*trimWidth/2:centerX-leafWidth/2+trimWidth/2,midY,.119]} size={[trimWidth,leafHeight,trimThickness]} color={doorLeafTrimPaint} woodgrain/>
      {[topY-trimWidth/2,midY,bottomY+trimWidth/2].map((y,i)=><Box key={i} at={[centerX,y,.119]} size={[railLength,trimWidth,trimThickness]} color={doorLeafTrimPaint} woodgrain/>)}
      {transom&&(()=>{
       const lights=isDouble?(o.width===60?4:3):5;
       const windowWidth=railLength; // fits exactly between the 3.5in stiles
       const windowHeight=10.25/12;
       const glassTop=topY-trimWidth;
       const windowCenterY=glassTop-windowHeight/2;
       const lowerRailY=glassTop-windowHeight-trimWidth/2;
       return <group>
        {/* 10 1/4in transom fits inside the door below its existing top rail. */}
        {/* The entire transom stays near the face of the LP panel (z=.066);
            full 3/4in woodgrain trim projects forward over the glass. */}
        <Box at={[centerX,windowCenterY,.071]} size={[windowWidth,windowHeight,.010]} color="#e0e4e1"/>
        <Box at={[centerX,windowCenterY,.078]} size={[windowWidth-.045,windowHeight-.045,.007]} color={WINDOW_PANE_COLOR}/>
        <Box at={[centerX,windowCenterY,.083]} size={[windowWidth-.065,windowHeight-.065,.005]} color={WINDOW_PANE_COLOR}/>
        {Array.from({length:lights-1},(_,i)=>{
         const offset=(i+1)*windowWidth/lights-windowWidth/2;
         return <Box key={i} at={[centerX+offset,windowCenterY,.09]} size={[.038,windowHeight-.03,.018]} color="#e8eae7"/>;
        })}
        {/* Extra rail immediately beneath transom: 17/23/29in as applicable. */}
        <Box at={[centerX,lowerRailY,.119]} size={[railLength,trimWidth,trimThickness]} color={doorLeafTrimPaint} woodgrain/>
       </group>;
      })()}
      {/* Black tee hinges: tall plate beyond the barrel, visible barrel, long
          straight-sided strap tapering to a generously rounded nose. */}
      {[topY-.125,midY,bottomY+.125].map((y,i)=>{
       const dir=isDouble?-side:-1,shape=new THREE.Shape();
       // 3/4in shorter than preceding strap; preserve base height.
       // Small scalloped shoulder leading to a rounded terminal nose.
       shape.moveTo(0,-.092);
       shape.lineTo(dir*.04,-.092);
       shape.lineTo(dir*.4075,-.027);
       shape.lineTo(dir*.4075,-.022);
       shape.quadraticCurveTo(dir*.445,-.025,dir*.455,-.012);
       shape.quadraticCurveTo(dir*.468,0,dir*.455,.012);
       shape.quadraticCurveTo(dir*.445,.025,dir*.4075,.022);
       shape.lineTo(dir*.4075,.027);
       shape.lineTo(dir*.04,.092);
       shape.lineTo(0,.092);
       shape.closePath();
       // The mounting plate meets the barrel; no horizontal separation.
       const hingeSide=isDouble?side:1;
       const mountX=hingeSide*(wd/2+.055);
       const barrelX=hingeSide*(wd/2-gap*.5);
       // Dimensions in feet: hinge steel is 1/8in, knuckle max 1/2in thick.
       // Door leaf trim and outer casing have different face planes.
       const steel=0.125/12;
       const doorTrimFace=.119+trimThickness/2;
       const casingFace=.08625+trimThickness/2;
       const barrelRadius=.25/12;
       return <group key={i}>
        {/* 1/8in plate mounted directly to exterior casing. */}
        <Box at={[mountX,y,casingFace+steel/2]} size={[.19,4.4/12,steel]} color="#151718" metalness={.35}/>
        {[-.135,.135].map(yy=><mesh key={yy} position={[mountX,y+yy,casingFace+steel+.001]}>
         <circleGeometry args={[.016,12]}/><meshStandardMaterial color="#454747" metalness={.55}/>
        </mesh>)}
        {/* Hinge pin is the only bulky component, at about 1/2in diameter. */}
        <mesh position={[barrelX,y,doorTrimFace+barrelRadius]}>
         <cylinderGeometry args={[barrelRadius,barrelRadius,.22,16]}/><meshStandardMaterial color="#171919" metalness={.55}/>
        </mesh>
        {/* Thin steel strap lies on the face of the door leaf trim. */}
        <mesh position={[barrelX,y,doorTrimFace]}>
         <extrudeGeometry args={[shape,{depth:steel,bevelEnabled:false,steps:1}]}/>
         <meshStandardMaterial color="#151718" metalness={.4} roughness={.55}/>
        </mesh>
        {[.105,.245,.39].map((xx,j)=><mesh key={j} position={[barrelX+dir*xx,y,doorTrimFace+steel+.001]}>
         <circleGeometry args={[.013,12]}/><meshStandardMaterial color="#484b4c" metalness={.55}/>
        </mesh>)}
       </group>;
      })}
     </group>;
    })}
    {/* T-handle matches the measured molded, symmetric tapered grips. */}
    {/* Every single-door handle is centered exactly where its middle rail meets the handle-side 73.5in stile. */}
    <group position={[isDouble?doorReveal/2+trimWidth/2:-o.width/24+trimWidth/2,isDouble?-.02:-ht/2+doorH/2,.19]}>
     <mesh scale={[.075,.117,.02]}><sphereGeometry args={[1,24,16]}/><meshStandardMaterial color="#191b1c" roughness={.53} metalness={.35}/></mesh>
     {/* Raised spindle centered on the oval escutcheon. */}
     <mesh position={[0,0,.048]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.038,.038,.09,20]}/><meshStandardMaterial color="#202324" metalness={.35}/></mesh>
     {[-1,1].map(side=>{
      const shape=new THREE.Shape();
      shape.moveTo(0,-.045);
      shape.lineTo(side*.045,-.044);
      shape.lineTo(side*.155,-.030);
      shape.lineTo(side*.16,-.015);
      shape.quadraticCurveTo(side*.174,0,side*.16,.015);
      shape.lineTo(side*.155,.030);
      shape.lineTo(side*.045,.044);
      shape.lineTo(0,.045);
      shape.closePath();
      return <mesh key={side} position={[0,0,.091]}>
       <extrudeGeometry args={[shape,{depth:.038,bevelEnabled:true,bevelSize:.009,bevelThickness:.008,bevelSegments:3,steps:1}]}/>
       <meshStandardMaterial color="#202224" roughness={.47} metalness={.32}/>
      </mesh>;
     })}
     <mesh position={[0,0,.142]}><circleGeometry args={[.033,20]}/><meshStandardMaterial color="#aab0b0" metalness={.8} roughness={.28}/></mesh>
     <Box at={[0,0,.145]} size={[.026,.006,.003]} color="#25292a"/>
    </group>
    <Box at={[0,-ht/2+.02,.072]} size={[wd,.045,.075]} color="#777c7b" metalness={.65}/>
   </>:<>
   {/* Window outer flange is flush with siding; the LP casing overlaps it.
       Window sash and glazing are recessed within the frame, not projecting beyond siding. */}
       {/* The wall siding remains an uncut opaque plane in V1.2.
        The window must therefore sit just in FRONT of local siding z=.055
        to avoid being occluded. Casing spans z=.055..1175, with its full
        3/4in thickness proud of the siding, and visually overlaps the flange. */}
    <Box at={[0,0,.061]} size={[wd,ht,.012]} color={constructionSpecs.standardWindow.frameColor}/>
    <Box at={[0,0,.068]} size={[wd-1.5/12,ht-1.5/12,.008]} color={WINDOW_PANE_COLOR}/>
    <mesh position={[0,0,.073]}>
      <planeGeometry args={[wd-1.7/12,ht-1.7/12]}/>
      <meshPhysicalMaterial color={WINDOW_PANE_COLOR} roughness={.16} metalness={.12} transparent opacity={.95} clearcoat={.8}/>
    </mesh>
    {/* Visible sash frame and eight panes kept behind the outer trim face. */}
    {[-1,1].map(side=><group key={'sash'+side}>
      <Box at={[side*(wd/2-.060),0,.079]} size={[.12,ht,.020]} color={constructionSpecs.standardWindow.frameColor}/>
      <Box at={[0,side*(ht/2-.060),.079]} size={[wd,.12,.020]} color="#f0f0ed"/>
    </group>)}
    <Box at={[0,0,.081]} size={[wd,.17,.020]} color={constructionSpecs.standardWindow.frameColor}/>
    <Box at={[0,0,.081]} size={[.055,ht-.20,.020]} color={constructionSpecs.standardWindow.frameColor}/>
    {[-1,1].map(side=><Box key={'muntin'+side}
      at={[0,side*ht/4,.081]} size={[wd-.15,.045,.020]} color={constructionSpecs.standardWindow.frameColor}/>)}
   </>}

  </group>
  {isDoor&&o.ramp&&(()=>{
   // Six true 1 x 5.5in deck boards, separated by 1/4in open joints.
   // Boards run across the full door width; 34.25in overall slope length.
   const boardDepth=5.5/12,gap=.25/12,boardThickness=.75/12;
   const count=6,slopeLength=count*boardDepth+(count-1)*gap;
   const run=slopeLength*.985,rise=FLOOR-.08,angle=Math.atan2(rise,run);
   const rampWidth=o.width/12;
   // The top deck-board edge starts just outside the wall/threshold,
   // rather than the prior 2+ inch setback. Preserve 1/2in vertical clearance.
   const centerZ=slopeLength*Math.cos(angle)/2+.025;
   const centerY=-ht/2-rise/2-.5/12-boardThickness/2;
   return <group rotation={[angle,0,0]} position={[0,centerY,centerZ]}>
    {/* Three longitudinal supports: left, center and right. */}
    {[-1,0,1].map(side=><Box key={side}
      at={[side*(rampWidth/2-.18),-.075,0]}
      size={[.14,.15,slopeLength-.1]} color="#806b4d"/>)}
    {Array.from({length:count},(_,i)=>{
     const z=-slopeLength/2+boardDepth/2+i*(boardDepth+gap);
     return <DeckBoard key={i} index={i} position={[0,boardThickness/2,z]}
       width={rampWidth} thickness={boardThickness} depth={boardDepth}/>;
    })}
   </group>;
  })()}
 </group>
}
// Thin folded aluminum drip edge. The 2-1/4in fastening flange is hidden
// beneath the shingles; only the subtle upper flare, 1-1/2in vertical face,
// and small bottom kick should be visible.
function EaveDripEdge({length,edgeZ,side=1,softShadows=false}){
 const face=1.5/12, metal=.012/12;
 const upperY=.018; // kept below shingle surface (top of shingles is .035)
 const outerZ=edgeZ+side*.010;
 return <group>
  {/* Concealed 2-1/4in flange underneath the shingle layer. */}
  <Box at={[0,-.002,edgeZ-side*(2.25/12)/2]} size={[length,metal,2.25/12]} color="#bfc4c3" metalness={.7} castShadow={!softShadows}/>
  {/* Tiny outward upper fold at roof perimeter. */}
  <Box at={[0,upperY-.008,outerZ+side*.009]} size={[length,metal,.035]} rotation={[side*.32,0,0]} color="#bfc4c3" metalness={.7} castShadow={!softShadows}/>
  <Box at={[0,upperY-face/2,outerZ+side*.018]} size={[length,face,metal]} color="#bfc4c3" metalness={.7} castShadow={!softShadows}/>
  {/* Restrained flared drip hem on the lower edge. */}
  <Box at={[0,upperY-face-.005,outerZ+side*.030]} size={[length,metal,.032]} rotation={[side*.34,0,0]} color="#bfc4c3" metalness={.7} castShadow={!softShadows}/>
 </group>;
}
// Each cap needs its own world-scale UV repeat. Reusing the full roof map
// squeezed an entire roof's mineral detail onto each five-inch ridge cap.
function RidgeCapSurface({length,color,angle,side,offset,softShadows,fieldMap}){
 const map=useMemo(()=>{
  const t=fieldMap.clone();
  t.repeat.set(length/8,(4.5/12)/(10/3));
  t.offset.set(offset/8,0);
  return t;
 },[fieldMap,length,offset]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh castShadow={!softShadows} receiveShadow
  position={[0,-(4.5/12)*Math.sin(angle)/2,side*(4.5/12)*Math.cos(angle)/2]}
  rotation={[side*angle,0,0]}>
  <boxGeometry args={[length,.021,4.5/12]}/>
  <meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} roughness={.98}/>
 </mesh>;
}
function Roof({w,l,pitch,wall,roofColor,trim,overhangInches=4,softShadows=false}){
 const d=roofDimensions(w,l,pitch,wall,overhangInches);
 // Shingles extend 3/4in past the drip edge on the eaves and both rakes.
 // The decking and aluminum drip edge retain their approved dimensions.
 const shingleProjection=0.75/12;
 const map=useSurface('shingles',d.roofLength+2*shingleProjection,d.slope+shingleProjection,0,roofColor);
 const color={charcoal:'#353638',gray:'#666661',driftwood:'#686057','desert-tan':'#817569'}[roofColor]||'#353638';
 return <group>
  {[-1,1].map(s=><group key={s} position={[0,(d.ridgeY+d.eaveY)/2,s*d.run/2]} rotation={[s*d.angle,0,0]}>
   <Box at={[0,-.045,0]} size={[d.roofLength,.09,d.slope]} color={trim} castShadow={!softShadows}/>
   <mesh position={[0,.0175,s*shingleProjection/2]} castShadow={!softShadows} receiveShadow><boxGeometry args={[d.roofLength+2*shingleProjection,.035,d.slope+shingleProjection]}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} roughness={.98}/></mesh>
   {/* Architectural shingle laps and staggered laminate tabs are in the textured surface. */}
   {[-1,1].map(end=><Box key={end} at={[end*(d.roofLength/2-.028),-.042,0]} size={[.075,1.75/12,d.slope+.05]} color={trim} castShadow={!softShadows}/>)}
   <Box at={[0,-.042,s*d.slope/2]} size={[d.roofLength,1.75/12,.075]} color={trim} castShadow={!softShadows}/>
   <EaveDripEdge length={d.roofLength} edgeZ={s*d.slope/2} side={s} softShadows={softShadows}/>
  </group>)}
  {/* Ridge caps are opaque architectural asphalt, not painted metal.
      5in along ridge x 9in across, 4.5in down each slope.
      Same granular shingle albedo as the roof, with per-cap variation. */}
  {Array.from({length:Math.ceil(d.roofLength/(5/12))},(_,i)=>{
   const length=Math.min(5/12,d.roofLength-i*5/12);
   // Ridge caps use the field asphalt shade; large per-cap color swings
   // made the ridge read as alternating blocks instead of overlapping asphalt.
   const capColor=color;
   return <group key={i} position={[-d.roofLength/2+i*5/12+length/2,d.ridgeY+.06,0]}>
    {[-1,1].map(side=><group key={side}>
     <RidgeCapSurface length={length} color={capColor} angle={d.angle} side={side}
      offset={i*5/12} softShadows={softShadows} fieldMap={map}/>
     {/* Shadow seam along the 9-inch transverse edge of each cap.
         Each half is 4.5 inches, so together the seam spans the whole cap. */}
     <Box
       at={[length/2-.012,-(4.5/12)*Math.sin(d.angle)/2+.019,side*(4.5/12)*Math.cos(d.angle)/2]}
       rotation={[side*d.angle,0,0]}
       size={[.021,.006,4.5/12]}
       color="#1b1d20" castShadow={!softShadows}/>

    </group>)}
   </group>;
  })}
 </group>
}
// Prototype 10ft-wide shed dormer: six-foot box with two 10x23in
// transom windows. The dormer rises above the 7/12 main gable roof and
// carries its own 2/12 shed roof. Wider options are intentionally disabled.
// Dormer cheek cladding is cut between TWO sloping roof lines.
// Generate each lap as a real clipped course, not a flat painted texture.
// Local x runs from the front of the dormer toward the ridge.
function DormerSlopedBatten({x,half,bottomAt,topAt,paint}){
 // The 7/12 main roof rises toward the rear of the dormer. Its shingles
 // sit proud of the framing plane: keep the entire batten end underneath.
 const geometry=useMemo(()=>{
  const shape=new THREE.Shape(),left=x-half,right=x+half;
  const roofClearance=.025;
  shape.moveTo(left,bottomAt(left)+roofClearance);
  shape.lineTo(right,bottomAt(right)+roofClearance);
  shape.lineTo(right,topAt(right)-.06);
  shape.lineTo(left,topAt(left)-.06);shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:.75/12,steps:1,bevelEnabled:false});
 },[x,half,bottomAt,topAt]);
 const edgeGeometries=useMemo(()=>[-1,1].map(side=>{
  const edgeWidth=.38/12,at=x+side*(half-edgeWidth/2);
  const left=at-edgeWidth/2,right=at+edgeWidth/2;
  const poly=new THREE.Shape();
  poly.moveTo(left,bottomAt(left)+.025);
  poly.lineTo(right,bottomAt(right)+.025);
  poly.lineTo(right,topAt(right)-.06);
  poly.lineTo(left,topAt(left)-.06);
  poly.closePath();
  return new THREE.ShapeGeometry(poly);
 }),[x,half,bottomAt,topAt]);
 useEffect(()=>()=>{geometry.dispose();edgeGeometries.forEach(g=>g.dispose())},[geometry,edgeGeometries]);
 const shade=new THREE.Color(paint);
 return <group>
  <mesh geometry={geometry} position={[0,0,.017]} castShadow={false} receiveShadow={false}>
   {[1,.60].map((tone,i)=><meshBasicMaterial key={i} attach={`material-${i}`}
    color={shade.clone().multiplyScalar(tone)} map={getSmoothPaintMap()}
    side={THREE.DoubleSide}/>)}
  </mesh>
  {edgeGeometries.map((g,i)=><mesh key={i} geometry={g} position={[0,0,.75/12+.019]}
   castShadow={false} receiveShadow={false}>
   <meshBasicMaterial color={shade.clone().multiplyScalar(.55)} side={THREE.DoubleSide}/>
  </mesh>)}
 </group>;
}
function DormerCheekFinish({depth,frontHeight,rearHeight,rearBottom,paint,sidingType}){
 const panel=sidingType==='lp-panel';
 const batten=sidingType==='board-batten';
 const height=Math.max(rearHeight,frontHeight)+.02;
 const grain=useSurface('siding',depth,height);
 // Hide LP lap and raised batten ends behind the 3.5-inch front corner casing.
 // The two approved vinyl profiles keep their existing geometry unchanged.
 const cutBack=sidingType==='lap'?1.5/12:batten?3.5/12:0;
 // The main gable roof slope runs across shed width, not dormer depth.
 // Therefore its intersection with each dormer cheek is HORIZONTAL.
 const span=depth, bottomAt=x=>rearBottom*(x/span);
 const topAt=x=>frontHeight+(rearHeight-frontHeight)*(x/span);
 const shape=useMemo(()=>{
  const p=new THREE.Shape();p.moveTo(cutBack,bottomAt(cutBack));p.lineTo(depth,rearBottom);
  p.lineTo(depth,rearHeight);p.lineTo(cutBack,topAt(cutBack));p.closePath();
  const g=new THREE.ShapeGeometry(p);
  const pos=g.getAttribute('position'),uv=g.getAttribute('uv');
  for(let k=0;k<pos.count;k++)uv.setXY(k,pos.getX(k)/depth,pos.getY(k)/height);
  return g;
 },[depth,rearBottom,rearHeight,frontHeight,height,cutBack,batten]);
 const reveal=({lap:6,'vinyl-straight':5,'vinyl-dutch':4.5}[sidingType]||6)/12;
 const profiles=useMemo(()=>{
  if(panel||batten)return [];
  const wood=sidingType==='lap';
  // Use the same 6-inch LP lap shape and gradual face shading as the
  // established main shed siding. The older cheek used wider, flat bands.
  const steps=wood?[[0,.093,.74],[.055,.090,.82],[.18,.085,.91],[.55,.064,.99],[1,.041,1]]:
   sidingType==='vinyl-dutch'
   ?[[0,.065,1],[.3,.059,1],[.722222,.048,1],[.82,.030,.93],[.94,.024,.79],[1,.026,.86]]
   :[[0,.070,1],[.3,.060,1],[.65,.044,.99],[.9,.030,.89],[1,.028,.86]];
  const outline=[[cutBack,bottomAt(cutBack)],[depth,rearBottom],[depth,rearHeight],[cutBack,topAt(cutBack)]];
  const clip=(poly,y,above)=>{
   const out=[];
   for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length];
    const ia=above?a[1]>=y-1e-8:a[1]<=y+1e-8;
    const ib=above?b[1]>=y-1e-8:b[1]<=y+1e-8;
    if(ia)out.push(a);
    if(ia!==ib&&Math.abs(b[1]-a[1])>1e-9){
     const t=(y-a[1])/(b[1]-a[1]);
     out.push([a[0]+t*(b[0]-a[0]),y]);
    }
   }
   return out;
  };
  const pieces=[];
  for(let base=0;base<height;base+=reveal){
   // LP lap is a single continuous, solid course (like the main walls),
   // rather than independent face strips with visible seams/flat shading.
   if(wood){
    // Match the main-wall lap board: a six-inch closed solid wedge with
    // 7/16-inch thickness, natural lighting and no painted shadow bands.
    const thickness=7/16/12,vertices=[],uvs=[],indices=[];
    const lo=base,hi=base+reveal;
    const polygon=clip(clip(outline,lo,true),hi,false);
    if(polygon.length>=3){
     const depthAt=y=>.085+(.041-.085)*((y-lo)/reveal)+.008;
     for(const [x,y] of polygon){
      vertices.push(x,y,depthAt(y));
      uvs.push(x/depth,y*2);
     }
     const count=polygon.length;
     for(const [x,y] of polygon){
      vertices.push(x,y,depthAt(y)-thickness);
      uvs.push(x/depth,y*2);
     }
     for(let k=1;k<count-1;k++){
      indices.push(0,k,k+1);
      indices.push(count,count+k+1,count+k);
     }
     for(let k=0;k<count;k++){
      const next=(k+1)%count;
      indices.push(k,next,count+next,k,count+next,count+k);
     }
     const g=new THREE.BufferGeometry();
     g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
     g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
     g.setIndex(indices);g.computeVertexNormals();
     pieces.push({g,tone:1,wood,index:Math.round(base/reveal)});
    }
    continue;
   }
   for(let j=0;j<steps.length-1;j++){
    const lo=base+steps[j][0]*reveal,hi=base+steps[j+1][0]*reveal;
    const poly=clip(clip(outline,lo,true),hi,false);
    if(poly.length<3)continue;
    const shp=new THREE.Shape();
    shp.moveTo(poly[0][0],poly[0][1]);
    for(let k=1;k<poly.length;k++)shp.lineTo(poly[k][0],poly[k][1]);
    shp.closePath();
    const g=new THREE.ShapeGeometry(shp);
    const pos=g.getAttribute('position'),uv=g.getAttribute('uv');
    const pa=steps[j],pb=steps[j+1];
    for(let k=0;k<pos.count;k++){
     const t=Math.max(0,Math.min(1,(pos.getY(k)-lo)/(hi-lo)));
     pos.setZ(k,pa[1]+t*(pb[1]-pa[1])+.008);
     uv.setXY(k,pos.getX(k)/depth,pos.getY(k)/height);
    }
    pos.needsUpdate=true;g.computeVertexNormals();
    pieces.push({g,tone:wood?1:(pa[2]+pb[2])/2,wood,index:Math.round(base/reveal)});
   }
  }
  return pieces;
 },[depth,frontHeight,rearHeight,rearBottom,height,reveal,sidingType,panel,batten,cutBack]);
 useEffect(()=>()=>{shape.dispose();profiles.forEach(p=>p.g.dispose())},[shape,profiles]);
 const strips=batten?Array.from({length:Math.ceil(depth/(16/12))+1},(_,i)=>i*16/12)
  // Reserve the 3.5-inch corner trim plus a 2-inch batten-free margin.
  .filter(x=>x>=(3.5+2+2.5/2)/12&&depth-x>=(3.5+2+2.5/2)/12):[];
 return <group>
  <mesh geometry={shape} position={[0,0,.008]} castShadow={false} receiveShadow={false}>
   {batten?<meshBasicMaterial color={paint} map={getSmoothPaintMap()} side={THREE.DoubleSide}/>:
    <meshStandardMaterial color={paint} map={panel?grain:getSmoothPaintMap()}
     bumpMap={panel?grain:null} bumpScale={panel?.016:0} roughness={.92} side={THREE.DoubleSide}/>}
  </mesh>
  {profiles.map(({g,tone,wood,index},i)=><mesh key={i} geometry={g} castShadow={false} receiveShadow={false}>
   <meshStandardMaterial color={new THREE.Color(paint).multiplyScalar(tone)} vertexColors={false}
    map={wood?getLapBoardTexture(index+930):getSmoothPaintMap()}
    bumpMap={wood?getLapBoardTexture(index+930):null}
    bumpScale={wood?.002:0} roughness={wood?.88:.91} side={THREE.DoubleSide}
    emissive={wood?'#000000':paint} emissiveIntensity={wood?0:.18}/>
  </mesh>)}
  {batten&&strips.map((x,i)=>{
   // The batten must be cut to BOTH sloped rooflines. A rectangular box
   // ends horizontally and can protrude through the main 7/12 shingles.
   const half=2.5/24,left=x-half,right=x+half;
   const bottomL=bottomAt(left),bottomR=bottomAt(right);
   const topL=topAt(left)-.04,topR=topAt(right)-.04;
   if(Math.min(topL-bottomL,topR-bottomR)<=.02)return null;
   // This small clip is a built-in React Three Fiber primitive; each shape
   // has sloping end cuts matching the substrate, not horizontal box ends.
   return <DormerSlopedBatten key={i} x={x} half={half}
    bottomAt={bottomAt} topAt={topAt} paint={paint}/>;
  })}
 </group>;
}
function DormerBox({w,l,wall,paint,trim,roofColor,sidingType,overhangInches}){
 // Dormer length tracks shed length for both supported 10- and 12-foot gables.
 const boxW=(w===10||w===12)?(l>=18?10:l>=14?8:6):6;
 const windowCount=boxW===6?2:3;
 const transomWidthIn=boxW===10?29:23;
 const overhang=overhangInches/12;
 const frontZ=w/2+overhang-10/12;
 // Both the 10ft prototype and future widths terminate at the main ridge.
 const rearZ=0,depth=frontZ-rearZ;
 const mainRidgeY=FLOOR+wall+w/2*7/12;
 const baseY=FLOOR+wall+(w/2-frontZ)*7/12+.055;
 const topRear=mainRidgeY+.065;
 const topFront=topRear-depth*2/12;
 const frontHeight=topFront-baseY;
 const centerZ=(frontZ+rearZ)/2;
 const color={charcoal:'#353638',gray:'#666661',driftwood:'#686057','desert-tan':'#817569'}[roofColor]||'#353638';
 const roofExtra=overhang;
 // The rear shingle edge finishes at the main ridge (no rear overhang).
 const roofAngle=Math.atan(1/6);
 const roofLength=(depth+roofExtra+.25/12)/Math.cos(roofAngle)-.08;
 const roofCenterZ=(frontZ+roofExtra+rearZ-.25/12)/2;
 const roofCenterY=topRear-(roofCenterZ-rearZ)/6-.04;
 const roofMap=useSurface('shingles',boxW+2*roofExtra,roofLength,0,roofColor);
 const sidingMap=useSurface('siding',boxW,frontHeight);
 const cheekMap=useSurface('siding',depth,topRear-baseY);
 const dormerTrimDepth=.75/12;
 const cornerWidth=3.5/12;
 // Board-and-batten trim must stand outside the raised battens on both faces.
 const cornerDepth=dormerTrimDepth;
 const frontMat=<meshStandardMaterial color={paint} map={sidingType==='lp-panel'?sidingMap:getSmoothPaintMap()} roughness={.92} side={THREE.DoubleSide}/>;
 const sideShape=useMemo(()=>{
  const shape=new THREE.Shape();
  // The bottom of the side cheek follows the 7/12 main roof;
  // the top follows the 2/12 dormer roof up to the ridge.
  shape.moveTo(0,mainRidgeY-baseY);shape.lineTo(depth,0);
  shape.lineTo(depth,frontHeight);shape.lineTo(0,topRear-baseY);shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);
  const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');
  for(let i=0;i<pos.count;i++)uv.setXY(i,pos.getX(i)/depth,pos.getY(i)/(topRear-baseY));
  return geo;
 },[]);
 // The right cheek needs its own outward-facing winding. Reusing the left
 // cheek mesh with DoubleSide made its material render as a back face.
 const rightSideShape=useMemo(()=>{
  const shape=new THREE.Shape();
  shape.moveTo(0,0);
  shape.lineTo(depth,mainRidgeY-baseY);
  shape.lineTo(depth,topRear-baseY);
  shape.lineTo(0,frontHeight);
  shape.closePath();
  const geo=new THREE.ShapeGeometry(shape);
  const pos=geo.getAttribute('position'),uv=geo.getAttribute('uv');
  for(let i=0;i<pos.count;i++)uv.setXY(i,1-pos.getX(i)/depth,pos.getY(i)/(topRear-baseY));
  return geo;
 },[depth,mainRidgeY,baseY,topRear,frontHeight]);
 useEffect(()=>()=>{sideShape.dispose();rightSideShape.dispose()},[sideShape,rightSideShape]);
 return <group>
  {/* Front panel and side cheeks sit in the existing roof, with no
      modification to the established main-roof materials or trim. */}
  <group position={[0,baseY,frontZ+(sidingType==='lp-panel'?.017:sidingType==='lap'?-.075:-.06)]}>
   <ExteriorSiding width={boxW} height={frontHeight} paint={paint} type={sidingType}/>
  </group>
  {[-1,1].map(side=><group key={side}>
   {/* Inset all dormer cheek finishes so the deepest lap and batten profile
       terminates beneath the 3.5in corner board rather than protruding past it. */}
   <group position={[side*(boxW/2-.085),baseY,frontZ]} rotation={[0,Math.PI/2,0]} scale={[1,1,side]}>
    <DormerCheekFinish depth={depth} frontHeight={frontHeight}
     rearHeight={topRear-baseY} rearBottom={mainRidgeY-baseY}
     paint={paint} sidingType={sidingType}/>
   </group>
   <Box at={[side*(boxW/2-cornerWidth/2),baseY+frontHeight/2,frontZ+.008+cornerDepth/2]}
    size={[cornerWidth,frontHeight,cornerDepth]} color={trim} woodgrain castShadow={false}/>
   <Box at={[side*(boxW/2+cornerDepth/2-.006),baseY+frontHeight/2,frontZ-cornerWidth/2+.012]}
    size={[cornerDepth,frontHeight,cornerWidth]} color={trim} woodgrain castShadow={false}/>

  </group>)}
  {(()=>{
   const paneW=transomWidthIn/12,paneH=10/12,divider=3.5/12,casing=3.5/12;
   const totalW=windowCount*paneW+(windowCount-1)*divider;
   const cy=baseY+frontHeight*.53-1/12,z=frontZ+.07;
   const trimThickness=.75/12,trimCenterZ=frontZ+.045;
   const centers=Array.from({length:windowCount},(_,i)=>(i-(windowCount-1)/2)*(paneW+divider));
   return <group>
    {centers.map((cx,i)=><group key={i}>
     <Box at={[cx,cy,z-.035]} size={[paneW,paneH,.055]} color={WINDOW_PANE_COLOR}/>
     <Box at={[cx,cy,z-.008]} size={[paneW-.07,paneH-.07,.017]} color={WINDOW_PANE_COLOR}/>
     {[-1,0,1].map(k=><Box key={k} at={[cx+k*paneW/4,cy,z+.025]} size={[.029,paneH,.024]} color={trim}/>)}
    </group>)}
    {Array.from({length:windowCount-1},(_,i)=><Box key={'divider'+i}
     at={[(i-(windowCount-2)/2)*(paneW+divider),cy,trimCenterZ]}
     size={[divider,paneH,trimThickness]} color={trim} woodgrain/>)}
    {[-1,1].map(side=><Box key={'side'+side} at={[side*(totalW/2+casing/2),cy,trimCenterZ]} size={[casing,paneH+2*casing,trimThickness]} color={trim} woodgrain/>)}
    {[-1,1].map(side=><Box key={'horizontal'+side} at={[0,cy+side*(paneH/2+casing/2),trimCenterZ]} size={[totalW+2*casing+1/12,casing,trimThickness]} color={trim} woodgrain/>)}
   </group>;
  })()}
  {/* 2/12 low roof with matching field shingles and white fascia. */}
  <group position={[0,roofCenterY+.015,roofCenterZ]} rotation={[Math.atan(1/6),0,0]}>
   <Box at={[0,-.04,0]} size={[boxW+2*roofExtra,.08,roofLength]} color={trim}/>
   <mesh position={[0,.02,0]} castShadow receiveShadow>
    <boxGeometry args={[boxW+2*roofExtra+1.5/12,.035,roofLength+1.5/12]}/>
    <meshStandardMaterial color={color} map={roofMap} bumpMap={roofMap} bumpScale={.02} roughness={.98}/>
   </mesh>
   {[-1,1].map(d=><Box key={d} at={[d*(boxW/2+roofExtra),-.045,0]} size={[.07,1.75/12,roofLength]} color={trim}/>)}
   {[-1,1].map(d=><Box key={d} at={[0,-.045,d*roofLength/2]} size={[boxW+2*roofExtra,1.75/12,.07]} color={trim}/>)}
  </group>
 </group>;
}
// Molded TuffBlock pedestal photographed in Cape Fear Shed's shop:
// broad four-lobed foot, reinforced radial ribs, and raised 4x4 cradle.
// Lean-to roof: 10 degrees measured above horizontal, rising from the
// low (-Z) sidewall toward the high (+Z) sidewall. Shingle caps follow the
// high edge rather than a central gable ridge.
function LeanRoof({w,l,wall,roofColor,trim,overhangInches=4,softShadows=false}){
 const angle=10*Math.PI/180,overhang=overhangInches/12;
 const slope=(w+2*overhang)/Math.cos(angle);
 const roofLength=l+2*overhang;
 const lowY=FLOOR+wall-overhang*Math.tan(angle);
 const highY=lowY+slope*Math.sin(angle);
 const map=useSurface('shingles',roofLength+2*.75/12,slope+.75/12,0,roofColor);
 const color={charcoal:'#353638',gray:'#666661',driftwood:'#686057','desert-tan':'#817569'}[roofColor]||'#353638';
 return <group>
  <group position={[0,(highY+lowY)/2,0]} rotation={[-angle,0,0]}>
   <Box at={[0,-.045,0]} size={[roofLength,.09,slope]} color={trim} castShadow={!softShadows}/>
   <mesh position={[0,.0175,0]} castShadow={!softShadows} receiveShadow>
    <boxGeometry args={[roofLength+1.5/12,.035,slope+1.5/12]}/>
    <meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} roughness={.98}/>
   </mesh>
   {[-1,1].map(end=><Box key={end} at={[end*(roofLength/2-.028),-.042,0]}
    size={[.075,1.75/12,slope+.05]} color={trim} castShadow={!softShadows}/>)}
   {[-1,1].map(side=><group key={side}>
    <Box at={[0,-.042,side*slope/2]} size={[roofLength,1.75/12,.075]}
     color={trim} castShadow={!softShadows}/>
    {side===-1&&<EaveDripEdge length={roofLength} edgeZ={side*slope/2} side={side} softShadows={softShadows}/>} 
   </group>)}
  </group>
  {/* High-edge ridge cap is 5in along the edge by 9in down the slope. */}
  {Array.from({length:Math.ceil(roofLength/(5/12))},(_,i)=>{
   const capLength=Math.min(5/12,roofLength-i*5/12);
   const x=-roofLength/2+i*5/12+capLength/2;
   const seed=Math.sin((i+1)*78.233)*43758.5453;
   const v=seed-Math.floor(seed);
   const shade=(80+Math.floor(v*140))/145;
   const capColor=new THREE.Color(color).multiplyScalar(shade);
   return <group key={i}>
    <mesh rotation={[-angle,0,0]}
     position={[x,highY+.055-(9/12)*Math.sin(angle)/2,w/2+overhang-(9/12)*Math.cos(angle)/2]}
     castShadow={!softShadows}>
     <boxGeometry args={[capLength,.024,9/12]}/>
     <meshStandardMaterial color={capColor} map={map} bumpMap={map} bumpScale={.013} roughness={.99}/>
    </mesh>
    {/* 9-inch cap stays black on the roof; high-side exposed metal fascia is white. */}
    <Box at={[x,highY-.065,w/2+overhang+.045]} size={[capLength,.17,.048]}
     color={trim} castShadow={!softShadows}/>
    {/* Transverse seam across the full 9in face at every 5in cap joint. */}
    <mesh rotation={[-angle,0,0]}
     position={[x+capLength/2-.012,highY+.073-(9/12)*Math.sin(angle)/2,w/2+overhang-(9/12)*Math.cos(angle)/2]}>
     <boxGeometry args={[.025,.006,9/12]}/>
     <meshStandardMaterial color="#17191b" roughness={.98}/>
    </mesh>
   </group>;
  })}
 </group>;
}
// The trapezoidal end fill above a lean-to's low roof bearing. This is
// panelled wall, not a gable: one continuous diagonal top from low to high.
// One continuous clipped lean-to end wall. No rectangular-wall/top-fill
// seam; courses, grooves and battens are all clipped to the same roof slope.
// Lean-to end walls are single clipped surfaces. Each horizontal course
// uses the same physical reveal and front-face depth as the corresponding
// straight sidewall; no faux painted stripes on a flat wall.
function LeanEndWall({w,height,rise,paint,sidingType,lowOnRight=false,ventZone=null}){
 const surface=useSurface('siding',w,height+rise);
 const smooth=sidingType==='board-batten';
 const profile=sidingType==='lp-panel';
 const reveal=({lap:6,'vinyl-dutch':4.5,'vinyl-straight':5}[sidingType]||6)/12;
 const geo=useMemo(()=>{
  const lowLeft=!lowOnRight;
  const topAt=x=>height+(lowLeft?(x+w/2):(w/2-x))*rise/w;
  const shape=new THREE.Shape();
  shape.moveTo(-w/2,-.025);shape.lineTo(w/2,-.025);
  shape.lineTo(w/2,topAt(w/2));shape.lineTo(-w/2,topAt(-w/2));shape.closePath();
  const backing=new THREE.ShapeGeometry(shape);
  const uv=backing.getAttribute('uv'),pos=backing.getAttribute('position');
  for(let j=0;j<pos.count;j++)uv.setXY(j,(pos.getX(j)+w/2)/w,pos.getY(j)/(height+rise));
  // A course is trimmed at the sloping roof line at both endpoints.
  const courses=[];
  if(!profile&&!smooth)for(let base=0;base<height+rise;base+=reveal){
   const top=Math.min(base+reveal,height+rise);
   const bound=y=>{
    const f=Math.max(0,Math.min(1,(y-height)/rise));
    return lowLeft?[-w/2+w*f,w/2]:[-w/2,w/2-w*f];
   };
   const [bl,br]=bound(base),[tl,tr]=bound(top);
   if(br-bl<.00001)continue;
   const wood=sidingType==='lap';
   // Identical depth curves to the approved straight-wall siding.
   // Each clipped end-wall course uses the same exposed reveal as a sidewall.
   // Keep the lip in front of the backing and use an actual broad
   // shaded shoulder, not a fine line suspended in front of the siding.
   const section=wood
    ? [[0,.093,.74],[.055,.090,.82],[.18,.085,.91],[.55,.064,.99],[1,.041,1]]
    : sidingType==='vinyl-straight'
      ? [[0,.087,.72],[.065,.084,.80],[.18,.080,.93],[.45,.068,.99],[.75,.057,1],[1,.045,1]]
      : [[0,.083,.75],[.045,.083,.84],[.12,.081,.95],[.35,.079,1],[.722222,.077,1],[.77,.066,.98],[.83,.055,.92],[.89,.048,.87],[.94,.046,.83],[1,.049,.87]];
   const interpolate=(t,field)=>{
    for(let j=1;j<section.length;j++)if(t<=section[j][0]){
     const a=section[j-1],b=section[j],r=(t-a[0])/(b[0]-a[0]);
     return a[field]+(b[field]-a[field])*r;
    }
    return section[section.length-1][field];
   };
   const pts=[];
   for(const [fraction] of section){
    const y=base+fraction*reveal;
    if(y>=base-.000001&&y<=top+.000001){
     const [left,right]=bound(y);
     pts.push([y,left,right]);
    }
   }
   if(pts.length===0||pts[0][0]>base+.000001)pts.unshift([base,bl,br]);
   if(pts[pts.length-1][0]<top-.000001)pts.push([top,tl,tr]);
   const vertices=[],uvs=[],colors=[],indices=[];
   const shade=t=>wood?1:sidingType==='vinyl-dutch'?(t<=.722222?1:t<=.94?1-.21*(t-.722222)/(.94-.722222):.79+.07*(t-.94)/.06):(t<=.5?1:t<=.75?1-.03*(t-.5)/.25:.97-.11*(t-.75)/.25);
   for(const [y,l,r] of pts){
    const t=(y-base)/reveal,z=interpolate(t,1),c=interpolate(t,2);
    vertices.push(l,y,z,r,y,z);uvs.push(0,t,1,t);colors.push(c,c,c,c,c,c);
   }
   for(let j=0;j<pts.length-1;j++){const k=j*2;indices.push(k,k+1,k+3,k,k+3,k+2);}
   const g=new THREE.BufferGeometry();
   g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
   g.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
   g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
   g.setIndex(indices);g.computeVertexNormals();
   courses.push({geo:g,id:Math.round(base/reveal)});
  }
  return {backing,courses};
 },[w,height,rise,lowOnRight,sidingType,reveal,profile,smooth]);
 useEffect(()=>()=>{geo.backing.dispose();geo.courses.forEach(c=>c.geo.dispose())},[geo]);
 const topAt=x=>height+(lowOnRight?(w/2-x):(x+w/2))*rise/w;
 return <group>
  <mesh geometry={geo.backing} position={[0,0,.002]} castShadow={false} receiveShadow={false}>
   {smooth?<meshBasicMaterial color={paint} map={getSmoothPaintMap()} side={THREE.DoubleSide}/>:<meshStandardMaterial color={paint} map={profile?surface:null}
    bumpMap={profile?surface:null} bumpScale={profile?.016:0} roughness={.92}
    side={THREE.DoubleSide}/>} 
  </mesh>
  {geo.courses.map(({geo:g,id})=><mesh key={id} geometry={g} castShadow={false} receiveShadow={false}>
   <meshStandardMaterial color={paint} vertexColors
    map={sidingType==='lap'?getLapBoardTexture(id+930):getSmoothPaintMap()}
    bumpMap={sidingType==='lap'?getLapBoardTexture(id+930):null}
    bumpScale={sidingType==='lap'?.002:0}
    side={THREE.DoubleSide} roughness={.9}/>
  </mesh>)}
  {/* Course relief and shading are built into each profile mesh. */}
  {smooth&&Array.from({length:Math.ceil(w/(16/12))+1},(_,i)=>{
   const x=(i-Math.ceil(w/(16/12))/2)*(16/12);
   if(Math.abs(x)>w/2-.01)return null;
   const h=topAt(x);
   const blocks=ventZone&&Math.abs(x-ventZone.x)<(8+1.25)/12
    ? [[0,Math.min(h,ventZone.bottom)],[Math.max(0,ventZone.top),h]]
    : [[0,h]];
   return <group key={i}>{blocks.map(([bottom,top],j)=>{
    if(top<=bottom)return null;
    const bh=top-bottom,cy=(bottom+top)/2;
    const battenWidth=2.5/12,battenDepth=.75/12,edgeWidth=.38/12;
    const frontZ=battenDepth+.007;
    const edgeShade=new THREE.Color(paint).multiplyScalar(.55);
    return <group key={j}>
     {/* Exact approved sidewall batten: 2.5in x .75in, same six face
         materials and crisp front-edge accents. No extra darkening. */}
     <mesh position={[x,cy,battenDepth/2+.007]} castShadow={false} receiveShadow={false}>
      <boxGeometry args={[battenWidth,bh,battenDepth]}/>
      {[.60,.60,.86,.86,1,.82].map((tone,face)=><meshBasicMaterial
       key={face} attach={`material-${face}`}
       color={new THREE.Color(paint).multiplyScalar(tone)}
       map={getSmoothPaintMap()} 
       />)}
     </mesh>
     {[-1,1].map(side=><mesh key={side}
      position={[x+side*(battenWidth/2-edgeWidth/2),cy,frontZ+.004]}>
      <boxGeometry args={[edgeWidth,bh,.006]}/>
      <meshBasicMaterial color={edgeShade}/>
     </mesh>)}
    </group>;
   })}</group>;
  })}
 </group>;
}
function TuffBlock(){
 const base=useMemo(()=>{
  const shape=new THREE.Shape();
  const outline=[[-.23,-.48],[.23,-.48],[.31,-.34],[.46,-.23],[.48,.23],[.31,.34],[.23,.48],[-.23,.48],[-.31,.34],[-.48,.23],[-.48,-.23],[-.31,-.34]];
  shape.moveTo(...outline[0]);outline.slice(1).forEach(p=>shape.lineTo(...p));shape.closePath();
  return new THREE.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:true,bevelSize:.013,bevelThickness:.011,bevelSegments:1});
 },[]);
 useEffect(()=>()=>base.dispose(),[base]);
 const black='#151b21',rim='#202832',rib='#28303a';
 return <group>
  <mesh geometry={base} position={[0,-.315,0]} rotation={[-Math.PI/2,0,0]} castShadow receiveShadow>
   <meshStandardMaterial color={black} roughness={.8}/>
  </mesh>
  {/* Four side pads flare out around the post, with narrow molded ribs. */}
  {Array.from({length:4},(_,i)=><group key={i} rotation={[0,i*Math.PI/2,0]}>
   <Box at={[0,-.266,.33]} size={[.47,.05,.25]} color={rim} roughness={.8}/>
   {[-.16,0,.16].map(k=><Box key={k} at={[k,-.23,.36]}
    size={[.028,.075,.25]} color={rib} roughness={.8}/>)}
  </group>)}
  <mesh position={[0,-.205,0]} castShadow receiveShadow>
   <cylinderGeometry args={[.245,.315,.19,8]}/>
   <meshStandardMaterial color={black} roughness={.83}/>
  </mesh>
  {/* Four upright corner stops surrounding the 4x4, with an open top. */}
  {[-1,1].flatMap(x=>[-1,1].map(z=><Box key={x+','+z}
   at={[x*.16,-.13,z*.16]} size={[.085,.19,.085]} color={rim} roughness={.85}/>))}
 </group>;
}
function ConcreteSlab({w,l}){
 const map=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#b4b1aa';ctx.fillRect(0,0,512,512);
  let seed=34271;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  // Larger translucent mottled patches show concrete variation even on small screens.
  for(let i=0;i<950;i++){
   const x=random()*512,y=random()*512,r=2+random()*19;
   const v=random()>.5?72:245;
   ctx.fillStyle='rgba('+v+','+v+','+v+','+(.015+random()*.07)+')';
   ctx.beginPath();ctx.ellipse(x,y,r,r*(.3+random()*.8),random()*Math.PI,0,Math.PI*2);ctx.fill();
  }
  // Fine aggregate plus occasional larger exposed specks.
  for(let i=0;i<28000;i++){
   const v=random()>.5?65:240;
   ctx.fillStyle='rgba('+v+','+v+','+v+','+(.04+random()*.20)+')';
   const x=random()*512,y=random()*512,r=.4+random()*2.7;
   ctx.fillRect(x,y,r,r);
  }
  for(let i=0;i<480;i++){
   const x=random()*512,y=random()*512;
   ctx.strokeStyle='rgba(78,77,74,'+(.035+random()*.075)+')';
   ctx.lineWidth=.4+random()*.9;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+random()*40,y+(random()-.5)*8);ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);
  texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.colorSpace=THREE.SRGBColorSpace;
  texture.repeat.set(Math.max(1,l/5),Math.max(1,w/5));
  texture.anisotropy=8;
  texture.needsUpdate=true;
  return texture;
 },[w,l]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <mesh position={[0,FLOOR-5/24,0]} receiveShadow>
  <boxGeometry args={[l,5/12,w]}/>
  <meshStandardMaterial map={map} bumpMap={map} bumpScale={.023} color="#ffffff" roughness={.98}/>
 </mesh>;
}
function Foundation({w,l,concreteSlab=false}){
 if(concreteSlab)return <ConcreteSlab w={w} l={l}/>;
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
      <TuffBlock/>
      <Box at={[0,.025,0]} size={[.30,.40,.30]} color="#9e8058"/>
     </group>))}
    {w===12&&<Box at={[0,.06,0]} size={[l-.09,.32,.30]} color="#9e8058"/>}
   </>}
 </group>
}
// A corner board with a true pitched top edge; unlike a Box, it follows
// the underside of the gable rake across the full 3.5-inch trim face.
function RakeCutCorner({x,z,side,wall,w,pitch,trim,bottom}){
 const halfWidth=(3.5/12)/2, thickness=.75/12;
 const centerZ=z*(w/2-.07);
 const outerX=x*(side.l/2+.095-(.11-thickness)/2);
 const roofBottom=FLOOR+wall;
 const zA=centerZ-halfWidth,zB=centerZ+halfWidth;
 const topAt=zz=>roofBottom-(Math.abs(zz)-w/2)*(pitch/12)-.045;
 const a=topAt(zA),b=topAt(zB),low=bottom;
 const verts=new Float32Array([
  -thickness/2,low,zA, thickness/2,low,zA,
  -thickness/2,low,zB, thickness/2,low,zB,
  -thickness/2,a,zA, thickness/2,a,zA,
  -thickness/2,b,zB, thickness/2,b,zB
 ]);
 const indices=[0,2,6,0,6,4,1,5,7,1,7,3,0,4,5,0,5,1,2,3,7,2,7,6,4,6,7,4,7,5,0,1,3,0,3,2];
 const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(verts,3));g.setIndex(indices);g.setAttribute('uv',new THREE.Float32BufferAttribute([0,0,1,0,0,0,1,0,0,1,1,1,0,1,1,1],2));g.computeVertexNormals();return g},[a,b,low,zA,zB]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 return <mesh position={[outerX,0,0]} geometry={geometry} castShadow receiveShadow><meshStandardMaterial color={trim} roughness={.8} bumpMap={getTrimGrain()} bumpScale={.016} side={THREE.DoubleSide}/></mesh>;
}
export default function Shed({w,l,pitch,wallHeight,paint,trim,roofColor,sidingType='lp-panel',roofStyle='gable',dormer=false,concreteSlab=false,openings,selected,setSelected}){
 // The selected sidewall measurement is the STUD cut length, not the overall wall.
 // Single 1.5in bottom plate + double 3in top plate add 4.5in to roof bearing height.
 // LP wall panels extend 1.5in below the bottom plate, with tops at the upper plate.
 const studLength=({6.5:73.5,7:78.5,8:87.5}[wallHeight]??73.5);
 // The customer-facing elevation uses the photo-matched roofline.
 // User's original 7ft preview (83in to eave) best matched their 6.5ft sheds.
 // Preserve actual stud/plate measurements separately; the 5in visual offset
 // is a provisional calibration until full installed-eave details are verified.
 const framedWall=(studLength+4.5)/12;
 const visualEaveAllowance=5/12;
 const wall=framedWall+visualEaveAllowance-(wallHeight===6.5?2/12:0);
 const sidingDrop=1.5/12;
 const rise=w/2*pitch/12;
 const alternative=sidingType!=='lp-panel';
 const overhangInches=alternative?6:4;
 const trimDepth=alternative?1:.75;
 const lean=roofStyle==='lean-to'&&w<=12;
 const leanRise=w*Math.tan(Math.PI/18);
 return <group>
  <Foundation w={w} l={l} concreteSlab={concreteSlab}/>
  {[-1,1].map(side=><group key={'wall'+side} position={[0,FLOOR,side*w/2]} rotation={[0,side===1?0:Math.PI,0]}>
   <ExteriorSiding width={l} height={wall+(lean&&side===1?leanRise:0)}
    paint={paint} type={sidingType} battenEaveInset={sidingType==='board-batten'?2/12:0}/>
  </group>)}
  {lean
   ? [-1,1].map(side=><group key={'end'+side} position={[side*l/2,FLOOR-sidingDrop,0]} rotation={[0,side*Math.PI/2,0]}>
     {(()=>{
      const lowRight=side===1;
      const inset=(3.5+4+8)/12;
      // Put the existing 4x16 vent at the tall corner.
      const ventX=lowRight?-w/2+inset:w/2-inset;
      const ventY=wall+sidingDrop+leanRise-Math.tan(Math.PI/18)*(inset+8/12)-(4+2)/12;
      return <>
       <group position={[0,sidingDrop,0]}><LeanEndWall w={w} height={wall} rise={leanRise} paint={paint}
        sidingType={sidingType} lowOnRight={lowRight}
        ventZone={{x:ventX,bottom:ventY-sidingDrop-2/12-.035,top:ventY-sidingDrop+2/12+.035}}/></group>
       <group position={[ventX,0,sidingType==='board-batten'?.12:.09]}>
        <Vent rise={leanRise} pitch={pitch} centerOverride={ventY}/>
       </group>
      </>;
     })()}
    </group>)
   : <>
  {[-1,1].map(s=><group key={'gable'+s} position={[s*l/2,FLOOR-sidingDrop,0]} rotation={[0,s*Math.PI/2,0]}>
   {alternative
    ? <group position={[0,sidingDrop,0]}><ExteriorSiding width={w} height={wall+rise} gableStart={wall} paint={paint} type={sidingType} battenEaveInset={sidingType==='board-batten'?2/12:0} ventCutout={sidingType==='board-batten'?{halfWidth:8/12+.025,bottom:wall+rise-(8*pitch/12+5+2)/12-.025,top:wall+rise-(8*pitch/12+5-2)/12+.025}:null}/></group>
     : <><group position={[0,sidingDrop,0]}><ExteriorSiding width={w} height={wall} paint={paint} type={sidingType}/></group>
       <group position={[0,wall+sidingDrop,0]}><ExteriorSiding width={w} height={rise} paint={paint} type={sidingType} courseOrigin={wall+sidingDrop} gable/></group></>}
   <group position={[0,wall+sidingDrop,sidingType==='board-batten'?.012:sidingType==='lap'||sidingType==='vinyl-straight'||sidingType==='vinyl-dutch'?.12:.005]}><Vent rise={rise} pitch={pitch}/></group>
  </group>)}
   </>}
  {lean ? [-1,1].flatMap(x=>[-1,1].map(z=><group key={x+','+z}>
    <Box at={[x*(l/2+.095),(2*(FLOOR-sidingDrop)+wall+sidingDrop+(z===1?leanRise:0)-.096)/2,z*(w/2-.07)]}
      size={[.11,wall+sidingDrop+(z===1?leanRise:0)-.096,.27]} color={trim} woodgrain/>
    <Box at={[x*(l/2-.07),(2*(FLOOR-sidingDrop)+wall+sidingDrop+(z===1?leanRise:0)-.096)/2,z*(w/2+.095)]}
      size={[.27,wall+sidingDrop+(z===1?leanRise:0)-.096,.11]} color={trim} woodgrain/>
   </group>)) : <>
  {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x},${z}`}>
   <RakeCutCorner x={x} z={z} side={{l}} wall={wall} w={w} pitch={pitch} trim={trim} bottom={FLOOR-sidingDrop}/>
   {/* Adjacent side-wall trim stops under the eave while gable-facing trim follows the rake. */}
   {/* Side-wall corner board ends just below the actual eave underside,
       independently of the 6-inch overhang's horizontal extension. */}
   <Box at={[x*(l/2+.095-(3.5/12)/2),(FLOOR-sidingDrop+FLOOR+wall-.096)/2,z*(w/2+.095)]}
    size={[3.5/12,wall+sidingDrop-.096,.75/12]} color={trim} woodgrain/>
  </group>))}
  </>}
  {lean?<LeanRoof w={w} l={l} wall={wall} roofColor={roofColor} trim={trim} overhangInches={overhangInches} softShadows={alternative}/>:<Roof w={w} l={l} pitch={pitch} wall={wall} roofColor={roofColor} trim={trim} overhangInches={overhangInches} softShadows={alternative}/>}
  {dormer&&!lean&&(w===10||w===12)&&<DormerBox w={w} l={l} wall={wall} paint={paint} trim={trim} roofColor={roofColor} sidingType={sidingType} overhangInches={overhangInches}/>}
  {openings.map(o=><Opening key={o.id} o={o} w={w} l={l} paint={paint} trim={trim} selected={selected===o.id} onSelect={setSelected} trimDepth={trimDepth} sidingType={sidingType}/>)}
 </group>
}
