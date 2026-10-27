import React, {useState, useMemo, useRef, useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls, ContactShadows, Environment, Text} from '@react-three/drei';
import {Download, Plus, Trash2, RotateCcw, MoveHorizontal, ChevronDown, Check, Eye} from 'lucide-react';
import './styles.css';

const sizes=[[8,10],[8,12],[10,12],[10,16],[10,20],[12,12],[12,16],[12,20],[14,16],[16,20]];
const swatches=[{name:'Sea Salt',hex:'#CDD2CA'},{name:'Acacia Haze',hex:'#969C92'},{name:'Basil',hex:'#626E60'},{name:'Aquastone',hex:'#89C6B7'},{name:'Silken Peacock',hex:'#427584'},{name:'Snowbound',hex:'#EDEAE5'}];
const DEFAULT=[{id:'door-1',kind:'door',type:'double',wall:'front',x:72,width:48,height:72,y:0},{id:'window-1',kind:'window',type:'standard',wall:'right',x:60,width:18,height:27,y:40}];
const IN=1/12;
const OPTIONS={door:{width:48,height:72,y:0,type:'double'},window:{width:18,height:27,y:40,type:'standard'}};
const framedWidth=o=>o.width+(o.kind==='door'?6:5);
function validOpening(item,list,w,l){const wallLength=(item.wall==='front'||item.wall==='back'?l:w)*12;const half=framedWidth(item)/2; if(item.x-half<8||item.x+half>wallLength-8)return false; return list.every(o=>o.id===item.id||o.wall!==item.wall||Math.abs(o.x-item.x)> (framedWidth(o)+framedWidth(item))/2+4)}
function verticalCladding(widthFt,heightFt,color){const result=[];const widthIn=widthFt*12;for(let i=-widthIn/2+8;i<widthIn/2;i+=8){result.push(<mesh key={i} position={[i*IN,0,0]}><boxGeometry args={[0.012,heightFt,0.008]}/><meshStandardMaterial color={color} roughness={1}/></mesh>)}return result}
function Opening({o,w,l,selected,onSelect}){
 const wallLength=o.wall==='front'||o.wall==='back'?l:w;
 const a=o.x*IN-wallLength/2;
 const wallY=o.y*IN+o.height*IN/2+0.69;
 const isLong=o.wall==='front'||o.wall==='back';
 const face=isLong?(o.wall==='front'?w/2+.042:-w/2-.042):(o.wall==='right'?l/2+.042:-l/2-.042);
 const position=isLong?[a,wallY,face]:[face,wallY,a];
 // Local wall normal is +z. Front faces +z, back -z, left -x, right +x.
 const rotation=isLong?[0,o.wall==='front'?0:Math.PI,0]:[0,o.wall==='right'?Math.PI/2:-Math.PI/2,0];
 const wd=o.width*IN,ht=o.height*IN;
 return <group position={position} rotation={rotation} onClick={e=>{e.stopPropagation();onSelect(o.id)}}>
  <mesh position={[0,0,.025]}><boxGeometry args={[wd+0.17,ht+0.17,.09]}/><meshStandardMaterial color={selected?'#c49351':'#f4f0e8'} roughness={.73}/></mesh>
  {o.kind==='door'?<>
   <mesh position={[0,0,.087]}><boxGeometry args={[wd,ht,.037]}/><meshStandardMaterial color="#bac5bf" roughness={.85}/></mesh>
   {Array.from({length:Math.max(1,Math.floor(o.width/8))},(_,i)=><mesh key={i} position={[-wd/2+(i+1)*wd/(Math.floor(o.width/8)+1),0,.11]}><boxGeometry args={[.01,ht,.012]}/><meshStandardMaterial color="#8e9f98"/></mesh>)}
   <mesh position={[0,0,.13]}><boxGeometry args={[.038,ht,.03]}/><meshStandardMaterial color="#f4f0e8"/></mesh>
   {[-1,1].map(side=><group key={side}>{[-.32,.32].map(y=><mesh key={y} position={[side*wd*.39,y*ht,.137]}><boxGeometry args={[.18,.055,.03]}/><meshStandardMaterial color="#222b2c" metalness={.5} roughness={.4}/></mesh>)}</group>)}
   <mesh position={[.055,0,.165]}><boxGeometry args={[.06,.13,.04]}/><meshStandardMaterial color="#192326" metalness={.5}/></mesh>
  </>:<>
   <mesh position={[0,0,.086]}><boxGeometry args={[wd,ht,.035]}/><meshStandardMaterial color="#213d43" metalness={.35} roughness={.18}/></mesh>
   <mesh position={[0,0,.11]}><boxGeometry args={[.065,ht,.03]}/><meshStandardMaterial color="#edf0ee"/></mesh>
   <mesh position={[0,0,.11]}><boxGeometry args={[wd,.064,.03]}/><meshStandardMaterial color="#edf0ee"/></mesh>
   <mesh position={[-wd*.17,ht*.18,.118]} rotation={[0,0,-.15]}><boxGeometry args={[.028,ht*.43,.01]}/><meshStandardMaterial color="#b8d0d1" transparent opacity={.4}/></mesh>
  </>}
 </group>
}
function Roof({w,l,pitch,roofColor,wall}){
 const rise=w/2*pitch/12;const slope=Math.hypot(w/2+.333,rise+(.333*pitch/12));const angle=Math.atan(pitch/12);
 const baseY=.69+wall;
 const mats={charcoal:'#30373b',gray:'#555b5e',driftwood:'#706b64'};
 const color=mats[roofColor]||mats.charcoal;
 return <group>
  {[-1,1].map(s=><group key={s} position={[0,baseY+rise/2+.333*pitch/24,s*(w/4+.1667)]} rotation={[s*angle,0,0]}>
   <mesh receiveShadow castShadow><boxGeometry args={[l+.6667,.10,slope]}/><meshStandardMaterial color={color} roughness={.98}/></mesh>
   {Array.from({length:Math.floor(l*3)+2},(_,i)=><mesh key={i} position={[-l/2-.27+i/3,.057,0]}><boxGeometry args={[.012,.005,slope]}/><meshStandardMaterial color="#191f22" transparent opacity={.16}/></mesh>)}
   {Array.from({length:Math.floor(slope*3)+1},(_,i)=><mesh key={'h'+i} position={[0,.057,-slope/2+i/3]}><boxGeometry args={[l+.64,.005,.012]}/><meshStandardMaterial color="#14191b" transparent opacity={.17}/></mesh>)}
  </group>)}
  <mesh position={[0,baseY+rise+.04,0]} castShadow><boxGeometry args={[l+.68,.14,.16]}/><meshStandardMaterial color={color}/></mesh>
 </group>
}
function Shed({w,l,pitch,wallHeight,paint,trim,roofColor,openings,selected,setSelected}){
 const wall=wallHeight===6.5?6.5:wallHeight===7?83/12:92/12;
 const floorH=.69,thick=.065;
 const rise=w/2*pitch/12;
 return <group>
  <mesh receiveShadow position={[0,-.075,0]}><boxGeometry args={[l+.2,.25,w+.2]}/><meshStandardMaterial color="#937b5b" roughness={.9}/></mesh>
  {[...Array(Math.ceil(l/4)+1)].map((_,i)=><mesh key={i} position={[-l/2+i*l/Math.ceil(l/4),-.31,0]} castShadow><boxGeometry args={[.34,.22,w-.4]}/><meshStandardMaterial color="#80735b" roughness={.9}/></mesh>)}
  {[-1,1].map((a)=><mesh key={'side'+a} position={[0,floorH+wall/2,a*w/2]} castShadow receiveShadow><boxGeometry args={[l,wall,thick]}/><meshStandardMaterial color={paint} roughness={.92}/></mesh>)}
  {[-1,1].map(a=><group key={'end'+a} position={[a*l/2,0,0]} rotation={[0,Math.PI/2,0]}>
    <mesh position={[0,floorH+wall/2,0]} castShadow receiveShadow><boxGeometry args={[w,wall,thick]}/><meshStandardMaterial color={paint} roughness={.92}/></mesh>
    <mesh position={[0,floorH+wall+rise/2,0]} rotation={[0,0,0]} castShadow><bufferGeometry attach="geometry" onUpdate={g=>{const verts=new Float32Array([-w/2,0,0,w/2,0,0,0,rise,0]);g.setAttribute('position',new THREE.BufferAttribute(verts,3));g.computeVertexNormals()}}/><meshStandardMaterial color={paint} side={2}/></mesh>
  </group>)}
  <Roof w={w} l={l} pitch={pitch} roofColor={roofColor} wall={wall}/>
  {[-1,1].map(a=><group key={'trim'+a}>
    {[-1,1].map(b=><mesh key={b} position={[a*(l/2-.045),floorH+wall/2,b*(w/2+.055)]} castShadow><boxGeometry args={[.085,wall+.13,.17]}/><meshStandardMaterial color={trim}/></mesh>)}
    <mesh position={[0,floorH+wall,a*(w/2+.06)]}><boxGeometry args={[l+.1,.115,.14]}/><meshStandardMaterial color={trim}/></mesh>
  </group>)}
  {openings.map(o=><Opening key={o.id} o={o} w={w} l={l} selected={selected===o.id} onSelect={setSelected}/>)}
 </group>
}
function App(){
 const [size,setSize]=useState('10x12');const [width,length]=size.split('x').map(Number);
 const [height,setHeight]=useState(7);const [pitch,setPitch]=useState(5);
 const [paint,setPaint]=useState('#CDD2CA');const [trim,setTrim]=useState('#EDEAE5');const [roof,setRoof]=useState('charcoal');
 const [openings,setOpenings]=useState(DEFAULT);const [selected,setSelected]=useState('door-1');const [tab,setTab]=useState('size');const [notice,setNotice]=useState('');
 const active=openings.find(o=>o.id===selected);
 function editOpening(id,patch){setOpenings(prev=>{const next=prev.map(o=>o.id===id?{...o,...patch}:o);const changed=next.find(o=>o.id===id);if(!validOpening(changed,next,width,length)){setNotice('That position needs more framing clearance.');return prev}setNotice('');return next})}
 function addOpening(kind){const spec=OPTIONS[kind];const wall='front';const arr=Array.from({length:Math.floor(length*12/2)},(_,i)=>12+i*2);const x=arr.find(v=>validOpening({id:'new',kind,wall,x:v,...spec},openings,width,length));if(x==null){setNotice('Not enough clear space on this wall. Try another wall or move an opening.');return}const id=`${kind}-${Date.now()}`;setOpenings([...openings,{id,kind,wall,x,...spec}]);setSelected(id);setTab('openings');setNotice('')}
 function changeSize(v){const [nw,nl]=v.split('x').map(Number);setSize(v);setOpenings(prev=>prev.map(o=>({...o,x:Math.min(o.x,(o.wall==='front'||o.wall==='back'?nl:nw)*12-18)})));setNotice('Check opening clearances after resizing.')}
 function download(){const data={format:'cfs-designer-v1',schemaVersion:1,designId:'local-preview',shed:{model:'gable',width,length,wallHeight:height,roofPitch:pitch,overhangInches:4,siding:{type:'lp-panel'},roofing:{type:'shingles'}},colors:{siding:{hex:paint},trim:{hex:trim},roof:{name:roof}},openings,accessories:[]};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const href=URL.createObjectURL(blob);const a=document.createElement('a');a.href=href;a.download='cape-fear-shed-design.json';a.click();setTimeout(()=>URL.revokeObjectURL(href),1000)}
 return <div className="app"><header className="header"><div className="brand"><div className="mark">CF</div><div><strong>CAPE FEAR SHED</strong><small>DESIGN STUDIO • EARLY PROTOTYPE</small></div></div><span className="status"><span/> Live 3D preview</span></header>
 <main className="layout"><section className="stage"><div className="stage-head"><div><div className="eyebrow">YOUR SHED, YOUR WAY</div><h1>Make room for more.</h1><p>Drag to rotate • Pinch or scroll to zoom • Tap an opening to edit</p></div><span className="size-chip">{width}' × {length}'</span></div><div className="canvas-box"><Canvas shadows dpr={[1,1.65]} camera={{position:[19,13,19],fov:39,near:.1,far:120}} gl={{antialias:true,alpha:true}} onCreated={({gl})=>gl.setClearColor('#e9efec',1)}><ambientLight intensity={1.7}/><directionalLight position={[9,20,12]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]}/><group rotation={[0,-.2,0]}><Shed w={width} l={length} pitch={pitch} wallHeight={height} paint={paint} trim={trim} roofColor={roof} openings={openings} selected={selected} setSelected={setSelected}/></group><ContactShadows position={[0,-.55,0]} opacity={.45} scale={35} blur={2.6} far={14}/><OrbitControls makeDefault target={[0,3.7,0]} minDistance={12} maxDistance={48} maxPolarAngle={Math.PI/2.03} enablePan={false}/></Canvas><div className="canvas-label"><Eye size={15}/> Interactive 3D model</div></div><div className="stage-note">Prototype materials and components are simplified. Placement restrictions are conservative estimates and <b>not</b> structural approval.</div></section>
 <aside className="sidebar"><div className="panel-top"><span className="eyebrow">CUSTOMIZE YOUR BUILD</span><h2>Design options</h2></div><div className="tabs">{[['size','Size'],['finishes','Finishes'],['openings','Doors & windows']].map(([id,label])=><button key={id} className={tab===id?'tab active':'tab'} onClick={()=>setTab(id)}>{label}</button>)}</div><div className="panel-body">
 {tab==='size'&&<><h3>Build the basics</h3><label>Dimensions</label><select value={size} onChange={e=>changeSize(e.target.value)}>{sizes.map(([a,b])=><option key={`${a}x${b}`} value={`${a}x${b}`}>{a}' × {b}'</option>)}</select><div className="pair"><div><label>Wall height</label><select value={height} onChange={e=>setHeight(Number(e.target.value))}><option value="6.5">6'6" Standard</option><option value="7">7'</option><option value="8">8'</option></select></div><div><label>Roof pitch</label><select value={pitch} onChange={e=>setPitch(Number(e.target.value))}>{[5,6,7,8].map(n=><option value={n} key={n}>{n}/12</option>)}</select></div></div><div className="tip"><Check size={16}/> Standard gable roof with 4-inch overhangs on all sides.</div></>}
 {tab==='finishes'&&<><h3>Exterior colors</h3><label>Siding color</label><div className="swatches">{swatches.map(c=><button title={c.name} aria-label={`Siding ${c.name}`} key={c.name} className={paint===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setPaint(c.hex)}>{paint===c.hex&&<Check size={16}/>}</button>)}</div><p className="value-name">{swatches.find(s=>s.hex===paint)?.name}</p><label>Trim color</label><div className="swatches">{[{name:'Snowbound',hex:'#EDEAE5'},{name:'Tricorn Black',hex:'#2F2F30'},{name:'Extra White',hex:'#EEEFEA'}].map(c=><button key={c.name} title={c.name} className={trim===c.hex?'swatch picked':'swatch'} style={{background:c.hex}} onClick={()=>setTrim(c.hex)}>{trim===c.hex&&<Check size={16}/>}</button>)}</div><label>Shingle tone</label><select value={roof} onChange={e=>setRoof(e.target.value)}><option value="charcoal">Onyx Black (approx.)</option><option value="gray">Estate Gray (approx.)</option><option value="driftwood">Driftwood (approx.)</option></select></>}
 {tab==='openings'&&<><h3>Position your openings</h3><p className="help">Select an opening on the shed or below. Choose its wall, then move it sideways with the slider.</p><div className="add-row"><button className="add" onClick={()=>addOpening('door')}><Plus size={16}/> Add door</button><button className="add" onClick={()=>addOpening('window')}><Plus size={16}/> Add window</button></div><div className="opening-list">{openings.map(o=><button key={o.id} className={o.id===selected?'opening active':'opening'} onClick={()=>setSelected(o.id)}>{o.kind==='door'?'Double door · 4 ft':'Window · 18×27'}<span>{o.wall}</span></button>)}</div>{active&&<div className="edit"><div className="edit-title"><b>Edit {active.kind}</b><button className="delete" title="Remove" onClick={()=>{setOpenings(openings.filter(o=>o.id!==active.id));setSelected(null)}}><Trash2 size={16}/></button></div><label>Wall</label><select value={active.wall} onChange={e=>{const wall=e.target.value;const max=(wall==='front'||wall==='back'?length:width)*12;editOpening(active.id,{wall,x:max/2})}}>{['front','back','left','right'].map(w=><option value={w} key={w}>{w[0].toUpperCase()+w.slice(1)}</option>)}</select><label>Horizontal center · {Math.round(active.x)} inches from wall end</label><input type="range" min={12} max={(active.wall==='front'||active.wall==='back'?length:width)*12-12} step="1" value={active.x} onChange={e=>editOpening(active.id,{x:Number(e.target.value)})}/><div className="range-ends"><span>Left</span><MoveHorizontal size={16}/><span>Right</span></div></div>}</>}
 {notice&&<div role="status" className="notice">{notice}</div>}</div><div className="panel-bottom"><button className="primary" onClick={download}><Download size={18}/> Export design JSON</button><p>Test mode only. No customer submissions or quotes are sent.</p></div></aside></main><footer>Built for Cape Fear Shed · Prototype V1 · Not yet connected to your quoting system</footer></div>
}
import * as THREE from 'three';
createRoot(document.getElementById('root')).render(<App/>);
