import {FLOOR_HEIGHT} from './shedGeometry.js';
export const SHE_SHED_OVERHANG='roof-overhang-she-shed';
export const hasSheShedOverhang=state=>(state.extras||[]).some(e=>e.code===SHE_SHED_OVERHANG&&e.qty>0);
// Gable faces stay plumb; lean-to eave fascia tilts normal to the roof plane.
// Vertex coordinates use feet. Top edges seat against the existing roof perimeter.
export function sheShedTrimBoards({w,l,wall,pitch,lean=false,overhangInches=4}){
 const t=.75/12,h=3.5/12,o=overhangInches/12,x=l/2+o,z=w/2+o;
 const angle=lean?Math.PI/18:Math.atan(pitch/12);
 const ridge=FLOOR_HEIGHT+wall+w/2*pitch/12;
 const top=zz=>(lean?FLOOR_HEIGHT+wall+(zz+w/2)*Math.tan(angle):ridge-Math.abs(zz)*Math.tan(angle))-.055;
 const boards=[];
 // Gable side fascia remains plumb. Lean-to fascia pivots at its roof edge.
 for(const side of [-1,1]){
  const y=top(side*z),plane=side*(z+t/2);
  boards.push({id:side===1?'front':'back',axis:'z',plane,thickness:t,
   ...(lean?{position:[0,y,plane],rotation:[-angle,0,0],outline:[[-x-t,0],[x+t,0],[x+t,-h],[-x-t,-h]]}:
    {outline:[[-x-t,y],[x+t,y],[x+t,y-h],[-x-t,y-h]]})});
 }
 // Lean-to rake undersides offset normal to the roof so corner joins close
 // against the tilted high/low fascia rather than leaving wedge-shaped gaps.
 for(const end of [-1,1])for(const [a,b] of lean?[[-z,z]]:[[-z,0],[0,z]]){
  const dz=lean?h*Math.sin(angle):0,dy=lean?h*Math.cos(angle):h;
  boards.push({id:(end===1?'right':'left')+'-'+a,axis:'x',plane:end*(x+t/2),thickness:t,
   outline:[[a,top(a)],[b,top(b)],[b+dz,top(b)-dy],[a+dz,top(a)-dy]]});
 }
 return boards;
}
