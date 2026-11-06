// Full sill plate spans from the exterior lip past the recessed curtain,
// including its deepest corrugation and the inside mounting position.
export function rollupThreshold(recess=4/12,floorOffset=0){
 const front=2/12,back=-recess-2/12,thickness=.125/12;
 return {depth:front-back,z:(front+back)/2,y:floorOffset+thickness/2+.002,thickness};
}

// Actual tread spacing in feet: staggered 1.4in centers and alternating
// diagonal ribs, kept inside the sheet edges even after a 45-degree rotation.
export function diamondTreadLayout(width,depth){
 const pitch=1.4/12,margin=.65/12,treads=[];
 for(let row=0,z=-depth/2+margin;z<=depth/2-margin;row++,z+=pitch){
  for(let col=0,x=-width/2+margin+(row%2)*pitch/2;x<=width/2-margin;col++,x+=pitch){
   treads.push({x,z,angle:(row+col)%2?Math.PI/4:-Math.PI/4});
  }
 }
 return treads;
}
