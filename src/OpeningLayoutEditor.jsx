import React,{useEffect,useRef} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
export default function OpeningLayoutEditor({items,selected,onSelect,onMove}){
 const ordered=[...items].sort((a,b)=>a.x-b.x),active=ordered.find(p=>p.id===selected);
 const track=useRef(null);
 useEffect(()=>{const button=track.current?.querySelector('[aria-pressed="true"]');if(button){const parent=track.current;parent.scrollLeft=Math.max(0,button.getBoundingClientRect().left-parent.getBoundingClientRect().left+parent.scrollLeft-(parent.clientWidth-button.clientWidth)/2);}},[selected,items.map(p=>p.id).join('|')]);
 function shift(direction){
  if(!active)return;
  const neighbour=ordered[ordered.findIndex(p=>p.id===active.id)+direction];
  if(neighbour)onMove(active.id,neighbour.x+direction*.01);
 }
 if(!items.length)return null;
 return <div className="opening-layout-editor">
  <div className="wall-order-row">
   <button type="button" className="wall-order-arrow" aria-label="Move selected opening left" disabled={!active||ordered[0]?.id===active.id} onClick={()=>shift(-1)}><ArrowLeft size={25}/></button>
   <div ref={track} className="opening-layout-track" role="group" aria-label="Wall layout">{ordered.map((p,index)=><button type="button" key={p.id} aria-label={'Select '+p.label+', position '+(index+1)} aria-pressed={selected===p.id} onClick={()=>onSelect(p.id)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const direction=e.key==='ArrowLeft'?-1:1,neighbour=ordered[index+direction];if(neighbour)onMove(p.id,neighbour.x+direction*.01);}}}>
    <svg width="27" height="34" viewBox="0 0 28 36" aria-hidden="true" focusable="false">{p.kind==='door'?<><rect x="3" y="2" width="22" height="32" rx="1"/><path d="M14 3v30M5 18h18"/><circle cx="17" cy="20" r="1" fill="currentColor" stroke="none"/></>:<><rect x="3" y="8" width="22" height="22" rx="1"/><path d="M14 9v20M4 19h20"/></>}</svg>
   </button>)}</div>
   <button type="button" className="wall-order-arrow" aria-label="Move selected opening right" disabled={!active||ordered.at(-1)?.id===active.id} onClick={()=>shift(1)}><ArrowRight size={25}/></button>
  </div>
  <p className="wall-order-hint">{active?'Use an arrow to swap places.':'Tap an opening, then use an arrow.'}</p>
 </div>;
}
