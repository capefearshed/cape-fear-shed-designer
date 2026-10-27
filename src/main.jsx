import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, ContactShadows} from '@react-three/drei';
import {Download, Plus, Trash2, MoveHorizontal, Check, Eye} from 'lucide-react';
import './styles.css';
import Shed from './Shed.jsx';
import {constructionSpecs} from './constructionSpecs.js';

const sizes=[[8,10],[8,12],[10,12],[10,16],[10,20],[12,12],[12,16],[12,20],[14,16],[16,20]];
const swatches=[{name:'Outerbanks · SW 7534',hex:constructionSpecs.siding.lpPanel.defaultColor.hex},{name:'Sea Salt',hex:'#CDD2CA'},{name:'Acacia Haze',hex:'#969C92'},{name:'Basil',hex:'#626E60'},{name:'Aquastone',hex:'#89C6B7'},{name:'Silken Peacock',hex:'#427584'},{name:'Snowbound',hex:'#EDEAE5'}];
const DEFAULT=[{id:'door-1',kind:'door',type:'double',wall:'front',x:72,width:48,height:73.5,y:0},{id:'window-1',kind:'window',type:'standard',wall:'right',x:60,width:19.75,height:28.5,y:40}];
const DOOR_OPTIONS=[{id:'double48',label:'4 ft double door',width:48,type:'double'},{id:'double60',label:'5 ft double door',width:60,type:'double'},{id:'single36',label:'36 in single door',width:36,type:'single'},{id:'single32',label:'32 in single door',width:32,type:'single'}];
const OPTIONS={door:{width:48,height:73.5,y:0,type:'double',transom:false},window:{width:19.75,height:28.5,y:40,type:'standard'}};
const WALLS=['front','back','left','right'];
const wallSpan=(wall,w,l)=>(wall==='front'||wall==='back'?l:w)*12;
const framedWidth=o=>o.width+(o.kind==='door'?9:5);
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
function App(){
 const [size,setSize]=useState('10x12');const [width,length]=size.split('x').map(Number);
 const [height,setHeight]=useState(7);const [pitch,setPitch]=useState(5);
 const [paint,setPaint]=useState(constructionSpecs.siding.lpPanel.defaultColor.hex);const [trim,setTrim]=useState('#EDEAE5');const [roof,setRoof]=useState('charcoal');
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
 function changeSize(v){
  const [nw,nl]=v.split('x').map(Number);
  const adjusted=distributeAll(openings,nw,nl);
  if(!adjusted){setNotice('The existing openings do not fit that size. Remove or change some openings first.');return}
  setSize(v);setOpenings(adjusted);setNotice('');
 }
 function download(){const data={format:'cfs-designer-v1',schemaVersion:1,designId:'local-preview',shed:{model:'gable',width,length,wallHeight:height,roofPitch:pitch,overhangInches:4,siding:{type:'lp-panel'},roofing:{type:'shingles'}},colors:{siding:{hex:paint},trim:{hex:trim},roof:{name:roof}},openings,accessories:[]};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='cape-fear-shed-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
 return <div className="app"><header className="header"><div className="brand"><div className="mark">CF</div><div><strong>CAPE FEAR SHED</strong><small>DESIGN STUDIO • EARLY PROTOTYPE</small></div></div><span className="status"><span/> Live 3D preview</span></header>
 <main className="layout"><section className="stage"><div className="stage-head"><div><div className="eyebrow">YOUR SHED, YOUR WAY</div><h1>Make room for more.</h1><p>Drag to rotate • Pinch or scroll to zoom • Tap an opening to edit</p></div><span className="size-chip">{width}' × {length}'</span></div><div className="canvas-box"><Canvas shadows dpr={[1,1.65]} camera={{position:[19,13,19],fov:39,near:.1,far:120}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>gl.setClearColor('#e9efec',1)}><ambientLight intensity={.75}/><hemisphereLight args={['#eef4ff','#a5a18d',1.1]}/><directionalLight position={[9,20,12]} intensity={2.7} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={.035}/><directionalLight position={[-12,8,-6]} intensity={.65}/><group rotation={[0,-.2,0]}><Shed w={width} l={length} pitch={pitch} wallHeight={height} paint={paint} trim={trim} roofColor={roof} openings={openings} selected={selected} setSelected={setSelected}/></group><ContactShadows position={[0,-.375,0]} opacity={.45} scale={35} blur={2.6} far={14}/><OrbitControls makeDefault target={[0,3.7,0]} minDistance={12} maxDistance={48} maxPolarAngle={Math.PI/2.03} enablePan={false}/></Canvas><div className="canvas-label"><Eye size={15}/> Interactive 3D model</div></div><div className="stage-note">Prototype materials and components are simplified. Placement restrictions are conservative estimates and <b>not</b> structural approval.</div></section>
 <aside className="sidebar"><div className="panel-top"><span className="eyebrow">CUSTOMIZE YOUR BUILD</span><h2>Design options</h2></div><div className="tabs">{[['size','Size'],['finishes','Finishes'],['openings','Doors & windows']].map(([id,label])=><button key={id} className={tab===id?'tab active':'tab'} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="panel-body">
 {tab==='size'&&<><h3>Build the basics</h3><label>Dimensions</label><select value={size} onChange={e=>changeSize(e.target.value)}>{sizes.map(([a,b])=><option key={`${a}x${b}`} value={`${a}x${b}`}>{a}' × {b}'</option>)}</select><div className="pair"><div><label>Wall height</label><select value={height} onChange={e=>setHeight(Number(e.target.value))}><option value="6.5">6'6" Standard</option><option value="7">7'</option><option value="8">8'</option></select></div><div><label>Roof pitch</label><select value={pitch} onChange={e=>setPitch(Number(e.target.value))}>{[5,6,7,8].map(n=><option value={n} key={n}>{n}/12</option>)}</select></div></div><div className="tip"><Check size={16}/> Standard gable roof with 4-inch overhangs on all sides.</div></>}
 {tab==='finishes'&&<><h3>Exterior colors</h3><label>Siding color</label><div className="swatches">{swatches.map(c=><button title={c.name} aria-label={`Siding ${c.name}`} key={c.name} className={paint===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setPaint(c.hex)}>{paint===c.hex&&<Check size={16}/>}</button>)}</div><p className="value-name">{swatches.find(s=>s.hex===paint)?.name}</p><label>Trim color</label><div className="swatches">{[{name:'Snowbound',hex:'#EDEAE5'},{name:'Tricorn Black',hex:'#2F2F30'},{name:'Extra White',hex:'#EEEFEA'}].map(c=><button key={c.name} title={c.name} className={trim===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setTrim(c.hex)}>{trim===c.hex&&<Check size={16}/>}</button>)}</div><label>Shingle tone</label><select value={roof} onChange={e=>setRoof(e.target.value)}><option value="charcoal">Onyx Black</option><option value="gray">Estate Gray (approx.)</option><option value="driftwood">Driftwood (approx.)</option></select></>}
 {tab==='openings'&&<><h3>Design each wall</h3><p className="help">Add doors and windows to each wall. The designer spaces them evenly automatically. Use the arrows to change their left-to-right order.</p>
 <div className="wall-sections">{WALLS.map(wall=>{
  const items=openings.filter(o=>o.wall===wall);
  return <section key={wall} className="wall-section">
   <div className="wall-section-head"><strong>{wall[0].toUpperCase()+wall.slice(1)} wall</strong><span>{wallSpan(wall,width,length)/12} ft</span></div>
   <div className="wall-add-actions">
    {['door','window'].map(kind=><div key={kind} className="wall-quantity"><span>{kind==='door'?'Doors':'Windows'}</span><div><button aria-label={`Remove ${kind} from ${wall} wall`} disabled={!items.some(o=>o.kind===kind)} onClick={()=>removeFromWall(wall,kind)}>−</button><b>{items.filter(o=>o.kind===kind).length}</b><button aria-label={`Add ${kind} to ${wall} wall`} onClick={()=>addToWall(wall,kind)}>+</button></div></div>)}
   </div>
   {items.length>0?<div className="wall-items">{items.map((o,i)=><div key={o.id} className={selected===o.id?'wall-item active':'wall-item'}>
    <button className="wall-item-name" onClick={()=>setSelected(o.id)}>{o.kind==='door'?doorLabel(o):'Standard window'}</button>
    <button aria-label="Move opening left" disabled={i===0} onClick={()=>reorder(o.id,-1)}>←</button>
    <button aria-label="Move opening right" disabled={i===items.length-1} onClick={()=>reorder(o.id,1)}>→</button>
   </div>)}</div>:<p className="wall-empty">No openings on this wall</p>}
  </section>;
 })}</div>
 {active&&<div className="edit"><div className="edit-title"><b>Edit selected {active.kind}</b><button className="delete" title="Remove opening" onClick={removeSelected}><Trash2 size={16}/></button></div>
 <p className="help">{active.wall[0].toUpperCase()+active.wall.slice(1)} wall · {Math.round(active.x)} inches from wall end</p>
 {active.kind==='door'&&<><label>Door size</label><select value={active.type+active.width} onChange={e=>{const option=DOOR_OPTIONS.find(d=>d.type+d.width===e.target.value);if(option)editOpening(active.id,{type:option.type,width:option.width,transom:option.width===32?false:Boolean(active.transom)})}}>{DOOR_OPTIONS.map(d=><option key={d.id} value={d.type+d.width}>{d.label}</option>)}</select>
 <label>Transom window</label><select value={active.transom?'yes':'no'} onChange={e=>editOpening(active.id,{transom:e.target.value==='yes'})}><option value="no">No transom</option>{active.width!==32&&<option value="yes">Add transom window</option>}</select></>}
 <label>Move to another wall</label><select value={active.wall} onChange={e=>editOpening(active.id,{wall:e.target.value})}>{WALLS.map(w=><option key={w} value={w}>{w[0].toUpperCase()+w.slice(1)}</option>)}</select>
 <p className="placement-note">Automatic spacing keeps the clear gaps equal, including the space at each end. Use the arrows above to arrange a door to one side of two windows.</p>
 </div>}
 </>}
 {notice&&<div role="status" className="notice">{notice}</div>}</div><div className="panel-bottom"><button className="primary" onClick={download}><Download size={18}/> Export design JSON</button><p>Test mode only. No customer submissions or quotes are sent.</p></div></aside></main><footer>Built for Cape Fear Shed · Prototype V1 · Not yet connected to your quoting system</footer></div>
}
createRoot(document.getElementById('root')).render(<App/>);
