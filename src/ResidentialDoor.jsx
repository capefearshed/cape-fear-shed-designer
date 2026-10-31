import React from 'react';

function Piece({at,size,color='#F2F0EB',metal=false}){
 return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={metal?.35:.65} metalness={metal?.5:0}/></mesh>;
}
function Glass({x,y,width,height,grid=false,color}){
 const edge=.065;
 return <group position={[x,y,0]}>
  <Piece at={[0,0,.078]} size={[width,height,.025]} color="#333a3c" metal/>
  <mesh position={[0,0,.094]}><planeGeometry args={[width-.025,height-.025]}/><meshPhysicalMaterial color="#465052" roughness={.17} metalness={.15} clearcoat={.9}/></mesh>
  {[-1,1].map(side=><group key={side}>
   <Piece at={[side*(width/2+edge/2),0,.11]} size={[edge,height+edge*2,.04]} color={color}/>
   <Piece at={[0,side*(height/2+edge/2),.11]} size={[width,edge,.04]} color={color}/>
  </group>)}
  {grid&&[-1,1].map(side=><group key={side}>
   <Piece at={[side*width/6,0,.12]} size={[.035,height,.025]} color={color}/>
   <Piece at={[0,side*height/6,.12]} size={[width,.035,.025]} color={color}/>
  </group>)}
 </group>;
}
function EntryHardware({width,height}){
 // Standard bored entry set: 2-3/8in backset and 5-1/2in bore spacing.
 const color='#202324';
 return <group position={[-width/2+2.375/12,-height/2+36/12,.145]}>
  {[0,5.5/12].map((y,i)=><group key={i} position={[0,y,0]}>
   <mesh position={[0,0,.025]} rotation={[Math.PI/2,0,0]} castShadow receiveShadow>
    <cylinderGeometry args={[1.25/12,1.25/12,.05,32]}/>
    <meshStandardMaterial color={color} roughness={.38} metalness={.55}/>
   </mesh>
   {i===1?<>
    <mesh position={[0,0,.055]} rotation={[Math.PI/2,0,0]} castShadow>
     <cylinderGeometry args={[.45/12,.45/12,.025,24]}/>
     <meshStandardMaterial color="#35393a" roughness={.35} metalness={.6}/>
    </mesh>
    <Piece at={[0,0,.07]} size={[.012,.035,.006]} color="#0f1112"/>
   </>:<>
    <Piece at={[0,0,.085]} size={[.06,.06,.095]} color={color} metal/>
    <mesh position={[.12,-.012,.142]} rotation={[0,0,Math.PI/2-.07]} castShadow>
     <capsuleGeometry args={[.024,.24,6,12]}/>
     <meshStandardMaterial color={color} roughness={.38} metalness={.55}/>
    </mesh>
   </>}
  </group>)}
 </group>;
}
// Factory-style entry units: smooth molded leaves and discrete hardware,
// rather than the siding-faced leaves and strap hinges on shed doors.
export default function ResidentialDoor({type,width,height,color}){
 const single=type==='residential',sliding=type==='sliding',leaf=width/(single?1:2),gap=.025;
 return <group>
  {(single?[0]:[-1,1]).map(side=>{
   const x=side*width/4,leafWidth=leaf-gap;
   const glassH=single?height*.43:height-.95;
   const glassY=single?height*.145:.06;
   const glassW=leafWidth-(single?.85:.5);
   const stile=(leafWidth-glassW)/2,top=height/2-glassY-glassH/2,bottom=glassY-glassH/2+height/2;
   return <group key={side} position={[x,0,sliding&&side===1?.045:0]}>
    {/* Frame members surround the glass instead of a solid slab behind it. */}
    {[-1,1].map(sign=><Piece key={sign} at={[sign*(leafWidth/2-stile/2),0,.075]} size={[stile,height,.09]} color={color}/>)}
    <Piece at={[0,height/2-top/2,.075]} size={[leafWidth,top,.09]} color={color}/>
    <Piece at={[0,-height/2+bottom/2,.075]} size={[leafWidth,bottom,.09]} color={color}/>
    <Glass x={0} y={glassY} width={glassW} height={glassH} grid={single} color={color}/>
    {single&&[-1,1].map(sign=><group key={sign} position={[sign*leafWidth*.23,-height*.3,0]}>
     <Piece at={[0,0,.126]} size={[leafWidth*.33,height*.24,.025]} color="#c9c9c3"/>
     <Piece at={[0,0,.143]} size={[leafWidth*.33-.08,height*.24-.08,.025]} color={color}/>
    </group>)}
   </group>;
  })}
  {/* Central pull for French/sliding units; lever and deadbolt on the single. */}
  {single?<EntryHardware width={width} height={height}/>:<group position={[sliding?.17:-.16,-height/2+3,.19]}>
   <Piece at={[0,0,0]} size={[.12,sliding||!single?.46:.22,.045]} color="#202324" metal/>
   <Piece at={[single?.10:0,sliding||!single?-.02:-.03,.07]} size={[single?.26:.055,single?.055:.3,.06]} color="#202324" metal/>
   {!sliding&&<Piece at={[0,.36,0]} size={[.12,.14,.045]} color="#202324" metal/>}
  </group>}
  <Piece at={[0,-height/2+.025,.09]} size={[width,.05,.14]} color="#818687" metal/>
 </group>;
}
