// Full sill plate spans from the exterior lip past the recessed curtain,
// including its deepest corrugation and the inside mounting position.
export function rollupThreshold(recess=4/12,floorOffset=0){
 const front=2/12,back=-recess-2/12,thickness=.125/12;
 return {depth:front-back,z:(front+back)/2,y:floorOffset+thickness/2+.002,thickness};
}
