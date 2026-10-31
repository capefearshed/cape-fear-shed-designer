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
