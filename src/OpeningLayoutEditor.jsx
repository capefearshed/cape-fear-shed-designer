import React,{useRef} from 'react';
export default function OpeningLayoutEditor({items,span,selected,onSelect,onMove}){
 const ordered=[...items].sort((a,b)=>a.x-b.x),active=ordered.find(p=>p.id===selected);
 function shift(direction){
  if(!active)return;
  const neighbour=ordered[ordered.findIndex(p=>p.id===active.id)+direction];
  if(neighbour)onMove(active.id,neighbour.x+direction*.01);
 }
 const track=useRef(null),drag=useRef(null);
 const coordinate=e=>Math.max(0,Math.min(span,(e.clientX-track.current.getBoundingClientRect().left)/track.current.getBoundingClientRect().width*span));
 if(!items.length)return null;
 return <div className="opening-layout-editor"><strong>Arrange this wall</strong><p className="help">Drag an opening past another to swap places. Spacing stays even automatically. Tap an opening to use the arrows.</p><div ref={track} className="opening-layout-track" role="group" aria-label="Wall layout">{ordered.map((p,index)=><button type="button" key={p.id} aria-label={'Move '+p.label} aria-pressed={selected===p.id} style={{left:`${(p.x-p.width/2)/span*100}%`,width:`${p.width/span*100}%`}} onPointerDown={e=>{onSelect(p.id);drag.current={id:p.id,offset:coordinate(e)-p.x};e.currentTarget.setPointerCapture(e.pointerId);}} onPointerMove={e=>{if(drag.current?.id===p.id)onMove(p.id,coordinate(e)-drag.current.offset);}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onClick={()=>onSelect(p.id)} onKeyDown={e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();const direction=e.key==='ArrowLeft'?-1:1,neighbour=ordered[index+direction];if(neighbour)onMove(p.id,neighbour.x+direction*.01);}}}><span>{p.kind==='door'?'Door':'Window'} {ordered.slice(0,index+1).filter(item=>item.kind===p.kind).length}</span><small>↔</small></button>)}</div><div className="opening-layout-ends"><span>Left end</span><span>Right end</span></div><div className="wall-order-actions" role="group" aria-label="Reorder selected opening"><button type="button" disabled={!active||ordered[0]?.id===active.id} onClick={()=>shift(-1)}>← Move left</button><button type="button" disabled={!active||ordered.at(-1)?.id===active.id} onClick={()=>shift(1)}>Move right →</button></div>{active&&<p className="help">Selected: {active.label}</p>}</div>;
}
