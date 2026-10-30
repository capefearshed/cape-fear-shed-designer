export const WALLS=['front','back','left','right'];
export const wallSpan=(wall,w,l)=>(wall==='front'||wall==='back'?l:w)*12;
export const framedWidth=o=>o.width+(o.kind==='door'?9:(o.shutters?23:5));
const boundary=(o,w,l)=>({min:7.5+framedWidth(o)/2,max:wallSpan(o.wall,w,l)-7.5-framedWidth(o)/2});
function nearbyPositions(item,list,w,l){
 const {min,max}=boundary(item,w,l);
 if(min>max)return [];
 return Array.from({length:Math.floor(max-min)+1},(_,i)=>min+i)
  .filter(x=>validOpening({...item,x},list,w,l));
}
function validOpening(item,list,w,l){
 const {min,max}=boundary(item,w,l);
 if(item.x<min||item.x>max)return false;
 return list.every(o=>o.id===item.id||o.wall!==item.wall||Math.abs(o.x-item.x)>=(framedWidth(o)+framedWidth(item))/2+4);
}
// Lay out openings in their chosen sequence. Equal clear gaps are shared
// between corner margins and every pair of opening trim assemblies.
export function distributeWall(items,wall,w,l){
 const length=wallSpan(wall,w,l),margin=7.5,gap=4;
 const total=items.reduce((n,o)=>n+framedWidth(o),0);
 const free=length-2*margin-total;
 if(free<gap*Math.max(0,items.length-1)-.001)return null;
 if(items.length===1){
  const o=items[0],half=framedWidth(o)/2;
  const x=o.alignment==='left'?margin+half:o.alignment==='right'?length-margin-half:length/2;
  return [{...o,x}];
 }
 const even=free/(items.length+1);
 let cursor=margin+even;
 return items.map(o=>{const x=cursor+framedWidth(o)/2;cursor+=framedWidth(o)+even;return {...o,x};});
}
export function distributeAll(items,w,l){
 let next=[...items];
 for(const wall of WALLS){
  const wallItems=next.filter(o=>o.wall===wall);
  const laid=distributeWall(wallItems,wall,w,l);
  if(!laid)return null;
  const values=new Map(laid.map(o=>[o.id,o]));
  next=next.map(o=>values.get(o.id)||o);
 }
 return next;
}
