import React from 'react';
export default function OpeningPicture({option:o}){
 const code=o.code,double=/double|french|sliding/.test(code),glass=/french|sliding|residential/.test(code),transom=/transom/.test(code),rollup=/rollup/.test(code),window=o.kind==='window';
 const w=window?55*o.width/o.height:82*o.width/o.height,x=50-w/2,y=transom?24:12,h=window?55:82;
 return <svg className="opening-picture" viewBox="0 0 100 110" aria-hidden="true" focusable="false">
  <rect x={x-4} y={y-4} width={w+8} height={h+8} rx="1" fill="#e8e9e2"/>
  <rect x={x} y={y} width={w} height={h} fill={glass||window?'#c7d7dc':'#fffdf4'} stroke="#44483e" strokeWidth="1.7"/>
  {rollup?Array.from({length:12},(_,i)=><path key={i} d={`M${x+1} ${y+5+i*6}h${w-2}`} stroke="#82877d" strokeWidth="1"/>):<>
   {double&&<path d={`M50 ${y}v${h}`} stroke="#44483e" strokeWidth="2"/>}
   {window&&<path d={`M50 ${y}v${h}M${x} ${y+h/3}h${w}M${x} ${y+h*2/3}h${w}`} stroke="#fff" strokeWidth="2.5"/>}
   {/residential/.test(code)&&<><rect x={x+4} y={y+5} width={w-8} height="30" fill="#c7d7dc" stroke="#fff" strokeWidth="2"/><path d={`M${x+w/3} ${y+5}v30M${x+w*2/3} ${y+5}v30M${x+4} ${y+15}h${w-8}M${x+4} ${y+25}h${w-8}`} stroke="#fff"/><rect x={x+4} y={y+45} width={w-8} height="29" fill="#fffdf4" stroke="#777c70"/></>}
   {!window&&!glass&&<>{Array.from({length:Math.max(2,Math.floor(w/8))},(_,i)=><path key={i} d={`M${x+5+i*8} ${y+4}v${h-8}`} stroke="#d2d5ca"/>)}<path d={`M${x} ${y+35}h${w}M${x} ${y+h-5}h${w}`} stroke="#7d8276" strokeWidth="3"/></>}
   {transom&&<><rect x={x} y="7" width={w} height="13" fill="#adc4ce" stroke="#44483e"/><path d={`M${x+w/3} 7v13M${x+w*2/3} 7v13`} stroke="#fff" strokeWidth="2"/></>}
   {!window&&<path d={/sliding/.test(code)?`M${x+w-5} ${y+35}v14`:double?`M47 ${y+46}h6`:`M${x+w-6} ${y+46}h3`} stroke="#23271f" strokeWidth="3"/>}
  </>}
 </svg>;
}
