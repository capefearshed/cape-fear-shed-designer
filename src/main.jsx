import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, ContactShadows} from '@react-three/drei';
import {Download, Plus, Trash2, MoveHorizontal, Check, Eye, DoorClosed, PanelsTopLeft, AppWindow, ChevronDown} from 'lucide-react';
import './styles.css';
import Shed from './Shed.jsx';
import {constructionSpecs} from './constructionSpecs.js';

const sizes=[[8,10],[8,12],[10,12],[10,14],[10,16],[10,18],[10,20],[12,12],[12,14],[12,16],[12,18],[12,20],[14,16],[16,20]];
const swatches=[{name:'Outerbanks · SW 7534',hex:constructionSpecs.siding.lpPanel.defaultColor.hex},{name:'Sea Salt',hex:'#CDD2CA'},{name:'Acacia Haze',hex:'#969C92'},{name:'Basil',hex:'#626E60'},{name:'Aquastone',hex:'#89C6B7'},{name:'Silken Peacock',hex:'#427584'},{name:'Snowbound',hex:'#EDEAE5'}];
const DEFAULT=[{id:'door-1',kind:'door',type:'double',wall:'front',x:72,width:48,height:73.5,y:0,ramp:false},{id:'window-1',kind:'window',type:'standard',wall:'right',x:60,width:19.75,height:28.5,y:40}];
const DOOR_OPTIONS=[{id:'single32',label:'32 in single door',width:32,type:'single'},{id:'single36',label:'36 in single door',width:36,type:'single'},{id:'double48',label:'4 ft double door',width:48,type:'double'},{id:'double60',label:'5 ft double door',width:60,type:'double'}];
const OPTIONS={door:{width:48,height:73.5,y:0,type:'double',transom:false,ramp:false},window:{width:19.75,height:28.5,y:40,type:'standard'}};
const WALLS=['front','back','left','right'];
const wallSpan=(wall,w,l)=>(wall==='front'||wall==='back'?l:w)*12;
const framedWidth=o=>o.width+(o.kind==='door'?9:(o.shutters?23:5));
const boundary=(o,w,l)=>({min:8+framedWidth(o)/2,max:wallSpan(o.wall,w,l)-8-framedWidth(o)/2});
function nearbyPositions(item,list,w,l){
 const {min,max}=boundary(item,w,l);
 if(min>max)return [];
 return Array.from({length:Math.floor(max-min)+1},(_,i)=>min+i)
  .filter(x=>validOpening({...item,x},list,w,l));
}
function validOpening(item,list,w,l){
 const {min,max}=boundary(item,w,l);
 if(item.x<min||item.x>max)return false;
 return list.every(o=>o.id===item.id||o.wall!==item.wall||Math.abs(o.x-item.x)>=(framedWidth(o)+framedWidth(item))/2+4);
}
// Lay out openings in their chosen sequence. Equal clear gaps are shared
// between corner margins and every pair of opening trim assemblies.
function distributeWall(items,wall,w,l){
 const length=wallSpan(wall,w,l),margin=8,gap=4;
 const total=items.reduce((n,o)=>n+framedWidth(o),0);
 const free=length-2*margin-total;
 if(free<gap*Math.max(0,items.length-1)-.001)return null;
 const even=free/(items.length+1);
 let cursor=margin+even;
 return items.map(o=>{const x=cursor+framedWidth(o)/2;cursor+=framedWidth(o)+even;return {...o,x};});
}
function distributeAll(items,w,l){
 let next=[...items];
 for(const wall of WALLS){
  const wallItems=next.filter(o=>o.wall===wall);
  const laid=distributeWall(wallItems,wall,w,l);
  if(!laid)return null;
  const values=new Map(laid.map(o=>[o.id,o]));
  next=next.map(o=>values.get(o.id)||o);
 }
 return next;
}
// Compact visual of the real frame layout, not a separate photographic asset.
function DoorThumbnail({width=48,double=false,transom=false,lights=3}){
 // Clean exterior elevation, drawn in inches. Hardware stays at OUTER hinge
 // edges, not at the middle seam; transoms sit within the upper door panel.
 const h=73.5,t=3.5,gap=double?.4375:0,leaf=width/(double?2:1);
 const total=width+gap;
 return <svg className="door-thumbnail" viewBox={`-7 -8 ${total+14} ${h+16}`} role="img" aria-label={double?'Double door'+(transom?' with transom windows':''):'Single door'+(transom?' with transom window':'')}>
  <rect x="-7" y="-8" width={total+14} height={h+16} fill="#87968b"/>
  <rect x="-3.5" y="-3.5" width={total+7} height={h+3.5} fill="#eeeae2" stroke="#6b766e" strokeWidth=".55"/>
  {Array.from({length:double?2:1},(_,i)=>{
   const x=i*(leaf+gap),inner=leaf-2*t;
   const hingeX=double?(i===0?x:x+leaf):x+leaf;
   const hingeDir=double?(i===0?1:-1):-1;
   return <g key={i}>
    <rect x={x} y="0" width={leaf} height={h} fill="#b7a48b"/>
    {Array.from({length:Math.floor(leaf/8)},(_,j)=><path key={j} d={`M${x+8*(j+1)} 0V${h}`} stroke="#866e54" strokeWidth=".26" opacity=".30"/>)}
    {transom&&<><rect x={x+t} y={t} width={inner} height="10.25" fill="#92b1ba" stroke="#637b80" strokeWidth=".3"/>
     {Array.from({length:lights-1},(_,j)=><line key={j} x1={x+t+inner*(j+1)/lights} x2={x+t+inner*(j+1)/lights} y1={t} y2={t+10.25} stroke="#e8e8e2" strokeWidth=".5"/>)}
     <rect x={x+t} y="13.75" width={inner} height={t} fill="#efede7"/></>}
    <rect x={x} y="0" width={t} height={h} fill="#eeeae2"/>
    <rect x={x+leaf-t} y="0" width={t} height={h} fill="#eeeae2"/>
    {[0,(h-t)/2,h-t].map((y,j)=><rect key={j} x={x+t} y={y} width={inner} height={t} fill="#eeeae2"/>)}
    {[6,h/2,h-6].map((y,j)=><g key={j}>
     {/* Black tee hinge: short upright rectangular plate at casing, pin on
         outside edge, and a tapered strap extending into the door leaf. */}
     <rect x={hingeX-1.05} y={y-2.1} width="2.1" height="4.2" rx=".28" fill="#202526"/>
     <rect x={hingeX-.36} y={y-1.4} width=".72" height="2.8" rx=".32" fill="#111718"/>
     <path d={`M${hingeX} ${y-1.02} L${hingeX+hingeDir*1.2} ${y-.86} L${hingeX+hingeDir*5.3} ${y-.39} Q${hingeX+hingeDir*7} ${y} ${hingeX+hingeDir*5.3} ${y+.39} L${hingeX+hingeDir*1.2} ${y+.86} L${hingeX} ${y+1.02} Z`} fill="#202526"/>
     {[2.1,4.1].map(d=><circle key={d} cx={hingeX+hingeDir*d} cy={y} r=".22" fill="#646c69"/>)}
    </g>)}
   </g>;
  })}
  <g transform={`translate(${double?leaf+gap/2:t/2},${h/2})`}>
   <circle r="1.35" fill="#222728"/><path d="M-2 0H2" stroke="#222728" strokeWidth="1.1" strokeLinecap="round"/>
  </g>
 </svg>;
}
function App(){
 const [size,setSize]=useState('10x12');const [width,length]=size.split('x').map(Number);
 const [height,setHeight]=useState(6.5);const [pitch,setPitch]=useState(5);const [roofStyle,setRoofStyle]=useState('gable');const [dormer,setDormer]=useState(false);
 const [sidingType,setSidingType]=useState('lp-panel');
 const [paint,setPaint]=useState(constructionSpecs.siding.lpPanel.defaultColor.hex);const [trim,setTrim]=useState('#EDEAE5');const [roof,setRoof]=useState('charcoal');
 const [expanded,setExpanded]=useState(null);
 const [accessories,setAccessories]=useState({loft:false,workbench:false,surfRack:false,hurricaneAnchors:false});
 const [openings,setOpenings]=useState(DEFAULT);const [selected,setSelected]=useState('door-1');const [tab,setTab]=useState('size');const [notice,setNotice]=useState('');
 const active=openings.find(o=>o.id===selected);
 const doorLabel=o=>`${o.width===60?'5 ft':o.width===48?'4 ft':o.width+' in'} ${o.type==='single'?'single':'double'} door${o.transom?' + transom':''}`;
 function commitLayout(candidate,successId){
  const next=distributeAll(candidate,width,length);
  if(!next){setNotice('Not enough room for this combination on that wall. Try another wall or reduce the quantity.');return false;}
  setOpenings(next);
  if(successId)setSelected(successId);
  setNotice('');
  return true;
 }
 function editOpening(id,patch){
  commitLayout(openings.map(o=>o.id===id?{...o,...patch}:o));
 }
 function setDoorStyle(id,value){
  const [code,variant]=value.split(':');const choice=DOOR_OPTIONS.find(o=>o.id===code);
  if(choice)editOpening(id,{width:choice.width,type:choice.type,transom:variant==='transom'});
 }
 function addToWall(wall,kind){
  const id=kind+'-'+Date.now()+'-'+Math.floor(Math.random()*10000);
  const item={id,kind,wall,x:0,...OPTIONS[kind]};
  commitLayout([...openings,item],id);
 }
 function removeFromWall(wall,kind){
  const candidates=openings.filter(o=>o.wall===wall&&o.kind===kind);
  if(!candidates.length)return;
  const removed=candidates[candidates.length-1];
  const next=openings.filter(o=>o.id!==removed.id);
  if(commitLayout(next))if(selected===removed.id)setSelected(next.find(o=>o.wall===wall)?.id||null);
 }
 function removeSelected(){
  if(!active)return;
  const rest=openings.filter(o=>o.id!==active.id);
  if(commitLayout(rest))setSelected(rest.find(o=>o.wall===active.wall)?.id||null);
 }
 function reorder(id,direction){
  const item=openings.find(o=>o.id===id);if(!item)return;
  const same=openings.filter(o=>o.wall===item.wall);
  const at=same.findIndex(o=>o.id===id),to=at+direction;
  if(to<0||to>=same.length)return;
  const a=same[at],b=same[to];
  const all=[...openings],ia=all.findIndex(o=>o.id===a.id),ib=all.findIndex(o=>o.id===b.id);
  [all[ia],all[ib]]=[all[ib],all[ia]];
  commitLayout(all,id);
 }
 function changeDimension(axis,value){
  const options=[...new Set(sizes.filter(pair=>pair[axis===0?1:0]===(axis===0?length:width)).map(pair=>pair[axis]))];
  const target=Number(value);
  if(!sizes.some(pair=>pair[axis]===target&&pair[axis===0?1:0]===(axis===0?length:width))){
   const possible=sizes.filter(pair=>pair[axis]===target);
   if(!possible.length)return;
   const old=axis===0?length:width;
   const preferred=possible.reduce((a,b)=>Math.abs(b[axis===0?1:0]-old)<Math.abs(a[axis===0?1:0]-old)?b:a);
   changeSize(preferred.join('x'));return;
  }
  changeSize(axis===0?target+'x'+length:width+'x'+target);
 }
 function changeSize(v){
  const [nw,nl]=v.split('x').map(Number);
  const adjusted=distributeAll(openings,nw,nl);
  if(!adjusted){setNotice('The existing openings do not fit that size. Remove or change some openings first.');return}
  setSize(v);if(nw>12)setRoofStyle('gable');if(nw!==10&&nw!==12)setDormer(false);setOpenings(adjusted);setNotice('');
 }
 function download(){const data={format:'cfs-designer-v1',schemaVersion:1,designId:'local-preview',shed:{model:roofStyle,width,length,wallHeight:height,roofPitch:roofStyle==='lean-to'?10:dormer?7:pitch,roofPitchUnits:roofStyle==='lean-to'?'degrees':'rise-per-12',dormer:dormer&&(width===10||width===12)?{widthFt:(length>=18?10:length>=14?8:6),roofPitch:'2/12',windows:Array.from({length:length>=14?3:2},()=>({widthIn:length>=18?29:23,heightIn:10}))}:null,overhangInches:sidingType==='lp-panel'?4:6,siding:{type:sidingType,trimThicknessIn:sidingType==='lp-panel'?.75:1},roofing:{type:'shingles'}},colors:{siding:{hex:paint},trim:{hex:trim},roof:{name:roof}},openings,accessories:Object.entries(accessories).filter(([,enabled])=>enabled).map(([id])=>({id}))};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='cape-fear-shed-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
 return <div className="app"><header className="header"><div className="brand"><img className="brand-logo" src="https://app.capefearshed.com/brand/logo/logo-transparent.png" alt="Cape Fear Shed — Custom built on site"/></div></header>
 <main className="layout"><section className="stage"><div className="canvas-box"><span className="size-chip viewer-size">{width}' x {length}'</span><Canvas shadows dpr={[1,1.65]} camera={{position:[16+Math.max(0,length-12)*.58,11.5+Math.max(0,length-12)*.22,16+Math.max(0,length-12)*.58],fov:39,near:.1,far:120}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>gl.setClearColor('#F3F4F1',1)}><ambientLight intensity={.75}/><hemisphereLight args={['#eef4ff','#a5a18d',1.1]}/><directionalLight position={[9,20,12]} intensity={2.7} castShadow={sidingType==='lp-panel'} shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={.035}/><directionalLight position={[-12,8,-6]} intensity={.65}/><group rotation={[0,-.2,0]}><Shed w={width} l={length} pitch={dormer&&roofStyle==='gable'?7:pitch} roofStyle={roofStyle} dormer={dormer&&(width===10||width===12)&&roofStyle==='gable'} wallHeight={height} paint={paint} trim={trim} roofColor={roof} sidingType={sidingType} openings={openings} selected={selected} setSelected={setSelected}/></group><ContactShadows position={[0,-.375,0]} opacity={.45} scale={35} blur={2.6} far={14}/><OrbitControls makeDefault target={[0,3.7,0]} minDistance={12} maxDistance={48} maxPolarAngle={Math.PI/2.03} enablePan={false}/></Canvas><div className="canvas-label"><Eye size={15}/> Interactive 3D model</div></div></section>
 <aside className="sidebar"><div className="panel-top"><span className="eyebrow">Customize your build</span><h2>Design options</h2></div><div className="tabs">{[['size','Size'],['style','Style'],['finishes','Exterior finishes'],['openings','Doors & windows'],['accessories','Accessories']].map(([id,label])=><button key={id} className={tab===id?'tab active':'tab'} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="panel-body">
 {tab==='size'&&<><h3>Choose your shed size</h3><div className="pair"><div><label>Width</label><select value={width} onChange={e=>changeDimension(0,e.target.value)}>{[...new Set(sizes.map(pair=>pair[0]))].map(n=><option key={n} value={n}>{n}' wide</option>)}</select></div><div><label>Length</label><select value={length} onChange={e=>changeDimension(1,e.target.value)}>{[...new Set(sizes.filter(pair=>pair[0]===width).map(pair=>pair[1]))].map(n=><option key={n} value={n}>{n}' long</option>)}</select></div></div><p className="help">Available lengths adjust to the selected width. Your 3D shed updates as you choose.</p><button className="primary step-next" onClick={()=>setTab('style')}>Next: Shed style</button></>}
 {tab==='style'&&<><h3>Choose your shed style</h3><div className="choice-grid">{[{id:'gable',name:'Gable',description:'Classic peaked roof'},{id:'lean-to',name:'Lean-to',description:'Single-slope roof',disabled:width>12},{id:'dormer',name:'Dormer',description:'Gable roof with transom dormer',disabled:width!==10&&width!==12}].map(choice=><button key={choice.id} disabled={choice.disabled} className={'choice-tile '+((choice.id==='dormer'?dormer:roofStyle===choice.id&&!dormer)?'picked':'')} onClick={()=>{setRoofStyle(choice.id==='lean-to'?'lean-to':'gable');setDormer(choice.id==='dormer')}}><strong>{(choice.id==='dormer'?dormer:roofStyle===choice.id&&!dormer)?'✓ ':''}{choice.name}</strong><small>{choice.description}</small></button>)}</div><div className="pair"><div><label>Wall height</label><select value={height} onChange={e=>setHeight(Number(e.target.value))}><option value="6.5">6'6" Standard</option><option value="7">7'</option><option value="8">8'</option></select></div><div><label>Roof pitch</label>{roofStyle==='lean-to'?<div className="tip">10° fixed</div>:dormer?<div className="tip">7/12 main · 2/12 dormer</div>:<select value={pitch} onChange={e=>setPitch(Number(e.target.value))}>{[5,6,7,8].map(n=><option key={n} value={n}>{n}/12</option>)}</select>}</div></div><button className="primary step-next" onClick={()=>setTab('finishes')}>Next: Exterior finishes</button></>}
 {tab==='finishes'&&<><h3>Exterior finishes</h3><label>Siding type</label><select value={sidingType} onChange={e=>setSidingType(e.target.value)}><option value="lp-panel">LP SmartSide vertical panel · Standard</option><option value="lap">Lap siding · 6-inch reveal</option><option value="vinyl-straight">Vinyl · Straight lap</option><option value="vinyl-dutch">Vinyl · Dutch lap</option><option value="board-batten">Board and batten</option></select><p className="help">{sidingType==='lp-panel'?'4-inch roof overhang · ¾-inch trim':'6-inch roof overhang · true 1-inch trim'}</p><label>Siding color</label><div className="swatches">{swatches.map(c=><button title={c.name} aria-label={`Siding ${c.name}`} key={c.name} className={paint===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setPaint(c.hex)}>{paint===c.hex&&<Check size={16}/>}</button>)}</div><p className="value-name">{swatches.find(s=>s.hex===paint)?.name}</p><p className="swatch-disclaimer">Screen colors aren\u0027t exact. Before you decide, grab real swatches from Lowe\u0027s or Sherwin-Williams and hold them up to your house in sun and shade. You can pick any color — these are just to help you picture it.</p><label>Trim color</label><div className="swatches">{[{name:'Snowbound',hex:'#EDEAE5'},{name:'Tricorn Black',hex:'#2F2F30'},{name:'Extra White',hex:'#EEEFEA'}].map(c=><button key={c.name} title={c.name} className={trim===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setTrim(c.hex)}>{trim===c.hex&&<Check size={16}/>}</button>)}</div><label>Shingle tone</label><select value={roof} onChange={e=>setRoof(e.target.value)}><option value="charcoal">Onyx Black</option><option value="gray">Estate Gray (approx.)</option><option value="driftwood">Driftwood (approx.)</option></select></>}
 {tab==='openings'&&<><h3>Design each wall</h3><p className="help">Add doors and windows to each wall. The designer spaces them evenly automatically. Use the arrows to change their left-to-right order.</p>
 <div className="wall-sections">{WALLS.map(wall=>{
  const items=openings.filter(o=>o.wall===wall);
  return <section key={wall} className="wall-section">
   <div className="wall-section-head"><strong>{wall[0].toUpperCase()+wall.slice(1)} wall</strong><span>{wallSpan(wall,width,length)/12} ft</span></div>
   <div className="wall-add-actions">
    {['door','window'].map(kind=><div key={kind} className="wall-quantity"><span>{kind==='door'?'Doors':'Windows'}</span><div><button aria-label={`Remove ${kind} from ${wall} wall`} disabled={!items.some(o=>o.kind===kind)} onClick={()=>removeFromWall(wall,kind)}>−</button><b>{items.filter(o=>o.kind===kind).length}</b><button aria-label={`Add ${kind} to ${wall} wall`} onClick={()=>addToWall(wall,kind)}>+</button></div></div>)}
   </div>
   {items.length>0?<div className="wall-items">{items.map((o,i)=><div key={o.id} className={selected===o.id?'wall-item active':'wall-item'}>
    <button className="wall-item-name" onClick={()=>{setSelected(o.id);setExpanded(expanded===o.id?null:o.id)}}>{o.kind==='door'?(o.transom?<PanelsTopLeft size={17}/>:<DoorClosed size={17}/>):<AppWindow size={17}/>}<span>{o.kind==='door'?doorLabel(o):o.shutters?'Window + shutters':'Standard window'}</span><ChevronDown size={15} className={expanded===o.id?'chevron expanded':'chevron'}/></button>
    <button aria-label="Move opening left" disabled={i===0} onClick={()=>reorder(o.id,-1)}>←</button>
    <button aria-label="Move opening right" disabled={i===items.length-1} onClick={()=>reorder(o.id,1)}>→</button>
   {expanded===o.id&&<div className="wall-inline-options">{o.kind==='door'?<>
 <label>Door style</label><select aria-label="Door style" value={DOOR_OPTIONS.find(d=>d.width===o.width&&d.type===o.type)?.id+':'+(o.transom?'transom':'standard')} onChange={e=>setDoorStyle(o.id,e.target.value)}>
 {[...DOOR_OPTIONS.map(d=>({value:d.id+':standard',label:d.label})),...DOOR_OPTIONS.filter(d=>d.width!==32).map(d=>({value:d.id+':transom',label:d.label+' with transom window'}))].map(v=><option key={v.value} value={v.value}>{v.label}</option>)}
 </select>
 <div className="door-preview-choices">
  {[false,...(o.width===32?[]:[true])].map(withTransom=><button type="button" key={String(withTransom)} className={Boolean(o.transom)===withTransom?'door-preview-choice picked':'door-preview-choice'} aria-pressed={Boolean(o.transom)===withTransom} onClick={()=>editOpening(o.id,{transom:withTransom})}>
   <DoorThumbnail width={o.width} double={o.type==='double'} transom={withTransom} lights={o.type==='single'?5:o.width===60?4:3}/>
   <span>{withTransom?'With transom':'Standard'}</span>
  </button>)}
 <label className="shutter-toggle ramp-toggle"><input type="checkbox" checked={Boolean(o.ramp)} onChange={e=>editOpening(o.id,{ramp:e.target.checked})}/> Add a ramp for this door</label>
 </div></>:<label className="shutter-toggle"><input type="checkbox" checked={Boolean(o.shutters)} onChange={e=>editOpening(o.id,{shutters:e.target.checked})}/> Add 9-inch shutters in place of side trim</label>}</div>}</div>)}</div>:<p className="wall-empty">No openings on this wall</p>}
  </section>;
 })}</div>
 {active&&<div className="edit"><div className="edit-title"><b>Edit selected {active.kind}</b><button className="delete" title="Remove opening" onClick={removeSelected}><Trash2 size={16}/></button></div>
 <p className="help">{active.wall[0].toUpperCase()+active.wall.slice(1)} wall · {Math.round(active.x)} inches from wall end</p>
 {active.kind==='door'&&<><label>Door size</label><select value={active.type+active.width} onChange={e=>{const option=DOOR_OPTIONS.find(d=>d.type+d.width===e.target.value);if(option)editOpening(active.id,{type:option.type,width:option.width,transom:option.width===32?false:Boolean(active.transom)})}}>{DOOR_OPTIONS.map(d=><option key={d.id} value={d.type+d.width}>{d.label}</option>)}</select>
 <label>Transom window</label><select value={active.transom?'yes':'no'} onChange={e=>editOpening(active.id,{transom:e.target.value==='yes'})}><option value="no">No transom</option>{active.width!==32&&<option value="yes">Add transom window</option>}</select></>}
 {active.kind==='door'&&<label className="shutter-toggle ramp-edit-toggle"><input type="checkbox" checked={Boolean(active.ramp)} onChange={e=>editOpening(active.id,{ramp:e.target.checked})}/> Include a ramp for this door</label>}
 <label>Move to another wall</label><select value={active.wall} onChange={e=>editOpening(active.id,{wall:e.target.value})}>{WALLS.map(w=><option key={w} value={w}>{w[0].toUpperCase()+w.slice(1)}</option>)}</select>
 <p className="placement-note">Automatic spacing keeps the clear gaps equal, including the space at each end. Use the arrows above to arrange a door to one side of two windows.</p>
 </div>}
 </>}
 {tab==='accessories'&&<><h3>Accessories and upgrades</h3><p className="help">Choose what you'd like included. These options are saved in your exported design; 3D accessory placement comes next.</p><div className="accessory-list">{[{id:'loft',name:'Storage loft'},{id:'workbench',name:'Workbench'},{id:'surfRack',name:'Surfboard rack'},{id:'hurricaneAnchors',name:'Hurricane anchors'}].map(item=><label key={item.id} className="accessory-choice"><input type="checkbox" checked={accessories[item.id]} onChange={e=>setAccessories(prev=>({...prev,[item.id]:e.target.checked}))}/><span>{item.name}</span></label>)}</div></>}
 {notice&&<div role="status" className="notice">{notice}</div>}</div><div className="panel-bottom"><button className="primary" onClick={download}><Download size={18}/> Export design JSON</button><p>Test mode only. No customer submissions or quotes are sent.</p></div></aside></main></div>
}
createRoot(document.getElementById('root')).render(<App/>);
