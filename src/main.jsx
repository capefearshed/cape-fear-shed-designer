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
function App(){
 const [size,setSize]=useState('10x12');const [width,length]=size.split('x').map(Number);
 const [height,setHeight]=useState(7);const [pitch,setPitch]=useState(5);
 const [paint,setPaint]=useState(constructionSpecs.siding.lpPanel.defaultColor.hex);const [trim,setTrim]=useState('#EDEAE5');const [roof,setRoof]=useState('charcoal');
 const [openings,setOpenings]=useState(DEFAULT);const [selected,setSelected]=useState('door-1');const [tab,setTab]=useState('size');const [notice,setNotice]=useState('');
 const active=openings.find(o=>o.id===selected);
 const placement=active?boundary(active,width,length):null;
 const available=active?nearbyPositions(active,openings,width,length):[];
 function moveOpeningTo(wall,centered=true){
  if(!active)return;
  const proposed={...active,wall};
  const positions=nearbyPositions(proposed,openings,width,length);
  if(!positions.length){setNotice('No safe space on that wall. Move or remove another opening.');return}
  const desired=centered?wallSpan(wall,width,length)/2:active.x;
  const x=positions.reduce((best,current)=>Math.abs(current-desired)<Math.abs(best-desired)?current:best,positions[0]);
  editOpening(active.id,{wall,x});
 }
 function nudgeOpening(direction){
  if(!active)return;
  const values=available.filter(x=>direction<0?x<active.x-.01:x>active.x+.01);
  if(!values.length){setNotice('Opening is at the nearest allowed position.');return}
  const wanted=active.x+direction*1;
  const x=values.reduce((best,current)=>Math.abs(current-wanted)<Math.abs(best-wanted)?current:best,values[0]);
  editOpening(active.id,{x});
 }
 const doorLabel=o=>`${o.width===60?'5 ft':o.width===48?'4 ft':o.width+' in'} ${o.type==='single'?'single':'double'} door${o.transom?' + transom':''}`;
 function editOpening(id,patch){setOpenings(prev=>{const next=prev.map(o=>o.id===id?{...o,...patch}:o);const changed=next.find(o=>o.id===id);if(!validOpening(changed,next,width,length)){setNotice('That position needs more framing clearance.');return prev}setNotice('');return next})}
 function addOpening(kind){const spec=OPTIONS[kind];const wall=WALLS.find(candidate=>nearbyPositions({id:'new',kind,wall:candidate,...spec},openings,width,length).length>0);
 if(!wall){setNotice('No room for another opening. Move an existing opening or try a larger shed.');return}
 const spots=nearbyPositions({id:'new',kind,wall,...spec},openings,width,length);
 const midpoint=wallSpan(wall,width,length)/2;
 const x=spots.reduce((best,v)=>Math.abs(v-midpoint)<Math.abs(best-midpoint)?v:best,spots[0]);const id=`${kind}-${Date.now()}`;setOpenings([...openings,{id,kind,wall,x,...spec}]);setSelected(id);setTab('openings');setNotice('')}
 function changeSize(v){const [nw,nl]=v.split('x').map(Number);setSize(v);setOpenings(prev=>prev.map(o=>({...o,x:Math.min(o.x,(o.wall==='front'||o.wall==='back'?nl:nw)*12-18)})));setNotice('Check opening clearances after resizing.')}
 function download(){const data={format:'cfs-designer-v1',schemaVersion:1,designId:'local-preview',shed:{model:'gable',width,length,wallHeight:height,roofPitch:pitch,overhangInches:4,siding:{type:'lp-panel'},roofing:{type:'shingles'}},colors:{siding:{hex:paint},trim:{hex:trim},roof:{name:roof}},openings,accessories:[]};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='cape-fear-shed-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
 return <div className="app"><header className="header"><div className="brand"><div className="mark">CF</div><div><strong>CAPE FEAR SHED</strong><small>DESIGN STUDIO • EARLY PROTOTYPE</small></div></div><span className="status"><span/> Live 3D preview</span></header>
 <main className="layout"><section className="stage"><div className="stage-head"><div><div className="eyebrow">YOUR SHED, YOUR WAY</div><h1>Make room for more.</h1><p>Drag to rotate • Pinch or scroll to zoom • Tap an opening to edit</p></div><span className="size-chip">{width}' × {length}'</span></div><div className="canvas-box"><Canvas shadows dpr={[1,1.65]} camera={{position:[19,13,19],fov:39,near:.1,far:120}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>gl.setClearColor('#e9efec',1)}><ambientLight intensity={.75}/><hemisphereLight args={['#eef4ff','#a5a18d',1.1]}/><directionalLight position={[9,20,12]} intensity={2.7} castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} shadow-normalBias={.035}/><directionalLight position={[-12,8,-6]} intensity={.65}/><group rotation={[0,-.2,0]}><Shed w={width} l={length} pitch={pitch} wallHeight={height} paint={paint} trim={trim} roofColor={roof} openings={openings} selected={selected} setSelected={setSelected}/></group><ContactShadows position={[0,-.375,0]} opacity={.45} scale={35} blur={2.6} far={14}/><OrbitControls makeDefault target={[0,3.7,0]} minDistance={12} maxDistance={48} maxPolarAngle={Math.PI/2.03} enablePan={false}/></Canvas><div className="canvas-label"><Eye size={15}/> Interactive 3D model</div></div><div className="stage-note">Prototype materials and components are simplified. Placement restrictions are conservative estimates and <b>not</b> structural approval.</div></section>
 <aside className="sidebar"><div className="panel-top"><span className="eyebrow">CUSTOMIZE YOUR BUILD</span><h2>Design options</h2></div><div className="tabs">{[['size','Size'],['finishes','Finishes'],['openings','Doors & windows']].map(([id,label])=><button key={id} className={tab===id?'tab active':'tab'} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="panel-body">
 {tab==='size'&&<><h3>Build the basics</h3><label>Dimensions</label><select value={size} onChange={e=>changeSize(e.target.value)}>{sizes.map(([a,b])=><option key={`${a}x${b}`} value={`${a}x${b}`}>{a}' × {b}'</option>)}</select><div className="pair"><div><label>Wall height</label><select value={height} onChange={e=>setHeight(Number(e.target.value))}><option value="6.5">6'6" Standard</option><option value="7">7'</option><option value="8">8'</option></select></div><div><label>Roof pitch</label><select value={pitch} onChange={e=>setPitch(Number(e.target.value))}>{[5,6,7,8].map(n=><option value={n} key={n}>{n}/12</option>)}</select></div></div><div className="tip"><Check size={16}/> Standard gable roof with 4-inch overhangs on all sides.</div></>}
 {tab==='finishes'&&<><h3>Exterior colors</h3><label>Siding color</label><div className="swatches">{swatches.map(c=><button title={c.name} aria-label={`Siding ${c.name}`} key={c.name} className={paint===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setPaint(c.hex)}>{paint===c.hex&&<Check size={16}/>}</button>)}</div><p className="value-name">{swatches.find(s=>s.hex===paint)?.name}</p><label>Trim color</label><div className="swatches">{[{name:'Snowbound',hex:'#EDEAE5'},{name:'Tricorn Black',hex:'#2F2F30'},{name:'Extra White',hex:'#EEEFEA'}].map(c=><button key={c.name} title={c.name} className={trim===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setTrim(c.hex)}>{trim===c.hex&&<Check size={16}/>}</button>)}</div><label>Shingle tone</label><select value={roof} onChange={e=>setRoof(e.target.value)}><option value="charcoal">Onyx Black</option><option value="gray">Estate Gray (approx.)</option><option value="driftwood">Driftwood (approx.)</option></select></>}
 {tab==='openings'&&<><h3>Position your openings</h3><p className="help">Tap a door or window, choose a wall, then center it or adjust the location in 1-inch increments.</p><div className="add-row"><button className="add" onClick={()=>addOpening('door')}><Plus size={16}/> Add door</button><button className="add" onClick={()=>addOpening('window')}><Plus size={16}/> Add window</button></div><div className="opening-list">{openings.map(o=><button key={o.id} className={o.id===selected?'opening active':'opening'} onClick={()=>setSelected(o.id)}>{o.kind==='door'?doorLabel(o):'Window · 18×27'}<span>{o.wall}</span></button>)}</div>{active&&<div className="edit"><div className="edit-title"><b>Edit {active.kind}</b><button className="delete" title="Remove" onClick={()=>{setOpenings(openings.filter(o=>o.id!==active.id));setSelected(null)}}><Trash2 size={16}/></button></div>{active.kind==='door'&&<><label>Door size</label><select value={active.type+(active.width)} onChange={e=>{const option=DOOR_OPTIONS.find(d=>d.type+d.width===e.target.value);if(option)editOpening(active.id,{type:option.type,width:option.width,transom:option.width===32?false:Boolean(active.transom)})}}>{DOOR_OPTIONS.map(d=><option key={d.id} value={d.type+d.width}>{d.label}</option>)}</select><label>Transom window</label><select value={active.transom?'yes':'no'} onChange={e=>editOpening(active.id,{transom:e.target.value==='yes'})}><option value="no">No transom</option>{active.width!==32&&<option value="yes">Add transom window</option>}</select></>}<label>Choose wall</label>
 <div className="wall-picker">{WALLS.map(wall=><button type="button" key={wall} aria-pressed={active.wall===wall} className={active.wall===wall?'wall-choice active':'wall-choice'} onClick={()=>moveOpeningTo(wall)}>{wall[0].toUpperCase()+wall.slice(1)}</button>)}</div>
 <div className="placement-actions"><button type="button" className="center-action" onClick={()=>moveOpeningTo(active.wall)}><MoveHorizontal size={16}/> Center on wall</button></div>
 <label>Position · {Math.round(active.x)} in from wall end</label>
 <div className="position-stepper"><button type="button" aria-label="Move left one inch" disabled={!available.some(x=>x<active.x-.01)} onClick={()=>nudgeOpening(-1)}>− 1″</button><span>{Math.round(active.x)}″</span><button type="button" aria-label="Move right one inch" disabled={!available.some(x=>x>active.x+.01)} onClick={()=>nudgeOpening(1)}>+ 1″</button></div>
 <input aria-label="Horizontal position" type="range" min={placement.min} max={placement.max} step="1" value={active.x} onChange={e=>editOpening(active.id,{x:Number(e.target.value)})}/>
 <div className="range-ends"><span>{Math.round(placement.min)}″ minimum</span><span>{Math.round(placement.max)}″ maximum</span></div>
 <p className="placement-note">Placement checks account for corner clearance and other openings on the same wall.</p></div>}</>}
 {notice&&<div role="status" className="notice">{notice}</div>}</div><div className="panel-bottom"><button className="primary" onClick={download}><Download size={18}/> Export design JSON</button><p>Test mode only. No customer submissions or quotes are sent.</p></div></aside></main><footer>Built for Cape Fear Shed · Prototype V1 · Not yet connected to your quoting system</footer></div>
}
createRoot(document.getElementById('root')).render(<App/>);
