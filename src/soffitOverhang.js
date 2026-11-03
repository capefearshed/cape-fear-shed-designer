import {BIRD_BOX_OVERHANG} from './birdBoxOverhang.js';
import {FLOOR_HEIGHT,roofDimensions} from './shedGeometry.js';
export const SOFFIT_OVERHANG='roof-overhang-soffit-8';
export const hasSoffitOverhang=state=>(state.extras||[]).some(e=>[SOFFIT_OVERHANG,BIRD_BOX_OVERHANG].includes(e.code)&&e.qty>0);
export const OVERHANG_CODES=['roof-overhang-she-shed',SOFFIT_OVERHANG,BIRD_BOX_OVERHANG];
export function selectOverhang(extras,code){
 return [...extras.filter(e=>!OVERHANG_CODES.includes(e.code)),...(code?[{code,qty:1}]:[])];
}
// Boxed roof-edge strips: local Y is perpendicular to the roof, so the
// 3½-inch eave face tilts with its roof plane rather than staying plumb.
export function soffitOverhangSections({w,l,wall,pitch,lean=false}){
 const o=8/12,depth=3.5/12,top=-.055;
 const d=roofDimensions(w,l,pitch,wall,8);
 const angle=lean?Math.PI/18:d.angle;
 const slope=lean?(w+2*o)/Math.cos(angle):d.slope;
 const centerY=lean?FLOOR_HEIGHT+wall+w/2*Math.tan(angle):(d.ridgeY+d.eaveY)/2;
 return (lean?[0]:[-1,1]).map(side=>{
  const eaveSpan=o/Math.cos(angle);
  const strips=[...[-1,1].map(end=>({id:'rake-'+end,at:[end*(l/2+o/2),top-depth/2,0],size:[o,depth,slope]})),
   ...(lean?[-1,1]:[side]).map(edge=>({id:'eave-'+edge,at:[0,top-depth/2,edge*(slope/2-eaveSpan/2)],size:[l,depth,eaveSpan]}))];
  return {position:[0,centerY,lean?0:side*d.run/2],rotation:[lean?-angle:side*angle,0,0],strips};
 });
}

export const isBoxedSoffit=code=>[SOFFIT_OVERHANG,BIRD_BOX_OVERHANG].includes(code);
export function sidewallFeet(code){const m=String(code).match(/^wall-(\d+)(?:-(\d+))?$/);return m?Number(m[1])+Number(m[2]||0)/12:6.5;}
export const leanLowWall=shed=>shed.roofHighWall==='back'?'front':'back';
export function lowWallDoor(catalog,state){
 return state.shed.style==='style-lean-to'&&(state.placed||[]).some(p=>p.wall===leanLowWall(state.shed)&&catalog.options.find(o=>o.code===p.code)?.kind==='door');
}
export function overhangUnavailableReason(shed,code,placed=[],catalog={options:[]}){
 if(code===BIRD_BOX_OVERHANG&&shed.style==='style-lean-to')return 'Not available with lean-to roofs. Choose the 8″ Soffit Overhang instead.';
 if(isBoxedSoffit(code)&&lowWallDoor(catalog,{shed,placed}))return 'An 8″ soffit cannot be used with a door on the low wall. Move the door to the high wall or an end wall, or choose a different overhang.';
 return '';
}
export function overhangHeightNote(shed,code){
 return isBoxedSoffit(code)&&sidewallFeet(shed.wallHeight)<7?'Selecting this option will increase your sidewall height to 7 feet.':'';
}
export function selectedOverhangReason(catalog,state){
 const selected=(state.extras||[]).find(e=>isBoxedSoffit(e.code)&&e.qty>0);if(!selected)return '';
 if(sidewallFeet(state.shed.wallHeight)<7)return '8″ soffit overhangs require a minimum 7-foot sidewall. Choose 7′ or 8′ walls, or change the overhang first.';
 return overhangUnavailableReason(state.shed,selected.code,state.placed,catalog);
}
export function withSelectedOverhang(catalog,state,code){
 const reason=overhangUnavailableReason(state.shed,code,state.placed,catalog);if(reason)throw new Error(reason);
 let next={...state,extras:selectOverhang(state.extras,code)};
 if(isBoxedSoffit(code)&&sidewallFeet(next.shed.wallHeight)<7){
  if(!catalog.options.some(o=>o.code==='wall-7'))throw new Error('This option requires 7-foot sidewalls, which are not currently available.');
  next={...next,shed:{...next.shed,wallHeight:'wall-7'}};
 }
 return next;
}
export function withCompatibleOverhang(catalog,state,{repair=false}={}){
 let next=state;
 if(state.shed.style==='style-lean-to'&&(state.extras||[]).some(e=>e.code===BIRD_BOX_OVERHANG&&e.qty>0)){
  const fallback=catalog.options.some(o=>o.code===SOFFIT_OVERHANG)&&!lowWallDoor(catalog,state)?SOFFIT_OVERHANG:null;
  next={...next,extras:selectOverhang(next.extras,fallback)};
 }
 const selected=(next.extras||[]).find(e=>isBoxedSoffit(e.code)&&e.qty>0);
 if(selected){
  if(repair&&lowWallDoor(catalog,next))return {...next,extras:selectOverhang(next.extras,null)};
  if(sidewallFeet(next.shed.wallHeight)<7){
   if(!catalog.options.some(o=>o.code==='wall-7'))return {...next,extras:selectOverhang(next.extras,null)};
   next={...next,shed:{...next.shed,wallHeight:'wall-7'}};
  }
 }
 return next;
}
