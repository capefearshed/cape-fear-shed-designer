import {styleUnavailableReason} from './styleRules.js';
const sameColor=(a,b)=>Boolean(a&&b&&(a.code&&b.code?a.code===b.code:a.name?.toLowerCase()===b.name?.toLowerCase()));
export const visibleOptions=catalog=>catalog.options;
export const optionByCode=(catalog,code)=>catalog.options.find(o=>o.code===code);
export function foundationCode(width,slab=false){return slab?'foundation-slab':'foundation-floor';}
export function resolvedDoorColor(catalog,state,placed,option){
 const factory=state.shed.siding.includes('vinyl')||/residential|french|rollup|overhead/.test(option.code);
 return placed.color||(factory?catalog.colors.trim.find(c=>c.standard)||state.colors.trim:state.colors.siding);
}
export function buildDesign(catalog,state,meta={}){
 const {shed,colors}=state,mode=meta.mode||'customer',elements=[];
 const size=catalog.sizes.find(s=>s.code===shed.size);
 if(!size||size.width!==shed.width||size.length!==shed.length)throw new Error('Choose a catalog shed size.');
 const style=catalog.styles.find(s=>s.code===shed.style);
 const styleError=styleUnavailableReason(catalog,shed);if(styleError)throw new Error(styleError);
 if(style.roofing&&!style.roofing.includes(shed.roofing))throw new Error('This shed style requires architectural shingles.');
 const allowed=new Set(visibleOptions(catalog,mode).map(o=>o.code));
 function add(code,fields={}){
  const item=optionByCode(catalog,code);if(!item)throw new Error('Catalog code not found: '+code);
  if(!allowed.has(code))throw new Error('This option is only available in owner mode: '+item.label);
  const entry={id:fields.id||code,code,label:item.label,qty:1,...fields};elements.push(entry);return entry;
 }
 const actualShed={...shed,foundation:foundationCode(shed.width,shed.foundation==='foundation-slab')};
 if(style.roofAngle){delete actualShed.roofPitch;actualShed.roofAngle=style.roofAngle;}else{delete actualShed.roofAngle;actualShed.roofPitch=style.mainPitch||shed.roofPitch||style.defaultPitch||5;}
 if(style.pitches&&!style.pitches.includes(actualShed.roofPitch))throw new Error('Choose an available roof pitch.');
 for(const code of [shed.wallHeight,shed.siding,shed.roofing,actualShed.foundation])if(!allowed.has(code))throw new Error('Unavailable catalog selection: '+code);
 for(const placed of state.placed||[]){
  const option=optionByCode(catalog,placed.code);if(!option||!['door','window'].includes(option.kind))throw new Error('Unknown opening code.');
  const piece=add(option.code,{id:placed.id,qty:1,wall:placed.wall,x:placed.x,y:placed.y||0,width:option.width,height:option.height,...(option.kind==='window'?{shutters:Boolean(placed.shutters)}:{})});
  if(option.kind==='door'){
   const doorColor=resolvedDoorColor(catalog,state,placed,option);
   if(!sameColor(doorColor,colors.siding))piece.color={...doorColor};
   if(option.ramp&&placed.rampRemoved===false)add(option.ramp,{id:'ramp-'+placed.id,wall:placed.wall,for:placed.id,x:placed.x,y:0});
  }
 }
 for(const selection of state.extras||[]){
  if(!selection.qty)continue;
  const option=optionByCode(catalog,selection.code);if(!option)throw new Error('Unknown extra code.');
  if(['auto','ramp','dormer','door','window','wallHeight','siding','roofing','foundation'].includes(option.kind))continue;
  add(selection.code,{id:selection.id||selection.code,qty:option.kind==='upgrade'&&option.perWindow?(state.placed||[]).filter(p=>optionByCode(catalog,p.code)?.kind==='window').length:selection.qty,...(option.code!=='anchors-hurricane'&&(selection.wall||option.kind==='alongGable')?{wall:selection.wall||'left'}:{}),...(option.dowels?{dowel:option.dowels.includes(selection.dowel)?selection.dowel:18}:{})});
 }
 const freeCodes=catalog.rules.freeOne||catalog.promo?.freeOne||[],picked=elements.filter(e=>freeCodes.includes(e.code));
 const winner=picked.find(e=>e.code===catalog.rules.freeWinner)||picked[0];if(winner)winner.free=true;
 if(shed.style==='style-gable-dormer'){
  if(catalog.rules.dormerNotFor.includes(shed.length))throw new Error('A dormer is not offered for this shed length.');
  const dormer=catalog.options.find(o=>o.kind==='dormer'&&o.forLength?.includes(shed.length));if(!dormer)throw new Error('No catalog dormer matches this length.');
  add(dormer.code,{id:'dormer',wall:'front',x:shed.length*6,y:0});
 }
 return {format:'cfs-designer-v1',designId:meta.designId||null,revision:meta.revision||1,mode,context:{quoteId:null,customerId:null,ownerToken:null,...meta.context},catalogVersion:catalog.version,startedAt:meta.startedAt||Date.now(),submittedAt:meta.submittedAt||null,website:meta.website||'',customer:meta.customer||{},uses:meta.uses||[],usesOther:meta.usesOther||'',source:meta.source||{code:'',other:'',referredBy:''},shed:actualShed,colors:structuredClone(colors),elements,images:meta.images||[],tracking:meta.tracking||{}};
}
