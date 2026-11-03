import {FLOOR_HEIGHT} from './shedGeometry.js';
export const BIRD_BOX_OVERHANG='roof-overhang-soffit-8-bird-box';
export const hasBirdBoxOverhang=state=>(state.extras||[]).some(e=>e.code===BIRD_BOX_OVERHANG&&e.qty>0);
// Closed prisms run along the ridge (X); outlines are [Z,Y] in feet.
// Rakes retain their 3½-inch normal depth. Eave undersides and corner returns
// share one horizontal plane, with plumb outer fascia faces.
export function birdBoxOverhangParts({w,l,wall,pitch,lean=false}){
 const o=8/12,depth=3.5/12,angle=lean?Math.PI/18:Math.atan(pitch/12),m=Math.tan(angle),c=Math.cos(angle);
 const roof=z=>FLOOR_HEIGHT+wall+(lean?(z+w/2)*m:w/2*m-Math.abs(z)*m);
 const top=z=>roof(z)-.055/c,bottom=z=>top(z)-depth/c;
 const parts=[];
 for(const side of [-1,1]){
  const inner=side*w/2,outer=side*(w/2+o),floor=bottom(outer);
  parts.push({id:'eave-'+side,from:-l/2,to:l/2,outline:[[inner,top(inner)],[outer,top(outer)],[outer,floor],[inner,floor]]});
  for(const end of [-1,1]){
   const from=end===1?l/2:-l/2-o,to=from+o;
   // Small triangular closure below the sloping rake, flush with level soffit.
   const ceiling=bottom(inner);
   parts.push({id:'bird-box-'+end+'-'+side,from,to,outline:[[inner,Math.max(floor,ceiling)],[outer,Math.max(floor,bottom(outer))],[outer,Math.min(floor,bottom(outer))],[inner,Math.min(floor,ceiling)]]});
  }
 }
 for(const end of [-1,1])for(const [a,b] of lean?[[-w/2-o,w/2+o]]:[[-w/2-o,0],[0,w/2+o]]){
  const from=end===1?l/2:-l/2-o;
  parts.push({id:'rake-'+end+'-'+a,from,to:from+o,outline:[[a,top(a)],[b,top(b)],[b,bottom(b)],[a,bottom(a)]]});
 }
 return parts;
}
