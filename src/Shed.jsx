import React, {useMemo, useEffect} from 'react';
import {constructionSpecs} from './constructionSpecs.js';
import * as THREE from 'three';
import {FLOOR_HEIGHT as FLOOR, roofDimensions} from './shedGeometry.js';

// Seeded, local textures: no image downloads or per-frame texture work.
function surfaceTexture(kind) {
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
  ctx.fillStyle='#dddddd';ctx.fillRect(0,0,canvas.width,canvas.height);
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
   ctx.fillStyle='#b0b0b0';ctx.fillRect(x,0,groove,canvas.height);
   ctx.fillStyle='rgba(85,85,85,.17)';ctx.fillRect(x,0,Math.max(1,groove*.22),canvas.height);
   ctx.fillStyle='rgba(245,245,245,.72)';ctx.fillRect(x+groove-1.6,0,1.6,canvas.height);
  }
 }else{
  // Cape Fear Shed architectural shingles: exposed trapezoidal laminate tabs
  // 4-6in wide, 5.5in tall. Texture occupies 96in x 40in.
  const pxPerIn=512/96;
  const tabHeight=5.5*512/40;
  const course=3.75*512/40; // 3.75in exposure: 1.75in overlap hides tapered upper corners
  ctx.fillStyle='#aaaaaa';ctx.fillRect(0,0,512,512);
  // Paint lower courses first so the next higher course visually laps over them.
  for(let row=0;row<16;row++){ 
   const bottom=512-row*course;
   const topY=bottom-tabHeight;
   const base=132+Math.floor(random()*34);
   ctx.fillStyle=`rgb(${base},${base},${base})`;
   ctx.fillRect(0,topY,512,tabHeight+1);
   let x=-(4+random()*6)*pxPerIn;
   while(x<512){
    const width=(4+random()*2)*pxPerIn;
    const insetLeft=width*(.04+random()*.08);
    const insetRight=width*(.04+random()*.08);
    const shade=100+Math.floor(random()*96);
    // Underlay shadow followed by a solid trapezoid, with a crisp
    // projecting lower lip that casts onto the course below.
    ctx.beginPath();
    ctx.moveTo(x+insetLeft,topY);
    ctx.lineTo(x+width-insetRight,topY);
    ctx.lineTo(x+width,bottom);
    ctx.lineTo(x,bottom);
    ctx.closePath();
    ctx.shadowColor='rgba(20,20,20,.62)';
    ctx.shadowBlur=4;
    ctx.shadowOffsetY=3;
    ctx.fillStyle=`rgb(${shade},${shade},${shade})`;
    ctx.fill();
    ctx.shadowColor='transparent';ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    // Individual tab highlights / mineral color variegation.
    ctx.fillStyle=`rgba(245,245,245,${.035+random()*.11})`;
    ctx.fillRect(x+width*.15,topY+6,width*.35,tabHeight*.55);
    ctx.strokeStyle='rgba(55,55,55,.18)';
    ctx.lineWidth=.65;ctx.stroke();
    x+=width;
   }
   // Thin continuous course reveal darkens the actual exposed lower edge.
   ctx.fillStyle='rgba(34,34,34,.20)';
   ctx.fillRect(0,bottom-1.5,512,1.5);
  }
  // Dense, subtle aggregate/granule sparkle throughout all courses.
  for(let i=0;i<65000;i++){
   const v=random()>.53?241:45;
   ctx.fillStyle=`rgba(${v},${v},${v},${.08+random()*.23})`;
   ctx.fillRect(random()*512,random()*512,.6+random()*1.4,.6+random()*1.3);
  }
 }
 const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
 texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;return texture;
}
function useSurface(kind,width,height,originX=0){
 const map=useMemo(()=>{
  const t=surfaceTexture(kind);
  const repeatWidth=kind==='siding'?(32*constructionSpecs.siding.lpPanel.grooveSpacingIn/12):8; // Forty distinct 8in LP sections
  t.repeat.set(width/repeatWidth,height/(kind==='siding'?8:10/3));
  // Offset door panels by their real position on the wall so their groove
  // centers and cedar grain scale match the adjoining LP SmartSide siding.
  if(kind==='siding'){
   t.offset.x=originX/repeatWidth;
   t.wrapT=THREE.ClampToEdgeWrapping; // no mid-wall repeat seam on 6.5ft / 7ft / 8ft siding
  }
  return t;
 },[kind,width,height,originX]);
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
function Box({at,size,color,rotation,metalness=0,roughness=.8,woodgrain=false,...props}){
 return <mesh position={at} rotation={rotation} castShadow receiveShadow {...props}><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={roughness} metalness={metalness} bumpMap={woodgrain?getTrimGrain():null} bumpScale={woodgrain?.016:0}/></mesh>
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
// Cape Fear Shed standard aluminum gable vent: 16in wide x 4in tall,
// thin white stamped face with three banks of five horizontal louvers.
// The visible plate/raised louvers have less than 1/8in total projection.
function Vent({rise,pitch}){
 const width=16/12,height=4/12;
 const plateDepth=.0045, slotDepth=.0007;
 const white='#eef0ec', shadow='#3e4544';
 const bankWidth=3.85/12,bankSpacing=5.05/12;
 // Top vent corners are 3in vertically below the sloped gable roofline.
 // At each 8in half-width: roof falls (8in * pitch/12) from the peak.
 const halfWidthIn=8, topClearanceIn=3;
 const centerAboveWall=rise-(halfWidthIn*pitch/12+topClearanceIn+2)/12;
 return <group position={[0,centerAboveWall,.075]}>
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
function Opening({o,w,l,selected,onSelect,paint,trim}){
 const long=o.wall==='front'||o.wall==='back',span=long?l:w,a=o.x/12-span/2;
 const isDoor=o.kind==='door';
 const isDouble=isDoor&&o.type==='double';
 const transom=isDoor&&Boolean(o.transom);
 const doorH=73.5/12;
 const transomH=transom?10.25/12:0;
 const assemblyHeight=isDoor?73.5+7/16:o.height;
 const pos=long?[a,FLOOR+o.y/12+assemblyHeight/24,(o.wall==='front'?1:-1)*(w/2+.045)]:[(o.wall==='right'?1:-1)*(l/2+.045),FLOOR+o.y/12+assemblyHeight/24,a];
 const rotation=[0,long?(o.wall==='front'?0:Math.PI):(o.wall==='right'?Math.PI/2:-Math.PI/2),0];
 const doorGap=7/16/12;
 // Standard 4ft double door: two exact 24 x 73.5in leaves plus three 7/16in reveals.
 const wd=isDoor?(o.width/12+(isDouble?3:2)*doorGap):o.width/12;
 const ht=isDoor?doorH+doorGap:o.height/12;
 const frame=trim;
 const trimThickness=constructionSpecs.siding.lpPanel.trim.thicknessIn/12; // Actual 3/4-inch LP trim
 const trimWidth=constructionSpecs.siding.lpPanel.trim.widthIn/12; // Standard LP SmartSide trim: 3-1/2in face
 const doorReveal=constructionSpecs.doubleDoor4Ft.revealIn/12; // Measured 7/16in reveal at both sides, top, and meeting stile
 return <group position={pos} rotation={rotation} onClick={e=>{e.stopPropagation();onSelect(o.id)}}>
  <group position={[0,0,-.10]}>
   {/* Flat, nominal 1x4 exterior casing: restrained projection, square joints. */}
   <Box at={[0,0,.025]} size={[wd+.015,ht+.015,.045]} color={o.kind==='door'?paint:'#26342e'}/>
   {o.kind==='window'?<>
    {/* Exact LP SmartSide window trim cut list:
        side pieces 27 3/8in; top and sill 26 1/4in.
        Top and sill project 1/2in beyond the outer edge of each side piece. */}
    {[-1,1].map(side=><Box key={'wcasing'+side}
      at={[side*(26.25/2-.5-(o.shutters?9:3.5)/2)/12,0,.08625]}
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
      <group position={[centerX,bottomY,.066]}><Siding width={leafWidth} height={leafHeight} paint={paint} originX={o.x/12+centerX-leafWidth/2}/></group>
      {/* Photo-accurate door leaf stiles, top/bottom rails and central mid rail. */}
      <Box at={[outerX-(isDouble?side:1)*trimWidth/2,midY,.119]} size={[trimWidth,leafHeight,trimThickness]} color={trim} woodgrain/>
      <Box at={[isDouble?innerX+side*trimWidth/2:centerX-leafWidth/2+trimWidth/2,midY,.119]} size={[trimWidth,leafHeight,trimThickness]} color={trim} woodgrain/>
      {[topY-trimWidth/2,midY,bottomY+trimWidth/2].map((y,i)=><Box key={i} at={[centerX,y,.119]} size={[railLength,trimWidth,trimThickness]} color={trim} woodgrain/>)}
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
        <Box at={[centerX,windowCenterY,.078]} size={[windowWidth-.045,windowHeight-.045,.007]} color="#263a40"/>
        <Box at={[centerX,windowCenterY,.083]} size={[windowWidth-.065,windowHeight-.065,.005]} color="#829da2"/>
        {Array.from({length:lights-1},(_,i)=>{
         const offset=(i+1)*windowWidth/lights-windowWidth/2;
         return <Box key={i} at={[centerX+offset,windowCenterY,.09]} size={[.038,windowHeight-.03,.018]} color="#e8eae7"/>;
        })}
        {/* Extra rail immediately beneath transom: 17/23/29in as applicable. */}
        <Box at={[centerX,lowerRailY,.119]} size={[railLength,trimWidth,trimThickness]} color={trim} woodgrain/>
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
    <Box at={[0,0,.068]} size={[wd-1.5/12,ht-1.5/12,.008]} color="#263d40"/>
    <mesh position={[0,0,.073]}>
      <planeGeometry args={[wd-1.7/12,ht-1.7/12]}/>
      <meshPhysicalMaterial color="#779397" roughness={.16} metalness={.12} transparent opacity={.95} clearcoat={.8}/>
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
 </group>
}
// Thin folded aluminum drip edge. The 2-1/4in fastening flange is hidden
// beneath the shingles; only the subtle upper flare, 1-1/2in vertical face,
// and small bottom kick should be visible.
function EaveDripEdge({length,edgeZ,side=1}){
 const face=1.5/12, metal=.012/12;
 const upperY=.018; // kept below shingle surface (top of shingles is .035)
 const outerZ=edgeZ+side*.010;
 return <group>
  {/* Concealed 2-1/4in flange underneath the shingle layer. */}
  <Box at={[0,-.002,edgeZ-side*(2.25/12)/2]} size={[length,metal,2.25/12]} color="#bfc4c3" metalness={.7}/>
  {/* Tiny outward upper fold at roof perimeter. */}
  <Box at={[0,upperY-.008,outerZ+side*.009]} size={[length,metal,.035]} rotation={[side*.32,0,0]} color="#bfc4c3" metalness={.7}/>
  <Box at={[0,upperY-face/2,outerZ+side*.018]} size={[length,face,metal]} color="#bfc4c3" metalness={.7}/>
  {/* Restrained flared drip hem on the lower edge. */}
  <Box at={[0,upperY-face-.005,outerZ+side*.030]} size={[length,metal,.032]} rotation={[side*.34,0,0]} color="#bfc4c3" metalness={.7}/>
 </group>;
}
function Roof({w,l,pitch,wall,roofColor,trim}){
 const d=roofDimensions(w,l,pitch,wall);
 // Shingles extend 3/4in past the drip edge on the eaves and both rakes.
 // The decking and aluminum drip edge retain their approved dimensions.
 const shingleProjection=0.75/12;
 const map=useSurface('shingles',d.roofLength+2*shingleProjection,d.slope+shingleProjection);
 const color={charcoal:'#42464A',gray:'#93989a',driftwood:'#a29582'}[roofColor]||'#42464A';
 return <group>
  {[-1,1].map(s=><group key={s} position={[0,(d.ridgeY+d.eaveY)/2,s*d.run/2]} rotation={[s*d.angle,0,0]}>
   <Box at={[0,-.045,0]} size={[d.roofLength,.09,d.slope]} color={trim}/>
   <mesh position={[0,.0175,s*shingleProjection/2]} castShadow receiveShadow><boxGeometry args={[d.roofLength+2*shingleProjection,.035,d.slope+shingleProjection]}/><meshStandardMaterial color={color} map={map} bumpMap={map} bumpScale={.025} roughness={.98}/></mesh>
   {/* Architectural shingle laps and staggered laminate tabs are in the textured surface. */}
   {[-1,1].map(end=><Box key={end} at={[end*(d.roofLength/2-.028),-.042,0]} size={[.075,1.75/12,d.slope+.05]} color={trim}/>)}
   <Box at={[0,-.042,s*d.slope/2]} size={[d.roofLength,1.75/12,.075]} color={trim}/>
   <EaveDripEdge length={d.roofLength} edgeZ={s*d.slope/2} side={s}/>
  </group>)}
  {/* Ridge caps are opaque architectural asphalt, not painted metal.
      5in along ridge x 9in across, 4.5in down each slope.
      Same granular shingle albedo as the roof, with per-cap variation. */}
  {Array.from({length:Math.ceil(d.roofLength/(5/12))},(_,i)=>{
   const length=Math.min(5/12,d.roofLength-i*5/12);
   const variation=Math.sin((i+1)*78.233)*43758.5453;
   const v=variation-Math.floor(variation);
   // Match the light/dark spread of individual field-shingle tabs.
   // All caps share the same asphalt/granule map, but each complete
   // rectangular cap gets its own stable shade (not a uniform gray strip).
   const shade=80+Math.floor(v*140);
   const capColor=new THREE.Color(color).multiplyScalar(shade/145);
   return <group key={i} position={[-d.roofLength/2+i*5/12+length/2,d.ridgeY+.06,0]}>
    {[-1,1].map(side=><group key={side}>
     <mesh castShadow receiveShadow position={[0,-(4.5/12)*Math.sin(d.angle)/2,side*(4.5/12)*Math.cos(d.angle)/2]} rotation={[side*d.angle,0,0]}>
      <boxGeometry args={[length,.021,4.5/12]}/>
      <meshStandardMaterial color={capColor} map={map} bumpMap={map} bumpScale={.013} roughness={.99}/>
     </mesh>
     {/* Shadow seam along the 9-inch transverse edge of each cap.
         Each half is 4.5 inches, so together the seam spans the whole cap. */}
     <Box
       at={[length/2-.012,-(4.5/12)*Math.sin(d.angle)/2+.019,side*(4.5/12)*Math.cos(d.angle)/2]}
       rotation={[side*d.angle,0,0]}
       size={[.021,.006,4.5/12]}
       color="#1b1d20"/>

    </group>)}
   </group>;
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
   <group position={[0,wall,0]}><Siding width={w} height={rise} paint={paint} gable/><Vent rise={rise} pitch={pitch}/></group>
  </group>)}
  {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x},${z}`}>
   <Box at={[x*(l/2-.13),FLOOR+wall/2,z*(w/2+.04)]} size={[.27,wall,.09]} color={trim}/>
   <Box at={[x*(l/2+.04),FLOOR+wall/2,z*(w/2-.13)]} size={[.09,wall,.27]} color={trim}/>
  </group>))}
  <Roof w={w} l={l} pitch={pitch} wall={wall} roofColor={roofColor} trim={trim}/>
  {openings.map(o=><Opening key={o.id} o={o} w={w} l={l} paint={paint} trim={trim} selected={selected===o.id} onSelect={setSelected}/>)}
 </group>
}
