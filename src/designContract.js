const sameColor=(a,b)=>Boolean(a&&b&&(a.code&&b.code?a.code===b.code:a.name?.toLowerCase()===b.name?.toLowerCase()));
export const visibleOptions=(catalog,mode='customer')=>catalog.options.filter(o=>mode==='owner'||!o.ownerOnly);
export const optionByCode=(catalog,code)=>catalog.options.find(o=>o.code===code);
export function foundationCode(width,slab=false){return slab?'foundation-slab':width===16?'foundation-skids':'foundation-tuffblock';}
export function pricePiece(option,qty,shed,free=false){
 const unit=option.price?.unit,rate=option.price?.amount;
 let regularAmount=null;
 if(unit==='included')regularAmount=0;
 else if(typeof rate==='number'){
  if(unit==='each')regularAmount=rate*qty;
  if(unit==='per floor sq ft')regularAmount=rate*shed.width*shed.length*qty;
  if(unit==='per floor sq ft (min 100)')regularAmount=rate*Math.max(100,shed.width*shed.length)*qty;
  if(unit==='per linear ft'&&option.kind==='alongGable')regularAmount=rate*shed.width*qty;
 }
 return {code:option.code,label:option.label,qty,amount:free?0:regularAmount,free,included:unit==='included',...(free?{regularAmount}:{})};
}
export function resolvedDoorColor(catalog,state,placed,option){
 const factory=state.shed.siding.includes('vinyl')||/residential|french|rollup|overhead/.test(option.code);
 return placed.color||(factory?catalog.colors.trim.find(c=>c.standard)||state.colors.trim:state.colors.siding);
}
export function buildDesign(catalog,state,meta={}){
 const {shed,colors}=state,mode=meta.mode||'customer',elements=[];
 const size=catalog.sizes.find(s=>s.code===shed.size);
 if(!size||size.width!==shed.width||size.length!==shed.length)throw new Error('Choose a catalog shed size.');
 const style=catalog.styles.find(s=>s.code===shed.style);
 if(!style||style.available===false)throw new Error('This shed style is not available in the catalog.');
 const allowed=new Set(visibleOptions(catalog,mode).map(o=>o.code));
 function add(code,fields={}){
  const item=optionByCode(catalog,code);if(!item)throw new Error('Catalog code not found: '+code);
  if(!allowed.has(code))throw new Error('This option is only available in owner mode: '+item.label);
  const entry={id:fields.id||code,code,label:item.label,qty:1,...fields};elements.push(entry);return entry;
 }
 const actualShed={...shed,foundation:foundationCode(shed.width,shed.foundation==='foundation-slab')};
 for(const code of [shed.wallHeight,shed.siding,shed.roofing,actualShed.foundation])if(!allowed.has(code))throw new Error('Unavailable catalog selection: '+code);
 const doors=[];
 for(const placed of state.placed||[]){
  const option=optionByCode(catalog,placed.code);if(!option||!['door','window'].includes(option.kind))throw new Error('Unknown opening code.');
  const piece=add(option.code,{id:placed.id,qty:1,wall:placed.wall,x:placed.x,y:placed.y||0,width:option.width,height:option.height});
  if(option.kind==='door'){
   const doorColor=resolvedDoorColor(catalog,state,placed,option);
   if(!sameColor(doorColor,colors.siding))piece.color={...doorColor};
   doors.push({placed,option,color:doorColor});
   if(option.ramp&&placed.rampRemoved!==true&&catalog.rules.rampDefault!==false)add(option.ramp,{id:'ramp-'+placed.id,wall:placed.wall,for:placed.id,x:placed.x,y:0,auto:true});
  }
 }
 for(const selection of state.extras||[]){
  if(!selection.qty)continue;
  const option=optionByCode(catalog,selection.code);if(!option)throw new Error('Unknown extra code.');
  if(['auto','ramp','dormer','door','window','wallHeight','siding','roofing','foundation'].includes(option.kind))continue;
  add(selection.code,{id:selection.id||selection.code,qty:option.kind==='upgrade'&&option.perWindow?(state.placed||[]).filter(p=>optionByCode(catalog,p.code)?.kind==='window').length:selection.qty,...(option.kind==='alongGable'?{wall:selection.wall||'left'}:{})});
 }
 const freeCodes=catalog.rules.freeOne||catalog.promo?.freeOne||[],picked=elements.filter(e=>freeCodes.includes(e.code));
 const winner=picked.find(e=>e.code===catalog.rules.freeWinner)||picked[0];if(winner)winner.free=true;
 const vinyl=shed.siding.includes('vinyl');
 const trimStandard=catalog.colors.trim.some(c=>c.standard&&sameColor(c,colors.trim));
 const paintedTrim=!vinyl&&!trimStandard;
 if(!vinyl&&colors.siding.name!=='Unpainted'&&!colors.siding.unpainted)add('paint-siding',{id:'paint',auto:true});
 if(paintedTrim)add('paint-trim',{id:'paint-trim',auto:true});
 const paintDoors=doors.filter(d=>vinyl?!['White','Snowscape'].includes(d.color.name):!sameColor(d.color,colors.siding)&&!(paintedTrim&&sameColor(d.color,colors.trim)));
 if(paintDoors.length)add('paint-door',{id:'paint-doors',qty:paintDoors.length,auto:true});
 if(!(mode==='owner'&&state.removeAnchors))add('anchors-hurricane',{id:'anchors',qty:Math.max(4,Math.round(shed.length/5)*2),auto:true});
 if(shed.style==='style-gable-dormer'){
  if(catalog.rules.dormerNotFor.includes(shed.length))throw new Error('A dormer is not offered for this shed length.');
  const dormer=catalog.options.find(o=>o.kind==='dormer'&&o.forLength?.includes(shed.length));if(!dormer)throw new Error('No catalog dormer matches this length.');
  add(dormer.code,{id:'dormer',wall:'front',x:shed.length*6,y:0});
 }
 const lines=[pricePiece(size,1,shed),...[shed.wallHeight,shed.siding,shed.roofing,actualShed.foundation].map(code=>pricePiece(optionByCode(catalog,code),1,shed)),...elements.map(e=>pricePiece(optionByCode(catalog,e.code),e.qty,shed,Boolean(e.free)))];
 const pending=lines.some(l=>l.amount===null),total=Math.round(lines.reduce((sum,l)=>sum+(l.amount||0),0));
 return {format:'cfs-designer-v1',designId:meta.designId||null,revision:meta.revision||1,mode,context:{quoteId:null,customerId:null,ownerToken:null,...meta.context},catalogVersion:catalog.version,startedAt:meta.startedAt||Date.now(),submittedAt:meta.submittedAt||null,website:meta.website||'',customer:meta.customer||{},uses:meta.uses||[],usesOther:meta.usesOther||'',source:meta.source||{code:'',other:'',referredBy:''},shed:actualShed,colors:structuredClone(colors),elements,estimate:{total,lines,...(pending?{pending:true}:{})},images:meta.images||[],tracking:meta.tracking||{}};
}
