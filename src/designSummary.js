// Presentation only: never replace or mutate design.elements with these rows.
const walls=['front','left','back','right'];
const title=value=>value[0].toUpperCase()+value.slice(1);
const colorKey=color=>(color?.name||color?.code||'').toLowerCase();
function plural(label){
 return label.replace(/\b(Window|Door|Ramp|Loft|Workbench|Rack|Box|Overhang|Dormer)\b/g,word=>({Box:'Boxes',Workbench:'Workbenches'}[word]||word+'s'));
}
export function designSummary(catalog,design){
 if(!design)return [];
 const option=code=>catalog.options.find(o=>o.code===code);
 const {shed,colors}=design;
 const rows=[{id:'size-style',label:`${shed.width}′ × ${shed.length}′ · ${catalog.styles.find(o=>o.code===shed.style)?.label||''}`}];
 for(const code of [shed.wallHeight,shed.siding,shed.roofing])if(option(code))rows.push({id:code,label:option(code).label});
 for(const key of ['siding','trim','roof'])if(colors[key]?.name)rows.push({id:'color-'+key,label:`${title(key)}: ${colors[key].name}`});
 const groups=new Map();
 function add(key,label,qty,wall,rank){
  if(!(qty>0))return;
  if(!groups.has(key))groups.set(key,{id:key,label,qty:0,locations:{},rank});
  const group=groups.get(key);group.qty+=qty;
  if(wall)group.locations[wall]=(group.locations[wall]||0)+qty;
 }
 for(const e of design.elements){
  const o=option(e.code);if(!o||o.kind==='auto'||e.code==='anchors-hurricane')continue;
  if(/^(none|no ramp|empty wall)$/i.test(e.label?.trim()))continue;
  let label=e.label||o.label,key=e.code,rank=2;
  if(o.kind==='window'){
   const frame=e.windowFrameColor||colors.window||{name:'White'};
   label=`${e.width||o.width}x${e.height||o.height} ${frame.name} Window`;
   key=`window:${e.width||o.width}:${e.height||o.height}:${colorKey(frame)}`;rank=1;
   if(e.shutters)add('window-shutters','Shutters',e.qty,e.wall,2);
   if(e.flowerBox)add('window-flower-box','Flower Box',e.qty,e.wall,2);
  }else if(o.kind==='door'){
   const paint=e.color||colors.siding;
   label+=paint?.name?` · ${paint.name}`:'';
   key+=`:${colorKey(paint)}:${colorKey(e.windowFrameColor)}`;rank=0;
   if(e.windowFrameColor?.name)label+=` · ${e.windowFrameColor.name} Transom Frame`;
  }
  if(e.dowel){key+=`:dowel-${e.dowel}`;label+=` · ${e.dowel}″ Dowels`;}
  add(key,label,e.qty,e.wall,rank);
 }
 const grouped=[...groups.values()].sort((a,b)=>a.rank-b.rank).map(g=>{
  const locations=walls.filter(w=>g.locations[w]);
  const repeated=locations.some(w=>g.locations[w]>1);
  return {id:g.id,label:(g.qty>1?plural(g.label):g.label)+(g.qty>1?` – x${g.qty}`:''),detail:locations.map(w=>repeated?`${g.locations[w]} on ${title(w)}`:title(w)).join(', ')};
 });
 rows.push(...grouped);
 if(option(shed.foundation))rows.push({id:'foundation',label:option(shed.foundation).label});
 // Anchors are rendered separately, last, so Review can offer Add / Remove.
 return rows;
}
