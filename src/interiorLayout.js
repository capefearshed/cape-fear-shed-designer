export const INTERIOR_SPECS=Object.freeze({
 loft:{depthIn:45,thicknessIn:4,undersideIn:72,topIn:76},
 workbench:{depthIn:18,thicknessIn:4,topIn:34},
 surfRack:{dowelDiameterIn:1,spacingIn:12,spacingDirection:'horizontal',mountHeightIn:42},
});
export const wallPose=(wall,w,l)=>({
 position:wall==='front'?[0,0,w/2]:wall==='back'?[0,0,-w/2]:wall==='right'?[l/2,0,0]:[-l/2,0,0],
 angle:{front:0,back:Math.PI,right:Math.PI/2,left:-Math.PI/2}[wall],
 reverse:wall==='back'||wall==='right'?-1:1,
 span:wall==='front'||wall==='back'?l:w,
});
export function openingRects(wall,width,length,openings){
 const pose=wallPose(wall,width,length);
 return openings.filter(o=>o.wall===wall).map(o=>({id:o.id,kind:o.kind,x:(o.x/12-pose.span/2)*pose.reverse,width:o.width/12,bottom:o.y/12,top:(o.y+o.height+(o.kind==='door'&&o.transom?10.25:0))/12}));
}
// Split the wall backing around actual customer openings, rather than drawing over them.
export function wallPanels(span,height,rects){
 const edges=[-span/2,span/2,...rects.flatMap(r=>[Math.max(-span/2,r.x-r.width/2),Math.min(span/2,r.x+r.width/2)])].sort((a,b)=>a-b);
 const panels=[];
 for(let i=0;i<edges.length-1;i++){
  const left=edges[i],right=edges[i+1];if(right-left<.001)continue;
  const middle=(left+right)/2,cuts=rects.filter(r=>middle>r.x-r.width/2&&middle<r.x+r.width/2).sort((a,b)=>a.bottom-b.bottom);
  let bottom=0;
  for(const cut of cuts){if(cut.bottom>bottom)panels.push({x:middle,y:(bottom+cut.bottom)/2,width:right-left,height:cut.bottom-bottom});bottom=Math.max(bottom,Math.min(height,cut.top));}
  if(bottom<height)panels.push({x:middle,y:(bottom+height)/2,width:right-left,height:height-bottom});
 }
 return panels;
}
export function interiorLayout(width,length,options={},placements={},openings=[]){
 const insideWidth=width-7/12,insideLength=length-7/12;
 const platform=(id,depth,top)=>({wall:(placements[id]||(id==='loft'?'left':'right')),x:((placements[id]||(id==='loft'?'left':'right'))==='right'?1:-1)*(insideLength/2-depth/2),z:0,width:depth,depth:insideWidth,bottom:top-4/12,top});
 const wall=placements.surfRack||'back',pose=wallPose(wall,width,length),height=42/12;
 const blocked=openingRects(wall,width,length,openings).filter(r=>r.kind==='door'&&r.bottom<height+.3&&r.top>height-.3).map(r=>[r.x-r.width/2-.3,r.x+r.width/2+.3]).sort((a,b)=>a[0]-b[0]);
 let start=-pose.span/2+.4;const gaps=[];
 for(const [a,b] of blocked){if(a>start)gaps.push([start,a]);start=Math.max(start,b);}
 if(start<pose.span/2-.4)gaps.push([start,pose.span/2-.4]);
 const cornerGaps=gaps.filter(g=>g[1]-g[0]>=1.25&&(Math.abs(g[0]-(-pose.span/2+.4))<.001||Math.abs(g[1]-(pose.span/2-.4))<.001));
 const gap=cornerGaps[0]||gaps.sort((a,b)=>(b[1]-b[0])-(a[1]-a[0]))[0];
 const railWidth=gap?Math.min(3.5,gap[1]-gap[0]):0;
 const atRightCorner=gap&&Math.abs(gap[1]-(pose.span/2-.4))<.001&&Math.abs(gap[0]-(-pose.span/2+.4))>.001;
 const center=gap?(atRightCorner?gap[1]-railWidth/2:gap[0]+railWidth/2):0;
 const windowsAbove=openingRects(wall,width,length,openings).filter(r=>r.kind==='window'&&Math.abs(r.x-center)<(r.width+railWidth)/2);
 const mountHeight=Math.min(height,...windowsAbove.map(r=>r.bottom-4/12));
 const count=railWidth>=1.25?Math.min(4,Math.floor(railWidth-.25)+1):0;
 return {insideWidth,insideLength,
  loft:platform('loft',45/12,76/12),workbench:platform('workbench',18/12,34/12),
  surfRack:{wall,center,railWidth,count,height:mountHeight,dowels:Array.from({length:count},(_,i)=>i-(count-1)/2)},
 };
}
