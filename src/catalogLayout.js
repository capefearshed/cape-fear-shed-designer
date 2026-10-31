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
