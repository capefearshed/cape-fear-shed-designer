import {wallSpan,framedWidth,distributeAll} from './openingLayout.js';
import {optionByCode} from './designContract.js';
import {wallHeightFeet} from './modelBridge.js';
import {structuralStyle} from './styleRules.js';
// Quote dimensions stay nominal. Collision checks use the approved visible assembly.
export function openingFootprint(option,placed={}){
 const wood=option.kind==='door'&&/single|double|transom/.test(option.code);
 return {...option,...placed,kind:option.kind,width:option.code==='window-18x27'?19.75:option.width,height:option.code==='window-18x27'?28.5:wood?73.5:option.height};
}
export function openingAllowed(catalog,shed,option,wall){
 if(!option)return false;
 const rule=option.requires||option.placement||{},height=wallHeightFeet(shed.wallHeight);
 return !(rule.minWidth&&shed.width<rule.minWidth||(rule.minWall||rule.minWallHeight)&&height<(rule.minWall||rule.minWallHeight)||rule.walls&&!rule.walls.includes(wall)||rule.styles&&!rule.styles.includes(shed.style)&&!rule.styles.includes(structuralStyle(shed.style))||openingFootprint(option).height>height*12);
}
export function snapOpeningX(catalog,shed,option,x,wall,placed={}){
 const min=catalog.rules.cornerClear+framedWidth(openingFootprint(option,placed))/2;
 const max=wallSpan(wall,shed.width,shed.length)-min,step=catalog.rules.snap||1;
 return Math.max(min,Math.min(max,min+Math.round((x-min)/step)*step));
}
export function redistributeOpenings(catalog,shed,placed){
 if(placed.some(p=>!openingAllowed(catalog,shed,optionByCode(catalog,p.code),p.wall)))return null;
 const laid=distributeAll(placed.map(p=>openingFootprint(optionByCode(catalog,p.code),p)),shed.width,shed.length);
 if(!laid)return null;
 const positions=new Map(laid.map(p=>[p.id,p.x]));
 return placed.map(p=>({...p,x:positions.get(p.id)}));
}
export function placeOpening(catalog,shed,placed,code,wall,id){
 const option=optionByCode(catalog,code);if(!openingAllowed(catalog,shed,option,wall))return null;
 const item={id,code,wall,x:0,y:option.kind==='door'?0:40,rampRemoved:true};
 const laid=redistributeOpenings(catalog,shed,[...placed,item]);return laid?.find(p=>p.id===id)||null;
}
export function validPlacement(catalog,shed,placed){
 return placed.every(p=>{
  const option=optionByCode(catalog,p.code);if(!option||!openingAllowed(catalog,shed,option,p.wall)||p.y<0||p.y+openingFootprint(option).height>wallHeightFeet(shed.wallHeight)*12)return false;
  const half=framedWidth(openingFootprint(option,p))/2,span=wallSpan(p.wall,shed.width,shed.length),margin=catalog.rules.cornerClear;
  if(p.x-half<margin-.001||p.x+half>span-margin+.001)return false;
  return placed.every(other=>p.id===other.id||p.wall!==other.wall||Math.abs(p.x-other.x)>=(framedWidth(openingFootprint(option,p))+framedWidth(openingFootprint(optionByCode(catalog,other.code),other)))/2+catalog.rules.gap-.001);
 });
}

// Dragging chooses order only. Every completed ordering is evenly spaced.
export function moveOpening(catalog,shed,placed,id,x){
 const selected=placed.find(p=>p.id===id);if(!selected||!Number.isFinite(x))return null;
 const items=placed.filter(p=>p.wall===selected.wall&&p.id!==id).sort((a,b)=>a.x-b.x);
 const index=items.findIndex(p=>p.x>x);items.splice(index<0?items.length:index,0,selected);
 const laid=redistributeOpenings(catalog,shed,items.map(({alignment,...p})=>p));
 if(!laid)return null;
 let cursor=0;const next=placed.map(p=>p.wall===selected.wall?laid[cursor++]:p);
 return validPlacement(catalog,shed,next)?next:null;
}

// A lone door has three positions; shared walls use evenly spaced ordering.
export function offsetOpening(catalog,shed,placed,id,direction){
 const item=placed.find(p=>p.id===id),option=item&&optionByCode(catalog,item.code);
 if(!item||option?.kind!=='door'||!Number.isFinite(direction)||!direction||placed.some(p=>p.wall===item.wall&&p.id!==id))return null;
 const half=framedWidth(openingFootprint(option,item))/2,span=wallSpan(item.wall,shed.width,shed.length);
 const min=catalog.rules.cornerClear+half,max=span-min,center=span/2;
 if(min>max)return null;
 const current=item.x<center-.001?0:item.x>center+.001?2:1,nextIndex=current+Math.sign(direction);
 if(nextIndex<0||nextIndex>2)return null;
 const x=[min,center,max][nextIndex];if(Math.abs(x-item.x)<.001)return null;
 const next=placed.map(p=>p.id===id?{...p,x,alignment:['left','center','right'][nextIndex]}:p);
 return validPlacement(catalog,shed,next)?next:null;
}

// Arrow actions use discrete placement, never a pixel-sized movement.
export function stepOpening(catalog,shed,placed,id,screenDirection){
 const selected=placed.find(p=>p.id===id);if(!selected||![-1,1].includes(screenDirection))return null;
 const direction=screenDirection*(selected.wall==='back'||selected.wall==='right'?-1:1);
 const wallItems=placed.filter(p=>p.wall===selected.wall).sort((a,b)=>a.x-b.x);
 if(wallItems.length===1)return offsetOpening(catalog,shed,placed,id,direction);
 const index=wallItems.findIndex(p=>p.id===id),next=index+direction;
 if(next<0||next>=wallItems.length)return null;
 [wallItems[index],wallItems[next]]=[wallItems[next],wallItems[index]];
 const laid=redistributeOpenings(catalog,shed,wallItems.map(({alignment,...p})=>p));if(!laid)return null;
 let cursor=0;
 const result=placed.map(p=>p.wall===selected.wall?laid[cursor++]:p);
 return validPlacement(catalog,shed,result)?result:null;
}
