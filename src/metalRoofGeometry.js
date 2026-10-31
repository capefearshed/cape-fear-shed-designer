// Ribbed-panel visual profile. Dimensions are feet; major ribs are 9 inches apart.
export function metalProfile(length){
 const majorStep=9/12,majorHeight=.75/12,points=[[-length/2,0]];
 const ribs=[];
 for(let center=-length/2;center<=length/2+.001;center+=majorStep){
  ribs.push([center,2/12,majorHeight]);
  for(const offset of [3/12,6/12])ribs.push([center+offset,.5/12,.12/12]);
 }
 for(const [center,width,height] of ribs.sort((a,b)=>a[0]-b[0])){
  for(const [x,y] of [[center-width/2,0],[center-width*.17,height],[center+width*.17,height],[center+width/2,0]])if(x>-length/2&&x<length/2)points.push([x,y]);
 }
 points.push([length/2,0]);return points.sort((a,b)=>a[0]-b[0]);
}
export function metalRoofAllowed(style,dormer){return style==='gable'&&!dormer;}

// Residential rake profile from the supplied cross-section (inches converted to feet).
export const METAL_TRIM={faceIn:2.75,topFlangeIn:3+1/16,diagonalIn:1+1/16,returnIn:.75,hemIn:.5,eaveProjectionIn:1};
export function rakeProfile(end=1){
 const diagonal=METAL_TRIM.diagonalIn/12/Math.sqrt(2),hem=METAL_TRIM.hemIn/12/Math.sqrt(2),top=METAL_TRIM.topFlangeIn/12;
 return [[end*hem,-METAL_TRIM.faceIn/12-hem],[0,-METAL_TRIM.faceIn/12],[0,0],[-end*top,0],[-end*(top+diagonal),-diagonal],[-end*(top+diagonal+METAL_TRIM.returnIn/12),-diagonal]];
}
export function ridgeCapSection(angle){
 return [[-7/12,-7/12*Math.tan(angle)+.11],[-.08,.12],[0,.13],[.08,.12],[7/12,-7/12*Math.tan(angle)+.11]];
}

export function rakeStripData(end,length){
 const section=rakeProfile(end),vertices=[],indices=[];
 for(let i=0;i<section.length-1;i++){
  const [x,y]=section[i],[nx,ny]=section[i+1],o=vertices.length/3;
  vertices.push(x,y,-length/2,x,y,length/2,nx,ny,length/2,nx,ny,-length/2);
  // Mirroring the profile also requires mirroring triangle winding.
  if(end===1)indices.push(o,o+2,o+1,o,o+3,o+2);
  else indices.push(o,o+1,o+2,o,o+2,o+3);
 }
 return {vertices,indices};
}
