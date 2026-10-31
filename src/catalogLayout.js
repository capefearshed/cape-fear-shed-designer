import {wallSpan,framedWidth} from './openingLayout.js';
import {optionByCode} from './designContract.js';
import {wallHeightFeet} from './modelBridge.js';
export function openingAllowed(catalog,shed,option,wall){
 const rule=option.placement||{},height=wallHeightFeet(shed.wallHeight);
 return !(rule.minWidth&&shed.width<rule.minWidth||rule.minWallHeight&&height<rule.minWallHeight||rule.walls&&!rule.walls.includes(wall)||rule.styles&&!rule.styles.includes(shed.style)||option.height>height*12);
}
export function snapOpeningX(catalog,shed,option,x,wall){
 const min=catalog.rules.cornerClear+framedWidth({...option,kind:option.kind})/2;
 const max=wallSpan(wall,shed.width,shed.length)-min,step=catalog.rules.snap||1;
 return Math.max(min,Math.min(max,min+Math.round((x-min)/step)*step));
}
export function placeOpening(catalog,shed,placed,code,wall,id){
 const option=optionByCode(catalog,code);if(!openingAllowed(catalog,shed,option,wall))return null;
 const item={id,code,wall,width:option.width,height:option.height,kind:option.kind,y:option.kind==='door'?0:40};
 const margin=catalog.rules.cornerClear,gap=catalog.rules.gap,step=catalog.rules.snap||1;
 const span=wallSpan(wall,shed.width,shed.length),half=framedWidth(item)/2;
 const candidates=[];
 for(let x=margin+half;x<=span-margin-half;x+=step)candidates.push(x);
 candidates.sort((a,b)=>Math.abs(a-span/2)-Math.abs(b-span/2));
 const x=candidates.find(x=>placed.every(p=>{
  if(p.wall!==wall)return true;const o=optionByCode(catalog,p.code);
  return Math.abs(p.x-x)>=(framedWidth(item)+framedWidth({...o,kind:o.kind}))/2+gap;
 }));
 return x===undefined?null:{id,code,wall,x,y:item.y,rampRemoved:!catalog.rules.rampDefault};
}
export function validPlacement(catalog,shed,placed){
 return placed.every(p=>{
  const option=optionByCode(catalog,p.code);if(!option||!openingAllowed(catalog,shed,option,p.wall)||p.y<0||p.y+option.height>wallHeightFeet(shed.wallHeight)*12)return false;
  const half=framedWidth({...option,kind:option.kind})/2,span=wallSpan(p.wall,shed.width,shed.length),margin=catalog.rules.cornerClear;
  if(p.x-half<margin-.001||p.x+half>span-margin+.001)return false;
  return placed.every(other=>{
   if(p.id===other.id||p.wall!==other.wall)return true;
   const o=optionByCode(catalog,other.code);
   return Math.abs(p.x-other.x)>=(framedWidth({...option,kind:option.kind})+framedWidth({...o,kind:o.kind}))/2+catalog.rules.gap-.001;
  });
 });
}
