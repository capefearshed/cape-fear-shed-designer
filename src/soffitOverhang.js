import {FLOOR_HEIGHT,roofDimensions} from './shedGeometry.js';
export const SOFFIT_OVERHANG='roof-overhang-soffit-8';
export const hasSoffitOverhang=state=>(state.extras||[]).some(e=>e.code===SOFFIT_OVERHANG&&e.qty>0);
export const OVERHANG_CODES=['roof-overhang-she-shed',SOFFIT_OVERHANG];
export function selectOverhang(extras,code){
 return [...extras.filter(e=>!OVERHANG_CODES.includes(e.code)),...(code?[{code,qty:1}]:[])];
}
// Boxed roof-edge strips: local Y is perpendicular to the roof, so the
// 4-inch eave face tilts with its roof plane rather than staying plumb.
export function soffitOverhangSections({w,l,wall,pitch,lean=false}){
 const o=8/12,depth=4/12,top=-.055;
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
