export const INTERIOR_SPECS=Object.freeze({
 loft:{depthIn:45,thicknessIn:4,undersideIn:72,topIn:76},
 workbench:{depthIn:18,thicknessIn:4,topIn:34},
 surfRack:{dowelDiameterIn:1,spacingIn:12,levels:3,firstArmHeightIn:42},
});
export function interiorLayout(width,length,options){
 const insideWidth=width-7/12,insideLength=length-7/12;
 const loftDepth=45/12,benchDepth=18/12;
 const benchStart=-insideLength/2+(options.loft?loftDepth:0);
 return {insideWidth,insideLength,
  loft:{x:-insideLength/2+loftDepth/2,z:0,width:loftDepth,depth:insideWidth,bottom:6,top:76/12},
  workbench:{x:(benchStart+insideLength/2)/2,z:-insideWidth/2+benchDepth/2,width:insideLength/2-benchStart,depth:benchDepth,bottom:30/12,top:34/12},
  surfRack:{x:insideLength/2,z:0,postSpacing:Math.min(3,insideWidth*.55),levels:[42,54,66].map(n=>n/12)},
 };
}
