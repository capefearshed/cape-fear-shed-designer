import {hasSoffitOverhang,leanLowWall} from './soffitOverhang.js';
import {openingAllowed,openingFootprint,placeOpening,redistributeOpenings} from './catalogLayout.js';
import {wallHeightFeet} from './modelBridge.js';
import {structuralStyle} from './styleRules.js';

export function roofingUnavailableReason(catalog,shed,code){
 const style=catalog.styles.find(s=>s.code===shed.style);
 if(!style?.roofing||style.roofing.includes(code))return '';
 return shed.style==='style-gable-dormer'?'Not available with a dormer.':`Not available with ${style.label}.`;
}
export function openingUnavailableReason(catalog,shed,placed,option,wall,replacing=null,extras=[]){
 if(option.kind==='door'&&shed.style==='style-lean-to'&&wall===leanLowWall(shed)&&hasSoffitOverhang({extras}))return 'A door cannot go on the low wall with an 8″ soffit. Choose the high wall or an end wall, or change the overhang.';
 const rule=option.requires||option.placement||{},height=wallHeightFeet(shed.wallHeight),reasons=[];
 if(rule.minWidth&&shed.width<rule.minWidth)reasons.push(`Requires a shed at least ${rule.minWidth}′ wide.`);
 const minHeight=rule.minWall||rule.minWallHeight;
 if(minHeight&&height<minHeight)reasons.push(`Requires ${minHeight}′ sidewalls.`);
 if(rule.walls&&!rule.walls.includes(wall))reasons.push('Available on gable end walls only.');
 if(rule.styles&&!rule.styles.includes(shed.style)&&!rule.styles.includes(structuralStyle(shed.style)))reasons.push('Not available with this roof style.');
 if(!minHeight&&openingFootprint(option).height>height*12)reasons.push('Requires taller sidewalls.');
 if(reasons.length)return reasons.join(' ');
 if(!openingAllowed(catalog,shed,option,wall))return 'Not available with this wall selection.';
 const fits=replacing?redistributeOpenings(catalog,shed,placed.map(p=>p.id===replacing.id?{...p,code:option.code}:p)):placeOpening(catalog,shed,placed,option.code,wall,'availability-check');
 return fits?'':'Not enough clear space on this wall. Choose another wall or a larger shed.';
}
