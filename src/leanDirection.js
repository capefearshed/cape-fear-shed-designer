export const leanHighWall=value=>value==='back'?'back':'front';
export const leanSign=value=>leanHighWall(value)==='back'?-1:1;
export function leanTopAt(z,width,wall,highWall){return wall+(width/2+z*leanSign(highWall))*Math.tan(Math.PI/18);}
