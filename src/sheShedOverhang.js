import {FLOOR_HEIGHT} from './shedGeometry.js';
export const SHE_SHED_OVERHANG='roof-overhang-she-shed';
export const hasSheShedOverhang=state=>(state.extras||[]).some(e=>e.code===SHE_SHED_OVERHANG&&e.qty>0);
// Faces stay in vertical planes parallel to the siding; rake boards follow the pitch.
// Vertex coordinates use feet. Top edges seat against the existing roof perimeter.
export function sheShedTrimBoards({w,l,wall,pitch,lean=false,overhangInches=4}){
 const t=.75/12,h=3.5/12,o=overhangInches/12,x=l/2+o,z=w/2+o;
 const angle=lean?Math.PI/18:Math.atan(pitch/12);
 const ridge=FLOOR_HEIGHT+wall+w/2*pitch/12;
 const top=zz=>(lean?FLOOR_HEIGHT+wall+(zz+w/2)*Math.tan(angle):ridge-Math.abs(zz)*Math.tan(angle))-.055;
 const boards=[];
 // Horizontal front and back fascia, vertical rather than rotated with the roof.
 for(const side of [-1,1])boards.push({id:side===1?'front':'back',axis:'z',plane:side*(z+t/2),thickness:t,outline:[[-x-t,top(side*z)], [x+t,top(side*z)],[x+t,top(side*z)-h],[-x-t,top(side*z)-h]]});
 // Gable ends have two joined rake boards; lean-to ends have one sloped board.
 for(const end of [-1,1])for(const [a,b] of lean?[[-z,z]]:[[-z,0],[0,z]])boards.push({id:(end===1?'right':'left')+'-'+a,axis:'x',plane:end*(x+t/2),thickness:t,outline:[[a,top(a)],[b,top(b)],[b,top(b)-h],[a,top(a)-h]]});
 return boards;
}
