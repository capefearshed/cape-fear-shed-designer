import {optionByCode,foundationCode,resolvedDoorColor} from './designContract.js';
export const SIDING_PROFILES={'siding-lp-panel':'lp-panel','siding-lp-lap':'lap','siding-board-batten':'board-batten','siding-vinyl-straight':'vinyl-straight','siding-vinyl-dutch':'vinyl-dutch'};
const SHINGLE_PROFILES={'Onyx Black':'charcoal','Estate Gray':'gray','Weathered Wood':'driftwood','Driftwood':'driftwood','Desert Tan':'desert-tan','Silver Birch':'silver-birch'};
export function wallHeightFeet(code){const match=code.match(/^wall-(\d+)(?:-(\d+))?$/);return match?Number(match[1])+Number(match[2]||0)/12:6.5;}
export function doorModel(option){
 const code=option.code;
 return code.includes('rollup')?'rollup':code.includes('residential')?'residential':code.includes('french')?'french':code.includes('sliding')?'sliding':code.includes('double')?'double':'single';
}
export function modelDesign(catalog,state){
 const {shed,colors}=state,height=wallHeightFeet(shed.wallHeight);
 const sidingType=SIDING_PROFILES[shed.siding]||'lp-panel',paint=colors.siding.hex||'#B7A48B',trim=colors.trim.hex||'#F2F0EB';
 const openings=state.placed.map(p=>{
  const option=optionByCode(catalog,p.code),door=option.kind==='door',type=door?doorModel(option):'standard';
  const color=door?resolvedDoorColor(catalog,state,p,option):null;
  return {...p,kind:option.kind,type,width:option.width,height:door&&['single','double'].includes(type)?73.5:option.height,y:p.y||0,ramp:Boolean(option.ramp&&p.rampRemoved===false),transom:Boolean(option.transom),recessIn:type==='rollup'?4:undefined,secondaryDoorColor:door&&Boolean(p.color?.hex)&&p.color.hex!==paint,doorPaint:color?.hex,...(!door&&option.code==='window-18x27'?{width:19.75,height:28.5}:{})};
 });
 const loft=state.extras.find(e=>e.code==='loft-45'&&e.qty),workbench=state.extras.find(e=>e.code==='workbench-18'&&e.qty),surf=state.extras.find(e=>e.code==='surf-rack'&&e.qty);
 return {width:shed.width,length:shed.length,height,paint,trim,sidingType,roofStyle:shed.style==='style-lean-to'?'lean-to':'gable',dormer:shed.style==='style-gable-dormer',pitch:catalog.styles?.find(s=>s.code===shed.style)?.mainPitch||shed.roofPitch||5,roof:SHINGLE_PROFILES[colors.roof.name]||'charcoal',roofMaterial:shed.roofing==='roof-metal'?'metal':'shingles',metalColor:colors.roof.hex||'#BFC4C5',foundation:foundationCode(shed.width,shed.foundation==='foundation-slab')==='foundation-slab'?'slab':'framed',openings,accessories:{loft:Boolean(loft),workbench:Boolean(workbench),surfRack:Boolean(surf)},dowel:surf?.dowel||18,interiorWalls:{loft:loft?.wall||'left',workbench:workbench?.wall||'right',surfRack:surf?.wall||'back'}};
}
