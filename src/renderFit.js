import {snapshotState} from './editorSnapshot.js';
import {buildDesign,optionByCode} from './designContract.js';
import {restoreDesign} from './savedDesign.js';
import {openingAllowed,openingFootprint,validPlacement} from './catalogLayout.js';
import {WALLS,wallSpan,framedWidth} from './openingLayout.js';
import {styleUnavailableReason} from './styleRules.js';
import {wallHeightFeet} from './modelBridge.js';

// Pure fit pass: never remove an item, change its wall/type, or reorder neighbors.
export function fitSavedDesign(catalog,design,editorState){
 const conflicts=[];
 const conflict=(id,wall,reason)=>conflicts.push({id,wall,reason});
 const baseline=snapshotState(editorState??design.editorState);
 if(!baseline){conflict('design',null,'This older design has no original editor dimensions. Open Edit design and save it before updating pictures automatically.');return {conflicts};}
 let state;
 try{state=restoreDesign(catalog,{...design,shed:baseline.shed,colors:baseline.colors},baseline);}catch(e){conflict('design',null,e.message);return {conflicts};}
 let oldDesign;
 try{oldDesign=buildDesign(catalog,baseline);}catch(e){conflict('design',null,e.message);return {conflicts};}
 state.shed={...state.shed,...structuredClone(design.shed)};
 state.colors=structuredClone(design.colors);
 const size=catalog.sizes.find(s=>s.width===state.shed.width&&s.length===state.shed.length);
 if(size)state.shed.size=size.code;
 if(baseline.shed.style==='style-gable-dormer'&&state.shed.style==='style-gable')state.shed.roofPitch=5;
 const styleReason=styleUnavailableReason(catalog,state.shed);
 if(styleReason)conflict('dormer','front',styleReason);
 const incoming=design.elements||[],ids=new Set();
 for(const e of incoming){
  if(ids.has(e.id))conflict(e.id,e.wall??null,'This design contains duplicate element IDs. Open Edit design to review it.');
  ids.add(e.id);
  if(!optionByCode(catalog,e.code))conflict(e.id,e.wall??null,'This saved option is no longer in the catalog. Open Edit design to review it.');
 }
 for(const old of oldDesign.elements){if(optionByCode(catalog,old.code)?.kind!=='dormer'&&!incoming.some(e=>e.id===old.id))conflict(old.id,old.wall??null,'A saved element is missing from the updated design. Open Edit design to review it.');}
 if(conflicts.some(c=>c.reason.includes('missing')||c.reason.includes('catalog')||c.reason.includes('duplicate')))return {conflicts};
 state.placed=incoming.filter(e=>['door','window'].includes(optionByCode(catalog,e.code)?.kind)).map(e=>{
  const previous=baseline.placed.find(p=>p.id===e.id),old=oldDesign.elements.find(p=>p.id===e.id),option=optionByCode(catalog,e.code);
  const p={...previous,...structuredClone(e)};
  if(option.kind==='door'){
   // Derived factory/trim paint must follow the new colors; preserve explicit overrides.
   p.color=JSON.stringify(e.color??null)===JSON.stringify(old?.color??null)?previous?.color??null:e.color??null;
   p.rampRemoved=!incoming.some(r=>r.code===option.ramp&&r.for===e.id);
  }
  if(!WALLS.includes(p.wall))conflict(p.id,p.wall??null,'This opening has an unknown wall.');
  else if(!openingAllowed(catalog,state.shed,option,p.wall))conflict(p.id,p.wall,`${option.label} is not allowed on this wall with the selected size, wall height or roof style.`);
  else if(!Number.isFinite(p.y)||p.y<0||p.y+openingFootprint(option).height>wallHeightFeet(state.shed.wallHeight)*12)conflict(p.id,p.wall,`${option.label} is too tall at its saved height for this wall.`);
  const oldSpan=wallSpan(p.wall,baseline.shed.width,baseline.shed.length),newSpan=wallSpan(p.wall,state.shed.width,state.shed.length);
  p.x=p.x/oldSpan*newSpan;
  if(!Number.isFinite(p.x))conflict(p.id,p.wall??null,'This opening has no valid saved position.');
  return p;
 });
 // Rebuild extras from the authoritative contract, grouping double platforms for the UI.
 state.extras=[];
 for(const e of incoming.filter(e=>!['door','window','ramp','dormer'].includes(optionByCode(catalog,e.code)?.kind))){
  const existing=state.extras.find(x=>x.code===e.code);
  if(existing&&['loft-45','workbench-18'].includes(e.code))existing.qty+=e.qty;
  else state.extras.push(structuredClone(e));
 }
 if(conflicts.length)return {conflicts,candidate:state};
 for(const wall of WALLS){
  const items=state.placed.filter(p=>p.wall===wall).sort((a,b)=>a.x-b.x);
  const span=wallSpan(wall,state.shed.width,state.shed.length),margin=catalog.rules.cornerClear,gap=catalog.rules.gap;
  const half=p=>framedWidth(openingFootprint(optionByCode(catalog,p.code),p))/2;
  const required=items.reduce((sum,p)=>sum+2*half(p),0)+gap*Math.max(0,items.length-1)+2*margin;
  if(required>span+.001){for(const p of items)conflict(p.id,wall,'The openings, trim and required gaps no longer fit on this shorter wall.');continue;}
  for(let i=0;i<items.length;i++){
   const p=items[i],min=i?items[i-1].x+half(items[i-1])+gap+half(p):margin+half(p);
   p.x=Math.max(min,Math.min(span-margin-half(p),p.x));
  }
  for(let i=items.length-1;i>=0;i--){const p=items[i],max=i<items.length-1?items[i+1].x-half(items[i+1])-gap-half(p):span-margin-half(p);p.x=Math.min(p.x,max);}
 }
 if(conflicts.length)return {conflicts,candidate:state};
 if(!validPlacement(catalog,state.shed,state.placed)){conflict('openings',null,'The saved openings cannot meet the required wall clearances.');return {conflicts};}
 try{buildDesign(catalog,state);}catch(e){const extra=state.extras.find(x=>e.message.includes('surf racks')?x.code==='surf-rack':e.message.includes('lofts')?x.code==='loft-45':false);conflict(extra?.id||extra?.code||'design',extra?.wall??null,e.message);}
 return conflicts.length?{conflicts,candidate:state}:{state,conflicts:[]};
}
