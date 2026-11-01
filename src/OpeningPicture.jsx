import React from 'react';
export default function OpeningPicture({option:o}){
 const code=o.code,window=o.kind==='window',wood=!window&&!/rollup|residential|french|sliding/.test(code),double=/double|french|sliding/.test(code),transom=/transom/.test(code),rollup=/rollup/.test(code),residential=/residential/.test(code),sliding=/sliding/.test(code);
 const h=window?66:84,w=h*o.width/o.height,x=50-w/2,y=window?21:12,leaves=double?2:1,leaf=w/leaves,trim=3.5/o.width*w;
 const glass='#323837',white='#f4f3ed',panel='#c1b392';
 return <svg className="opening-picture" viewBox="0 0 100 110" aria-hidden="true" focusable="false">
  <rect x={x-trim} y={y-trim} width={w+trim*2} height={h+trim*1.4} fill={white} stroke="#c6c8be" strokeWidth=".7"/>
  {window?<><rect x={x} y={y} width={w} height={h} fill={glass}/><path d={`M50 ${y}v${h}${[1,2,3].map(n=>`M${x} ${y+h*n/4}h${w}`).join('')}`} stroke={white} strokeWidth="2.4"/></>:rollup?<><rect x={x} y={y} width={w} height={h} fill="#e4e7e3" stroke="#60675f" strokeWidth="1.8"/>{Array.from({length:22},(_,i)=><path key={i} d={`M${x+2} ${y+3+i*3.6}h${w-4}`} stroke="#8f9893" strokeWidth=".8"/>)}<path d={`M${x} ${y+h}h${w}`} stroke="#8e999c" strokeWidth="3"/><rect x="47" y={y+h-5} width="6" height="2" fill="#333"/></>:wood?Array.from({length:leaves},(_,i)=>{
   const lx=x+i*leaf,inner=leaf-trim*2,lights=double?(o.width===60?4:3):5,hinge=i===0?lx:lx+leaf,dir=i===0?1:-1;
   return <g key={i}><rect x={lx} y={y} width={leaf} height={h} fill={panel} stroke="#6e7165" strokeWidth=".6"/>{Array.from({length:Math.max(2,Math.floor(inner/5))},(_,j)=><path key={j} d={`M${lx+trim+2+j*5} ${y+trim}v${h-trim*2}`} stroke="#a59c87" strokeWidth=".5"/>)}
    <path d={`M${lx+trim/2} ${y}v${h}M${lx+leaf-trim/2} ${y}v${h}M${lx} ${y+trim/2}h${leaf}M${lx} ${y+h/2}h${leaf}M${lx} ${y+h-trim/2}h${leaf}`} stroke={white} strokeWidth={trim}/>
    {transom&&<><rect x={lx+trim} y={y+trim} width={inner} height={h*10.25/73.5} fill={glass}/>{Array.from({length:lights-1},(_,n)=><path key={n} d={`M${lx+trim+inner*(n+1)/lights} ${y+trim}v${h*10.25/73.5}`} stroke={white} strokeWidth="1"/>)}<path d={`M${lx+trim} ${y+trim+h*10.25/73.5}h${inner}`} stroke={white} strokeWidth={trim}/></>}
    {[y+2,y+h/2,y+h-2].map((hy,n)=><path key={n} d={`M${hinge} ${hy-1.8}l${dir*leaf*.23} 1.8l${-dir*leaf*.23} 1.8z`} fill="#181b18"/>)}<circle cx={double?(i===0?lx+leaf-1:lx+1):lx+leaf-2} cy={y+h/2+2} r="1.5" fill="#161b18"/>
   </g>;
  }):Array.from({length:leaves},(_,i)=>{
   const lx=x+i*leaf,gx=lx+leaf*(residential?.16:sliding?.09:.2),gw=leaf*(residential?.68:sliding?.82:.6),gy=y+h*.07,gh=h*(residential?.455:sliding?.88:.795);
   return <g key={i}><rect x={lx} y={y} width={leaf} height={h} fill={white} stroke="#7b827a" strokeWidth="1"/><rect x={gx} y={gy} width={gw} height={gh} fill={glass}/>{residential&&<><path d={`${[1,2].map(n=>`M${gx+gw*n/3} ${gy}v${gh}M${gx} ${gy+gh*n/3}h${gw}`).join('')}`} stroke={white} strokeWidth="1.1"/>{[0,1].map(n=><rect key={n} x={lx+leaf*.15+n*leaf*.37} y={y+h*.61} width={leaf*.33} height={h*.31} fill="#e3e4db" stroke="#adb2a4" strokeWidth=".7"/>)}</>}
    <path d={sliding?`M${x+w-2} ${y+h*.45}v10`:`M${residential?lx+3:lx+leaf-3} ${y+h*.58}h3`} stroke="#202420" strokeWidth="1.7"/>{residential&&<circle cx={lx+3} cy={y+h*.51} r="1.2" fill="#202420"/>}
   </g>;
  })}
 </svg>;
}
