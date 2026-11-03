import {OVERHANG_CODES,selectOverhang} from './soffitOverhang.js';
import {browserAttribution} from './leadAnalytics.js';
import {editableSavedDesign} from './editableSavedDesign.js';
import RenderSavedDesign from './RenderSavedDesign.jsx';
import {savedContact,EXPIRED_LINK} from './savedDesign.js';
import {interiorLayout} from './interiorLayout.js';
import {WINDOW_FRAME_COLORS,windowFrameColor} from './windowFrames.js';
import {viewerShrinkTarget} from './viewerScroll.js';
import {followPhoto} from './photoJob.js';
import OpeningPicture from './OpeningPicture.jsx';
import SendReceipt from './SendReceipt.jsx';
import {USE_CHOICES,SOURCE_CHOICES,validateQuoteAnswers} from './quoteChoices.js';
import {readDraft,saveDraft} from './draftStorage.js';
import {styleUnavailableReason,withShedStyle} from './styleRules.js';
import React,{useState,useRef,useMemo,useLayoutEffect,useEffect} from 'react';
import {Ruler,House,Paintbrush,DoorOpen,PanelsTopLeft,ClipboardCheck,Check,ArrowLeft,ArrowRight,X} from 'lucide-react';
import {getCatalog,loadOwnerDesign,submitDesign,API_MODE,validateCustomer,createBackyardRendering,backyardPhotoRequest} from './api.js';
import {buildDesign,visibleOptions,optionByCode,foundationCode,resolvedDoorColor} from './designContract.js';
import {modelDesign,SIDING_PROFILES} from './modelBridge.js';
import {placeOpening,validPlacement,openingAllowed,moveOpening,stepOpening,redistributeOpenings,openingFootprint} from './catalogLayout.js';
import {openingUnavailableReason,roofingUnavailableReason} from './optionAvailability.js';
import {WALLS,wallSpan} from './openingLayout.js';
import {SidingSample} from './designerViewParts.jsx';
import DesignerViewer from './DesignerViewer.jsx';
import BackyardPreview from './BackyardPreview.jsx';
import {shingleThumbnail} from './Shed.jsx';
import {sampleStates} from './sampleStates.js';

const tabs=[['size','Size',Ruler],['style','Style',House],['finishes','Exterior',Paintbrush],['openings','Openings',DoorOpen],['accessories','Interior',PanelsTopLeft],['review','Review',ClipboardCheck]];
const base=import.meta.env.BASE_URL;
function saveJSON(data,name){const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function ColorPicker({label,colors,value,onChange,customAllowed,roof=false,material}){
 if(!roof)return <fieldset className="paint-selector color-swatches"><legend>{label}</legend>{[false,true].map(coastal=><div key={String(coastal)} className="paint-color-group" role="group" aria-label={coastal?'Coastal beach colors':'Classic colors'}><p className="paint-group-label">{coastal?'Coastal beach colors':'Classic colors'}</p><div className="paint-palette">{colors.filter(c=>Boolean(c.coastal)===coastal).map(c=><button type="button" key={c.name} className={'swatch '+(value.name===c.name&&!value.custom?'picked':'')} aria-label={c.name} title={c.name+(c.code?' · '+c.code:'')} aria-pressed={value.name===c.name&&!value.custom} style={{background:c.hex}} onClick={()=>onChange(c)}>{value.name===c.name&&!value.custom&&<Check size={18}/>}</button>)}</div></div>)}<p className="selected-paint" aria-live="polite">{value.name}{value.code&&<span> · {value.code}</span>}</p>{customAllowed&&<label className="catalog-custom">Custom {label.toLowerCase()}<input value={value.custom?value.name:''} placeholder="Enter a color name or paint code" onChange={e=>{if(e.target.value)onChange({name:e.target.value,code:null,hex:null,custom:true});}}/></label>}</fieldset>;
 return <section className="option-section"><h4>{label}</h4><div className={'catalog-colors'+(roof?' catalog-roof-colors':'')}>{colors.map(color=><button key={color.name} type="button" aria-label={color.name} aria-pressed={value.name===color.name&&!value.custom} title={color.name} onClick={()=>onChange(color)}>
  {roof&&material!=='roof-metal'?<img src={shingleThumbnail(modelDesign({options:[],colors:{trim:[]}}, {shed:{width:8,length:12,wallHeight:'wall-6-6'},colors:{siding:{},trim:{},roof:color},placed:[],extras:[]}).roof)} alt=""/>:<span className="roof-color-preview" style={{background:color.hex||'#B7A48B'}}/>}<small>{color.name}</small></button>)}</div>
  {customAllowed&&<label className="catalog-custom">Custom {label.toLowerCase()}<input type="text" value={value.custom?value.name:''} placeholder="Enter a color name or paint code" onChange={e=>{if(e.target.value)onChange({name:e.target.value,code:null,hex:null,custom:true});}}/></label>}
 </section>;
}
function Links({items}){return <nav className="section-links section-jump-links" aria-label="Jump to section">{items.map(([id,label])=><button type="button" key={id} onClick={e=>{const target=document.getElementById(id),scroller=target?.closest('.panel-content');if(scroller)scroller.scrollTo({top:scroller.scrollTop+target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-e.currentTarget.closest('nav').offsetHeight-12,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}>{label}</button>)}</nav>;}
export default function CatalogDesigner(){
 const [catalog,setCatalog]=useState(null),[loaded,setLoaded]=useState(null),[error,setError]=useState('');
 const renderMode=useMemo(()=>new URLSearchParams(window.location.search).has('render'),[]);
 const renderToken=useMemo(()=>new URLSearchParams(window.location.search).get('render'),[]);
 const token=useMemo(()=>new URLSearchParams(window.location.search).get('edit'),[]);
 const ownerEdit=useMemo(()=>new URLSearchParams(window.location.search).has('edit'),[]);
 useEffect(()=>{let active=true;(async()=>{try{const c=await getCatalog();let result=null;if(ownerEdit&&renderMode)throw new Error('Open a single edit or render link from the app.');if(ownerEdit){if(!token)throw new Error(EXPIRED_LINK);result=await loadOwnerDesign(token);if(result.mode!=='owner-edit')throw new Error('This link cannot edit a design.');result={...result,...editableSavedDesign(c,result)};}if(active){setLoaded(result);setCatalog(c);}}catch(e){if(active)setError(e.message);}})();return()=>{active=false;};},[]);
 if(catalog&&renderMode)return <RenderSavedDesign catalog={catalog} token={renderToken}/>;
 return catalog?<Designer catalog={catalog} loaded={loaded} editToken={token}/>:<main className="catalog-loading"><h1>3D Shed Builder</h1><p role="status">{error||'Loading your shed options…'}</p>{ownerEdit&&<button onClick={()=>window.parent.postMessage({type:'cfs-close-preview'},window.location.origin)}>Close</button>}</main>;
}

function evenlySpacedState(catalog,state){
 const placed=state.placed.map((p,index)=>({p,index})).sort((a,b)=>a.p.wall.localeCompare(b.p.wall)||a.p.x-b.p.x||a.index-b.index).map(({p})=>{return p;});
 return {...state,placed:redistributeOpenings(catalog,state.shed,placed)||state.placed};
}
function Designer({catalog,loaded,editToken}){
 const query=useMemo(()=>new URLSearchParams(window.location.search),[]);
 const ownerEdit=Boolean(loaded);
 const contact=useMemo(()=>loaded?savedContact(loaded.design,loaded.contact,loaded.editorState):null,[loaded]);
 const mode=API_MODE==='stub'&&query.get('mode')==='owner'?'owner':'customer';
 const samples=useMemo(()=>sampleStates(catalog),[catalog]);
 const savedDraft=useMemo(()=>{if(ownerEdit||query.has('sample')||query.has('t')||query.has('quoteId'))return null;try{return readDraft(catalog,window.localStorage);}catch{return null;}},[catalog,query]);
 const [resumePrompt,setResumePrompt]=useState(Boolean(savedDraft));
 const resumeDialog=useRef(null),freshDesign=useRef(null);
 useEffect(()=>{if(resumePrompt)resumeDialog.current?.showModal();},[resumePrompt]);
 const [state,setState]=useState(()=>{
  if(loaded)return {...loaded.state,backyardSetting:loaded.editorState?.backyardSetting||loaded.state.backyardSetting||'coastal'};
  if(query.has('sample'))return evenlySpacedState(catalog,structuredClone(samples[Number(query.get('sample'))-1]||samples[0]));
  const initial=structuredClone(samples[0]),size=catalog.sizes.find(s=>s.width===10&&s.length===12)||catalog.sizes[0];
  initial.shed={...initial.shed,size:size.code,width:size.width,length:size.length,foundation:foundationCode(size.width)};
  initial.placed[0].x=size.length*6;
  const window=catalog.options.find(o=>o.kind==='window'&&!o.ownerOnly);
  if(window){const placed=placeOpening(catalog,initial.shed,initial.placed,window.code,'right','window-1');if(placed)initial.placed.push(placed);}
  freshDesign.current=structuredClone(initial);return evenlySpacedState(catalog,savedDraft?structuredClone(savedDraft.state):initial);
 });
 useEffect(()=>{if(!ownerEdit&&!resumePrompt&&!query.has('sample')&&!query.has('t')&&!query.has('quoteId')){try{saveDraft(catalog,state,window.localStorage);}catch{}}},[catalog,state,resumePrompt,query]);
 const [tab,setTab]=useState('size'),[wall,setWall]=useState('front'),[notice,setNotice]=useState(loaded?.conflicts?.map(c=>c.reason).join(' ')||''),[busy,setBusy]=useState(false);
 const [customer,setCustomer]=useState(contact?.customer||{firstName:'',lastName:'',phone:'',email:'',address:{street:'',city:'',state:'NC',zip:''},smsConsent:false,notes:''});
 const [uses,setUses]=useState(contact?.uses||[]),[usesOther,setUsesOther]=useState(contact?.usesOther||''),[source,setSource]=useState(contact?.source||{code:null,other:'',referredBy:''}),[website,setWebsite]=useState('');
 const [sampleExport,setSampleExport]=useState(null),[receiptOpen,setReceiptOpen]=useState(false),[renderUnlocked,setRenderUnlocked]=useState(false),[sendError,setSendError]=useState('');
 const quoteDialog=useRef(null),quoteButton=useRef(null),receiptHeading=useRef(null);
 useEffect(()=>{if(receiptOpen)receiptHeading.current?.focus();},[receiptOpen]);
 const [selectedOpening,setSelectedOpening]=useState(null),[cameraFocus,setCameraFocus]=useState(null),[cameraIntent,setCameraIntent]=useState(0);
 const [openingChooser,setOpeningChooser]=useState(null),[openingJump,setOpeningJump]=useState(null),[addingOpening,setAddingOpening]=useState(false);
 const openingSequence=useRef(0);
 const focusTimer=useRef(null),appShell=useRef(null),scrollFrame=useRef(null),scrollTarget=useRef(0),viewerShrink=useRef(0);
 useEffect(()=>()=>{clearTimeout(focusTimer.current);cancelAnimationFrame(scrollFrame.current);},[]);
 function focusChoice(kind,wall){clearTimeout(focusTimer.current);setCameraFocus({kind,wall});focusTimer.current=setTimeout(()=>setCameraFocus(null),6000);}
 function chooseWall(next){setCameraIntent(value=>value+1);panel.current?.scrollTo({top:0,behavior:'instant'});setOpeningJump(null);setOpeningChooser(null);setWall(next);setSelectedOpening(state.placed.filter(p=>p.wall===next).sort((a,b)=>a.x-b.x)[0]?.id||null);setCameraFocus(null);}
 function scrollOptions(e){
  if(tab==='openings')return;
  if(!window.matchMedia('(max-width:899px)').matches)return;
  scrollTarget.current=viewerShrinkTarget(e.currentTarget.scrollTop,window.innerHeight);
  if(scrollFrame.current!==null)return;
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animate(){
   const gap=scrollTarget.current-viewerShrink.current;
   viewerShrink.current=reduced||Math.abs(gap)<.2?scrollTarget.current:viewerShrink.current+gap*.18;
   appShell.current?.style.setProperty('--viewer-shrink',viewerShrink.current+'px');
   scrollFrame.current=Math.abs(scrollTarget.current-viewerShrink.current)<.2?null:requestAnimationFrame(animate);
  }
  scrollFrame.current=requestAnimationFrame(animate);
 }

 const [photoJob,setPhotoJob]=useState(null);
 const photoController=useRef(null);
 useEffect(()=>()=>photoController.current?.abort(),[]);
 const viewer=useRef(null),panel=useRef(null),startedAt=useRef(Date.now()),lastRender=useRef(null),requestedPhoto=useRef(null),preparedImages=useRef(null),currentSignature=useRef(null);
 const designSignature=JSON.stringify(state);currentSignature.current=designSignature;
 useEffect(()=>{setRenderUnlocked(false);},[designSignature]);
 const captureImages=async(quiet=false)=>{
  let render=lastRender.current?.signature===designSignature?lastRender.current:null;
  if(!render){
   if(!quiet)setNotice('Creating your shed picture…');
   const selected=requestedPhoto.current?.signature===designSignature?requestedPhoto.current:null;
   const captured=selected||viewer.current.capture(true,true,ownerEdit?state.backyardSetting||'coastal':'coastal');
   const image=await createBackyardRendering(captured.image,model,{setting:selected?.setting||(ownerEdit?state.backyardSetting||'coastal':'coastal'),referenceDetails:captured.referenceDetails,shedCutout:captured.shedCutout,physicalSize:captured.physicalSize});
   if(currentSignature.current!==designSignature)throw new Error('Your design changed. Please try again with your updated design.');
   render={image,signature:designSignature,source:selected?'customer':'auto'};lastRender.current=render;
  }
  if(currentSignature.current!==designSignature)throw new Error('Your design changed. Please try again with your updated design.');
  if(!quiet)setNotice('Preparing your four wall pictures…');
  return viewer.current.captureSubmission(render.image,render.source||'customer');
 };
 function prepareImages(){
  if(preparedImages.current?.signature===designSignature)return preparedImages.current.promise;
  const task={signature:designSignature};
  task.promise=viewer.current.captureSubmission(null,'pending');
  preparedImages.current=task;
  task.promise.catch(()=>{if(preparedImages.current===task)preparedImages.current=null;});
  return task.promise;
 }
 function beginPhoto(photo,signature,photoRequest,layerImages){
  let dispatched;const started=new Promise(resolve=>{dispatched=resolve;});
  photoController.current?.abort();const controller=new AbortController();photoController.current=controller;
  setPhotoJob({status:'working',signature});
  followPhoto(photo,photoRequest,{signal:controller.signal,layerImages,onStarted:dispatched}).then(result=>{if(!controller.signal.aborted)setPhotoJob({...result,signature});}).catch(()=>{if(!controller.signal.aborted)setPhotoJob({status:'failed',signature});dispatched(false);});
  return started;
 }

 function openQuote(photo=null){if(photo?.image){requestedPhoto.current={...photo,signature:designSignature};preparedImages.current=null;lastRender.current=null;}else{requestedPhoto.current=null;preparedImages.current=null;}setNotice('');quoteDialog.current.showModal();}
 const available=visibleOptions(catalog,mode),byKind=kind=>available.filter(o=>o.kind===kind),shed=state.shed;
 const model=useMemo(()=>modelDesign(catalog,state),[catalog,state]);
 const context={quoteId:query.get('quoteId'),customerId:query.get('customerId'),ownerToken:query.get('t')};
 const tracking=useMemo(()=>ownerEdit?structuredClone(loaded.design.tracking||{}):browserAttribution(),[ownerEdit,loaded]);
 const meta={mode:ownerEdit?loaded.design.mode||'customer':mode,context,startedAt:ownerEdit?loaded.design.startedAt||startedAt.current:startedAt.current,customer,uses,usesOther:uses.includes('use-other')?usesOther:'',source,website,tracking};
 let design=null,contractError='';try{design=buildDesign(catalog,state,meta);}catch(e){contractError=e.message;}
 useLayoutEffect(()=>{cancelAnimationFrame(scrollFrame.current);scrollFrame.current=null;panel.current?.scrollTo({top:0,behavior:'instant'});scrollTarget.current=0;viewerShrink.current=0;appShell.current?.style.setProperty('--viewer-shrink','0px');setCameraFocus(null);if(tab==='openings'&&!state.placed.some(p=>p.id===selectedOpening&&p.wall===wall))setSelectedOpening(state.placed.filter(p=>p.wall===wall).sort((a,b)=>a.x-b.x)[0]?.id||null);},[tab]);
 useEffect(()=>{
  if(sampleExport===null)return;
  let cancelled=false;const timer=setTimeout(async()=>{
   try{const sample=buildDesign(catalog,state,{...meta,mode:sampleExport===2?'owner':'customer',customer:{...customer,firstName:'Sample',lastName:'Customer',phone:'910-555-0100',email:'sample@example.com'},images:await captureImages()});saveJSON(sample,`sample-${sampleExport+1}.json`);
    if(!cancelled){if(sampleExport<2){setState(structuredClone(samples[sampleExport+1]));setSampleExport(sampleExport+1);}else{setSampleExport(null);setNotice('Three sample submissions downloaded, including model pictures.');}}
   }catch(e){setSampleExport(null);setNotice(e.message);}
  },1200);return()=>{cancelled=true;clearTimeout(timer);};
 },[sampleExport]);
 function change(next,{redistribute=false}={}){if(redistribute){const placed=redistributeOpenings(catalog,next.shed,next.placed);if(!placed){setNotice('Not enough clear wall space for this combination. Change the size or openings.');return false;}next={...next,placed};}const rack=next.extras.find(e=>e.code==='surf-rack'&&e.qty>1);if(rack&&rack.qty>rackCapacity(next,rack.wall||'back')){setNotice('The adjacent surf racks need more uninterrupted wall space. Reduce the rack quantity or choose another wall first.');return false;}const reason=styleUnavailableReason(catalog,next.shed);if(reason){setNotice(reason);return false;}if(!validPlacement(catalog,next.shed,next.placed)){setNotice('The openings do not fit this selection. Move, change or remove an opening first.');return false;}setState(next);setNotice('');return true;}
 function setShed(patch){
  let next={...state,shed:{...shed,...patch}};
  if(patch.style){try{next=withShedStyle(catalog,next,patch.style);}catch(e){setNotice(e.message);return;}}
  if((patch.width||patch.length)&&styleUnavailableReason(catalog,next.shed))next=withShedStyle(catalog,next,'style-gable');
  if(patch.roofPitch)next.gablePitch=patch.roofPitch;
  if(next.shed.length<10)next.extras=next.extras.map(e=>e.code==='loft-45'&&e.qty===2?{...e,qty:1}:e);
  next.shed.foundation=foundationCode(next.shed.width,next.shed.foundation==='foundation-slab');change(next,{redistribute:true});
 }
 function move(id,x){if(busy)return;const placed=moveOpening(catalog,shed,state.placed,id,x);if(placed)change({...state,placed});else setNotice('There is not enough clear wall space for this layout.');}
 function edit(id,patch){change({...state,placed:state.placed.map(p=>p.id===id?{...p,...patch}:p)},{redistribute:Boolean(patch.code||patch.wall||Object.hasOwn(patch,'shutters'))});}
 function selectOpening(id){setAddingOpening(false);setSelectedOpening(id);setOpeningChooser(null);setOpeningJump({id});}
 function add(option){const item=placeOpening(catalog,shed,state.placed,option.code,wall,option.kind+'-'+(crypto.randomUUID?.()||Date.now().toString(36)+'-'+(++openingSequence.current)));if(!item){setNotice('This opening needs more clear wall space or a different shed/wall selection.');return;}if(change({...state,placed:[...state.placed,item]},{redistribute:true})){setSelectedOpening(item.id);setAddingOpening(false);setOpeningChooser(null);setOpeningJump({id:item.id});setCameraFocus(null);return item;}}
 function rackCapacity(next=state,wall){const preview=modelDesign(catalog,next);return interiorLayout(preview.width,preview.length,{}, {surfRack:wall||preview.interiorWalls.surfRack},preview.openings).surfRack.maxQty;}
 function extra(option,qty,placement,patch={}){const others=state.extras.filter(e=>e.code!==option.code);change({...state,extras:[...others,{code:option.code,wall:placement||state.extras.find(e=>e.code===option.code)?.wall||(option.code==='surf-rack'?'back':'left'),...(state.extras.find(e=>e.code===option.code)||{}),qty,...(placement?{wall:placement}:{}),...patch}]});}

 function color(group,value){focusChoice(group==='roof'?'roof':'siding');setState({...state,colors:{...state.colors,[group]:value}});}
 async function exportDesign(){if(busy)return;setBusy(true);try{const images=await captureImages();saveJSON(buildDesign(catalog,state,{...meta,images}),'cape-fear-shed-design.json');setNotice('Your design file is ready.');}catch(e){setNotice(e.message);}finally{setBusy(false);}}
 async function submit(e){e?.preventDefault();if(busy)return;const invalid=validateCustomer(customer)||validateQuoteAnswers({uses,usesOther,source,smsConsent:ownerEdit||customer.smsConsent});if(invalid){setNotice(invalid);return;}setBusy(true);setNotice('');setSendError('');if(!ownerEdit)setReceiptOpen(true);quoteDialog.current?.close();try{
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  const images=await prepareImages();
  const body=buildDesign(catalog,state,{...meta,...(ownerEdit?{designId:loaded.design.designId,revision:loaded.design.revision,context:loaded.design.context}:{}),images,submittedAt:new Date().toISOString()});
  if(ownerEdit)body.editToken=editToken;
  const selected=requestedPhoto.current?.signature===designSignature?requestedPhoto.current:null;
  const captured=selected||viewer.current.capture(true,true,ownerEdit?state.backyardSetting||'coastal':'coastal');
  body.editorState.backyardSetting=selected?.setting||state.backyardSetting||'coastal';
  const photoRequest=backyardPhotoRequest(captured.image,model,{setting:selected?.setting||(ownerEdit?state.backyardSetting||'coastal':'coastal'),referenceDetails:captured.referenceDetails,physicalSize:captured.physicalSize});
  const response=await submitDesign(body);if(response.ok!==true&&response.success!==true)throw new Error('The design could not be submitted.');
  // Dispatch the persistent server photo job immediately, before rendering success UI.
  const photoStarted=beginPhoto(response.photo,designSignature,photoRequest,captured.layerImages);
  if(ownerEdit&&!await photoStarted)throw new Error('Changes saved, but the backyard photo could not be started. Save again to retry before closing.');
  if(ownerEdit){setNotice('Changes saved. Updating backyard photo…');if(window.parent!==window)window.parent.postMessage({type:'cfs-design-saved',quoteNumber:response.quoteNumber??loaded.quoteNumber},window.location.origin);}
  setRenderUnlocked(true);setBusy(false);
 }catch(e){setSendError(e.message);setNotice(e.message);}finally{setBusy(false);}}
 const selectedExtra=code=>state.extras.find(e=>e.code===code)?.qty||0;
 const wallItems=state.placed.filter(p=>p.wall===wall).sort((a,b)=>a.x-b.x),selectedIndex=wallItems.findIndex(p=>p.id===selectedOpening),activeOpening=wallItems[selectedIndex];
 useLayoutEffect(()=>{
  if(tab!=='openings'||!openingJump)return;
  const frame=requestAnimationFrame(()=>{
   const target=document.getElementById(openingChooser?'opening-style-choices':'opening-'+openingJump.id),scroller=panel.current;
   if(target&&scroller)scroller.scrollTo({top:scroller.scrollTop+target.getBoundingClientRect().top-scroller.getBoundingClientRect().top-12,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  });return()=>cancelAnimationFrame(frame);
 },[openingJump,tab]);
 function arrowPlacement(direction){return activeOpening?stepOpening(catalog,shed,state.placed,activeOpening.id,direction):null;}
 function swapSelected(direction){const placed=arrowPlacement(direction);if(placed)change({...state,placed});}
 function addDefault(kind){if(kind==='window'){const option=byKind('window').find(o=>!openingUnavailableReason(catalog,shed,state.placed,o,wall,null));if(option)add(option);else setNotice('This window needs more clear wall space.');return;}setAddingOpening(true);setOpeningChooser(kind);setOpeningJump({id:'choices'});}
 const windowFramePicker=<div className="window-frame-picker"><strong>Window Frame Color</strong><div className="choice-grid" role="group" aria-label="Window Frame Color">{WINDOW_FRAME_COLORS.map(c=><button type="button" key={c.name} className={'choice-tile '+(windowFrameColor(state.colors).name===c.name?'picked':'')} aria-pressed={windowFrameColor(state.colors).name===c.name} onClick={()=>setState({...state,colors:{...state.colors,window:c}})}><strong>{c.name}</strong></button>)}</div><p className="help">Applies to all windows, door transoms, and dormer windows.</p></div>;
 const options=(<div id="active-design-options" role="region" aria-label={tabs.find(([id])=>id===tab)[1]+" options"} className="panel-body panel-content" ref={panel} onScroll={scrollOptions} aria-busy={busy}><fieldset className="design-controls" disabled={busy}>
 {tab==='size'&&<><h3>Choose your shed size</h3><Links items={[["dimensions","Dimensions"],["height","Sidewall height"],["foundation","Foundation"]]}/>
 <section id="dimensions" className="option-section"><h4>Dimensions</h4><div className="pair"><label>Width<select aria-label="Width" value={shed.width} onChange={e=>{const width=Number(e.target.value),size=catalog.sizes.find(s=>s.width===width&&s.length===shed.length)||catalog.sizes.find(s=>s.width===width);setShed({width:size.width,length:size.length,size:size.code});}}>{[...new Set(catalog.sizes.map(s=>s.width))].sort((a,b)=>a-b).map(w=><option key={w} value={w}>{w}′</option>)}</select></label><label>Length<select aria-label="Length" value={shed.size} onChange={e=>{const s=catalog.sizes.find(s=>s.code===e.target.value);setShed({size:s.code,width:s.width,length:s.length});}}>{catalog.sizes.filter(s=>s.width===shed.width).map(s=><option key={s.code} value={s.code}>{s.length}′{s.popular?' · Popular':''}</option>)}</select></label></div></section>
 <section id="height" className="option-section"><h4>Sidewall height</h4><div className="sidewall-height-options">{byKind('wallHeight').map(o=><button type="button" className={'choice-tile '+(shed.wallHeight===o.code?'picked':'')} key={o.code} aria-pressed={shed.wallHeight===o.code} onClick={()=>setShed({wallHeight:o.code})}><strong>{o.label.replace(/ walls.*$/i,'')}</strong>{o.standard&&<small>Standard</small>}</button>)}</div></section>
 <section id="foundation" className="option-section"><h4>Foundation</h4><div className="choice-grid">{byKind('foundation').map(o=><button key={o.code} type="button" aria-pressed={shed.foundation===o.code} className={'choice-tile '+(shed.foundation===o.code?'picked':'')} onClick={()=>setShed({foundation:o.code})}><strong>{o.label}</strong><small>{o.code==='foundation-slab'?'Concrete must be level and square to the dimension of the shed':'2x6 treated floor joists, spaced 16" oc, 3/4 Advantech Subfloor'}</small></button>)}</div>{optionByCode(catalog,'anchors-hurricane')&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={selectedExtra('anchors-hurricane')>0} onChange={e=>extra(optionByCode(catalog,'anchors-hurricane'),e.target.checked?1:0)}/>{optionByCode(catalog,'anchors-hurricane').label}</label>}</section></>}

 {tab==='style'&&<><h3>Shed style</h3><div className="choice-grid">{catalog.styles.map(o=><div className="style-choice-item" key={o.code}><button type="button" className={'choice-tile '+(shed.style===o.code?'picked':'')} key={o.code} disabled={Boolean(styleUnavailableReason(catalog,shed,o.code))} title={styleUnavailableReason(catalog,shed,o.code)||o.label} aria-pressed={shed.style===o.code} onClick={()=>setShed({style:o.code})}><strong>{o.label}</strong>{styleUnavailableReason(catalog,shed,o.code)&&<small className="option-unavailable">{styleUnavailableReason(catalog,shed,o.code)}</small>}</button>{o.code==='style-gable-dormer'&&shed.style===o.code&&windowFramePicker}</div>)}</div>{shed.style==='style-lean-to'&&<section className="option-section"><h4>Roof Slope Direction</h4><div className="choice-grid">{['front','back'].map(high=><button type="button" key={high} className={'choice-tile '+((shed.roofHighWall||'front')===high?'picked':'')} aria-pressed={(shed.roofHighWall||'front')===high} onClick={()=>setShed({roofHighWall:high})}><strong>{high==='front'?'High At Front · Low At Back':'High At Back · Low At Front'}</strong></button>)}</div></section>}{OVERHANG_CODES.some(code=>optionByCode(catalog,code))&&<section className="option-section"><h4>Roof overhang</h4><div className="choice-grid"><button type="button" className={'choice-tile '+(!OVERHANG_CODES.some(code=>selectedExtra(code)>0)?'picked':'')} aria-pressed={!OVERHANG_CODES.some(code=>selectedExtra(code)>0)} onClick={()=>change({...state,extras:selectOverhang(state.extras,null)})}><strong>Standard Overhang</strong></button>{OVERHANG_CODES.map(code=>optionByCode(catalog,code)).filter(Boolean).map(o=><button key={o.code} type="button" className={'choice-tile '+(selectedExtra(o.code)>0?'picked':'')} aria-pressed={selectedExtra(o.code)>0} onClick={()=>change({...state,extras:selectOverhang(state.extras,o.code)})}><strong>{o.label}</strong><small>{o.code==='roof-overhang-soffit-8-bird-box'?'8″ projection · Level soffit with bird box returns':o.code==='roof-overhang-soffit-8'?'8″ projection · 4″ boxed edge':'Matching vertical trim on all four sides'}</small></button>)}</div></section>}<section className="option-section"><h4>Roof pitch</h4>{catalog.styles.find(o=>o.code===shed.style)?.pitches?<label>Roof pitch<select aria-label="Roof pitch" value={shed.roofPitch} onChange={e=>setShed({roofPitch:Number(e.target.value)})}>{catalog.styles.find(o=>o.code===shed.style).pitches.map(p=><option key={p} value={p}>{p}/12</option>)}</select></label>:<p>{shed.style==='style-lean-to'?catalog.styles.find(o=>o.code===shed.style).roofAngle+'° fixed':catalog.styles.find(o=>o.code===shed.style).mainPitch+'/12 main · '+catalog.styles.find(o=>o.code===shed.style).dormerPitch+'/12 dormer'}</p>}</section></>}
 {tab==='finishes'&&<><h3>Exterior</h3><Links items={[["siding","Siding"],["paint","Paint"],["roof","Roof"]]}/><section id="siding" className="option-section" onClickCapture={()=>focusChoice('siding')}><h4>Siding</h4><div className="choice-grid">{byKind('siding').map(o=><button type="button" key={o.code} className={'choice-tile '+(shed.siding===o.code?'picked':'')} aria-pressed={shed.siding===o.code} onClick={()=>setShed({siding:o.code})}>{SIDING_PROFILES[o.code]&&<SidingSample type={SIDING_PROFILES[o.code]}/>}<strong>{o.label}</strong></button>)}</div></section><div id="paint"><ColorPicker label="Siding color" colors={catalog.colors.siding} value={state.colors.siding} onChange={c=>color('siding',c)} customAllowed={false}/><ColorPicker label="Trim color" colors={catalog.colors.trim} value={state.colors.trim} onChange={c=>color('trim',c)} customAllowed={false}/></div><section id="roof" className="option-section" onClickCapture={()=>focusChoice('roof')}><h4>Roof</h4><div className="choice-grid">{byKind('roofing').map(o=><button type="button" key={o.code} className={'choice-tile '+(shed.roofing===o.code?'picked':'')} disabled={Boolean(roofingUnavailableReason(catalog,shed,o.code))} onClick={()=>{const next={...state,shed:{...shed,roofing:o.code},colors:{...state.colors,roof:(o.code==='roof-metal'?catalog.colors.metal:catalog.colors.roof)[0]}};change(next);}}><strong>{o.label}</strong>{roofingUnavailableReason(catalog,shed,o.code)&&<small className="option-unavailable">{roofingUnavailableReason(catalog,shed,o.code)}</small>}</button>)}</div><ColorPicker label="Roof color" colors={(shed.roofing==='roof-metal'?catalog.colors.metal:catalog.colors.roof)} value={state.colors.roof} onChange={c=>color('roof',c)} customAllowed={false} roof material={shed.roofing}/></section></>}
 {tab==='openings'&&<><h3>Doors and windows</h3><p className="help">A door alone on a wall can be centered or offset left or right. With multiple openings, use the arrows to change their order.</p>
 <div className="opening-add-actions">{['door','window'].map(kind=><button type="button" key={kind} className="choice-tile" aria-expanded={openingChooser===kind} onClick={()=>addDefault(kind)}>Add {kind==='door'?'door':'window'}</button>)}</div>
 <button type="button" className="remove-opening clear-wall" disabled={!wallItems.length} onClick={()=>{if(change({...state,placed:state.placed.filter(p=>p.wall!==wall)})){setSelectedOpening(null);setOpeningChooser(null);}}}><X size={18} strokeWidth={2.5} aria-hidden="true"/><span>Clear This Wall</span></button>
 {['door','window'].filter(kind=>openingChooser===kind).map(kind=><section id="opening-style-choices" className="option-section" key={kind}><h4>Choose {kind} style</h4><div className="opening-picture-tiles">{byKind(kind).map(o=>{const reason=openingUnavailableReason(catalog,shed,state.placed,o,wall,addingOpening?null:activeOpening);return <button type="button" className="opening-picture-tile" aria-label={o.label} aria-pressed={!addingOpening&&activeOpening?.code===o.code} key={o.code} disabled={Boolean(reason)} onClick={()=>{if(addingOpening)add(o);else if(activeOpening)edit(activeOpening.id,{code:o.code});}}><OpeningPicture option={o}/><strong>{o.label}</strong><small>{o.width}″ × {o.height}″{o.code.includes('transom')?' + transom':''}</small>{reason&&<small className="option-unavailable">{reason}</small>}</button>;})}</div></section>)}

 {state.placed.filter(p=>p.wall===wall).map(p=>{const o=optionByCode(catalog,p.code);return <section id={'opening-'+p.id} className="option-section opening-item" key={p.id}><h4>{o.label}</h4>{o.kind==='window'&&<label>Style<select onFocus={()=>{setSelectedOpening(p.id);setOpeningChooser(null);}} value={p.code} onChange={e=>{const next=optionByCode(catalog,e.target.value);if(openingAllowed(catalog,shed,next,p.wall))edit(p.id,{code:next.code});}}>{byKind(o.kind).map(opt=><option key={opt.code} value={opt.code} disabled={!openingAllowed(catalog,shed,opt,p.wall)}>{opt.label}</option>)}</select></label>}
 {(o.kind==='window'||o.transom)&&windowFramePicker}{o.kind==='window'&&o.shuttersAllowed&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={Boolean(p.shutters)} onChange={e=>edit(p.id,{shutters:e.target.checked})}/>Add shutters</label>}{o.kind==='window'&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={Boolean(p.flowerBox)} onChange={e=>edit(p.id,{flowerBox:e.target.checked})}/>Add a flower box</label>}{o.kind==='door'&&<>{o.ramp&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={!p.rampRemoved} onChange={e=>edit(p.id,{rampRemoved:!e.target.checked})}/><strong>Add A Ramp</strong></label>}{!o.code.includes('rollup')&&<div className="secondary-door-paint"><label className="accessory-choice"><input type="checkbox" checked={Boolean(p.color)} onChange={e=>edit(p.id,{color:e.target.checked?{...resolvedDoorColor(catalog,state,p,o)}:null})}/><strong>Secondary door paint</strong></label>{p.color&&<div className="door-paint-colors"><ColorPicker label="Door color" colors={[...catalog.colors.siding,...catalog.colors.trim].filter((c,i,a)=>a.findIndex(t=>t.name===c.name)===i)} value={resolvedDoorColor(catalog,state,p,o)} onChange={c=>{setSelectedOpening(p.id);setWall(p.wall);focusChoice('door',p.wall);edit(p.id,{color:c});}} customAllowed={false}/></div>}</div>}</>}

 <div className="opening-item-actions">{o.kind==='door'&&<button type="button" className="change-opening" onClick={()=>{setAddingOpening(false);setSelectedOpening(p.id);setOpeningChooser('door');setOpeningJump({id:p.id});}}>Change door</button>}<button type="button" className="remove-opening" onClick={()=>change({...state,placed:state.placed.filter(other=>other.id!==p.id)},{redistribute:true})}><X size={18} strokeWidth={2.5} aria-hidden="true"/><span>Remove {o.kind}</span></button></div></section>;})}</>}
 {tab==='accessories'&&<><h3>Interior and extras</h3><p className="help">Rotate and zoom to explore the framing and interior space. Some quote options have an approximate preview.</p>{[...new Set(available.filter(o=>o.code!=='anchors-hurricane'&&!['auto','door','window','ramp','foundation','roofing','siding','wallHeight','dormer','roofOverhang'].includes(o.kind)).map(o=>o.group))].map(group=><section className="option-section" key={group}><h4>{group?.[0]?.toUpperCase()+group.slice(1)}</h4>{available.filter(o=>o.group===group&&o.code!=='anchors-hurricane'&&!['auto','door','window','ramp','foundation','roofing','siding','wallHeight','dormer','roofOverhang'].includes(o.kind)).map(o=><div className="interior-option" key={o.code}><label className="accessory-choice"><input type="checkbox" checked={selectedExtra(o.code)>0} onChange={e=>extra(o,e.target.checked?1:0)}/>{o.label}</label>{design?.elements.find(e=>e.code===o.code)?.free&&<p className="help">Free with your shed</p>}{selectedExtra(o.code)>0&&o.kind==='alongGable'&&!(['loft-45','workbench-18'].includes(o.code)&&selectedExtra(o.code)===2)&&<label>End Wall<select value={state.extras.find(e=>e.code===o.code)?.wall||'left'} onChange={e=>extra(o,selectedExtra(o.code),e.target.value)}>{['left','right'].map(w=><option key={w}>{w}</option>)}</select></label>}{o.code==='loft-45'&&selectedExtra(o.code)>0&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={selectedExtra(o.code)===2} disabled={shed.length<10} onChange={e=>extra(o,e.target.checked?2:1)}/>Double Storage Loft · Both End Walls{shed.length<10&&<small className="option-unavailable">Requires At Least 10′ Length</small>}</label>}{o.code==='workbench-18'&&selectedExtra(o.code)>0&&<label className="accessory-choice door-ramp-choice"><input type="checkbox" checked={selectedExtra(o.code)===2} onChange={e=>extra(o,e.target.checked?2:1)}/>Double Workbench · Both End Walls</label>}{selectedExtra(o.code)>0&&o.code==='surf-rack'&&<><label>Rack Quantity<select aria-label="Surf Rack Quantity" value={selectedExtra(o.code)} onChange={e=>extra(o,Number(e.target.value))}>{Array.from({length:Math.max(1,rackCapacity())},(_,i)=>i+1).map(qty=><option key={qty} value={qty}>{qty===1?'1 Rack · Up To 4 Bars':qty+' Racks · '+qty*4+' Bars'}</option>)}</select></label>{rackCapacity()<2&&<p className="option-unavailable">More Adjacent Racks Require A Longer Uninterrupted Wall.</p>}<label>Wall<select value={state.extras.find(e=>e.code===o.code)?.wall||'back'} onChange={e=>extra(o,selectedExtra(o.code),e.target.value)}>{WALLS.map(w=><option key={w}>{w}</option>)}</select></label></>}{selectedExtra(o.code)>0&&o.dowels&&<label>Dowel length<select aria-label="Dowel length" value={state.extras.find(e=>e.code===o.code)?.dowel||18} onChange={e=>extra(o,selectedExtra(o.code),undefined,{dowel:Number(e.target.value)})}>{o.dowels.map(n=><option key={n} value={n}>{n} inches</option>)}</select></label>}{selectedExtra(o.code)>0&&o.kind==='each'&&!o.placed&&<label>Quantity<input type="number" min="1" max="20" value={selectedExtra(o.code)} onChange={e=>extra(o,Math.max(1,Number(e.target.value)||1))}/></label>}</div>)}</section>)}</>}
 {tab==='review'&&<><h3>Review your shed</h3><Links items={[["summary","Your design"],["rendering","Backyard photo"]]}/><section className="option-section" id="summary"><h4>Your selections</h4><p>{shed.width}′ × {shed.length}′ · {catalog.styles.find(o=>o.code===shed.style)?.label}</p><div className="catalog-summary">{[shed.wallHeight,shed.siding,shed.roofing,shed.foundation].map(code=><div key={code}>{optionByCode(catalog,code)?.label}</div>)}{['siding','trim','roof'].map(key=><div key={key}>{key[0].toUpperCase()+key.slice(1)}: {state.colors[key].name}</div>)}{design?.elements.map(line=><div key={line.id}><span>{line.qty>1?line.qty+' × ':''}{line.label}{line.wall?' · '+line.wall:''}{line.free?' · Free with your shed':''}</span></div>)}</div></section>
 <section id="rendering" className="option-section"><BackyardPreview initialSetting={state.backyardSetting||'garden'} onSettingChange={setting=>setState(current=>({...current,backyardSetting:setting}))} locked={!renderUnlocked} onRequestQuote={openQuote} capture={(auto,setting)=>viewer.current.capture(auto,true,setting)} design={model} onRender={image=>{preparedImages.current=null;lastRender.current=image?{image,signature:designSignature,source:'customer'}:null;}}/></section>

 {mode==='owner'&&API_MODE==='stub'&&<button type="button" className="primary" disabled={sampleExport!==null} onClick={()=>{setTab('review');setState(structuredClone(samples[0]));setSampleExport(0);}}>Export three pictured sample submissions</button>}
 </>}
 </fieldset>
 {(notice||contractError)&&<p className="notice" role="status">{notice||contractError}</p>}
 {tab!=='review'&&<button type="button" className="primary step-next" onClick={()=>setTab(tabs[tabs.findIndex(([id])=>id===tab)+1][0])}>Next: {tabs[tabs.findIndex(([id])=>id===tab)+1][1]}</button>}
 {tab==='review'&&mode==='owner'&&<div className="design-export"><button type="button" className="primary" disabled={busy||!design} onClick={exportDesign}>Download my design</button><p className="help">{API_MODE==='live-test'?'Test account · No customer messages are sent':'Built on site by Cape Fear Shed'}</p></div>}
 </div>);
 return <><div ref={appShell} className={'app app-shell'+(tab==='openings'?' openings-active':'')+(receiptOpen?' receipt-active':'')} inert={receiptOpen?'':undefined} aria-hidden={receiptOpen?true:undefined}><header className="header"><div className="brand"><img className="brand-logo" src={base+'brand/logo-transparent.png'} alt="Cape Fear Shed logo"/><div className="designer-brand"><strong>Cape Fear Shed</strong><span>3D Shed Builder</span></div></div>{ownerEdit&&<button type="button" disabled={busy} onClick={()=>window.parent.postMessage({type:'cfs-close-preview'},window.location.origin)}>Close</button>}{mode==='owner'&&<strong>Owner test preview</strong>}</header>
 <main className="layout"><section className="stage"><DesignerViewer ref={viewer} design={model} tab={tab} wall={wall} selected={selectedOpening} cameraFocus={cameraFocus} cameraIntent={cameraIntent} onSelect={id=>{selectOpening(id);const p=state.placed.find(p=>p.id===id);if(p){setWall(p.wall);setTab('openings');}}}/>{tab==='openings'&&<div className="viewer-opening-controls"><div className="viewer-opening-arrows" role="group" aria-label="Position selected opening"><button type="button" aria-label="Move selected opening left" disabled={!arrowPlacement(-1)} onClick={()=>swapSelected(-1)}><ArrowLeft size={27} strokeWidth={3.5} color="#000"/></button>{wallItems.length?<div className="opening-selector"><span className="opening-selector-label" aria-hidden="true">{activeOpening?`${wallItems.findIndex(p=>p.id===activeOpening.id)+1}. ${optionByCode(catalog,activeOpening.code).label}`:'Select An Opening'}</span><select aria-label="Selected opening" value={activeOpening?.id||''} onChange={e=>selectOpening(e.target.value)}><option value="" disabled>Tap an opening on the shed</option>{wallItems.map((p,i)=><option key={p.id} value={p.id}>{i+1}. {optionByCode(catalog,p.code).label}</option>)}</select></div>:<span>Add a door or window below</span>}<button type="button" aria-label="Move selected opening right" disabled={!arrowPlacement(1)} onClick={()=>swapSelected(1)}><ArrowRight size={27} strokeWidth={3.5} color="#000"/></button></div><div className="wall-view-picker" role="group" aria-label="Wall selection">{['front','right','back','left'].map(w=><button type="button" className={'wall-view-chip '+(wall===w?'active':'')} key={w} aria-pressed={wall===w} onClick={()=>chooseWall(w)}>{w[0].toUpperCase()+w.slice(1)}</button>)}</div></div>}</section>
 <nav className="mobile-step-nav" aria-label="Design sections">{tabs.map(([id,label,Icon])=><button type="button" key={id} aria-pressed={tab===id} disabled={busy} className={'mobile-step'+(tab===id?' active':'')} onClick={()=>setTab(id)}><Icon size={21} strokeWidth={2}/><span>{label}</span></button>)}</nav>
 <aside className="sidebar panel"><div className="panel-top"><span className="eyebrow">Customize your build</span><h2>Design options</h2></div><div className="desktop-options-menu"><nav className="desktop-section-nav" aria-label="Design sections">{tabs.map(([id,label,Icon])=><React.Fragment key={id}><button type="button" aria-expanded={tab===id} aria-controls={tab===id?'active-design-options':undefined} disabled={busy} className={'desktop-section-trigger'+(tab===id?' active':'')} onClick={()=>setTab(id)}><Icon size={21} strokeWidth={2}/><span>{label}</span></button></React.Fragment>)}</nav>{options}{tab==='review'&&<div id="contact" className="review-quote-footer"><button ref={quoteButton} type="button" className="primary" disabled={busy||!design} onClick={()=>openQuote()}>{ownerEdit?'Save changes':'Get Quote'}</button></div>}</div>
</aside></main></div>
 <dialog ref={resumeDialog} className="quote-dialog resume-dialog" aria-labelledby="resume-title" onCancel={e=>{e.preventDefault();setResumePrompt(false);resumeDialog.current.close();}}>
 <h2 id="resume-title">Welcome back!</h2><p>Your previous shed design is saved on this device. Would you like to continue it or start a new design?</p><div className="resume-actions"><button type="button" className="primary" onClick={()=>{setResumePrompt(false);resumeDialog.current.close();}}>Continue my design</button><button type="button" onClick={()=>{setState(structuredClone(freshDesign.current));setRenderUnlocked(false);lastRender.current=null;preparedImages.current=null;startedAt.current=Date.now();setTab('size');setResumePrompt(false);resumeDialog.current.close();}}>Start new design</button></div></dialog>
 <dialog ref={quoteDialog} className="quote-dialog" aria-labelledby="quote-dialog-title" onClose={()=>{if(!receiptOpen)quoteButton.current?.focus();}}>
 <button type="button" className="quote-close" aria-label="Close quote form" onClick={()=>quoteDialog.current.close()}>×</button>
 <form id="quote-contact" className="catalog-contact" onSubmit={submit}><h2 id="quote-dialog-title">{ownerEdit?'Save changes':'Get your quote'}</h2><p>{ownerEdit?'Review the contact information and save this quote.':'Tell us how to reach you about your design.'}</p><p>{ownerEdit?'Updates this quote without sending customer messages.':API_MODE==='live-test'?'Test mode: your design goes to a test account. No customer messages are sent.':'Send your design to Cape Fear Shed for a quote.'}</p>{['firstName','lastName','phone','email'].map(key=><label key={key}>{key.replace(/([A-Z])/g,' $1')}<input required type={key==='email'?'email':key==='phone'?'tel':'text'} autoComplete={key==='firstName'?'given-name':key==='lastName'?'family-name':key==='phone'?'tel':'email'} value={customer[key]} inputMode={key==='phone'?'tel':undefined} onChange={e=>setCustomer({...customer,[key]:e.target.value})}/></label>)}{['street','city','state','zip'].map(key=><label key={key}>{key}<input required inputMode={key==='zip'?'numeric':undefined} pattern={key==='zip'?'[0-9]{5}':undefined} value={customer.address[key]} onChange={e=>setCustomer({...customer,address:{...customer.address,[key]:e.target.value}})}/></label>)}<fieldset className="quote-uses"><legend>What will you use your shed for? *</legend><p className="help">Select all that apply.</p><div className="quote-use-options">{USE_CHOICES.map(([code,label])=><label key={code} className="quote-use-choice"><input type="checkbox" checked={uses.includes(code)} onChange={e=>setUses(e.target.checked?[...uses,code]:uses.filter(c=>c!==code))}/><span>{label}</span></label>)}</div></fieldset>{uses.includes('use-other')&&<label>Other shed use<input required value={usesOther} onChange={e=>setUsesOther(e.target.value)}/></label>}<label className="quote-source-field">How did you hear about us? *<select aria-label="How did you hear about us? *" required value={source.code||''} onChange={e=>setSource({code:e.target.value,other:'',referredBy:''})}><option value="" disabled>Select one</option>{SOURCE_CHOICES.map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>{source.code==='referral'&&<label>Who referred you? *<input required value={source.referredBy} onChange={e=>setSource({...source,referredBy:e.target.value})}/></label>}{source.code==='other'&&<label>How did you hear about us? Please specify *<input required value={source.other} onChange={e=>setSource({...source,other:e.target.value})}/></label>}<label>Additional info<textarea value={customer.notes} onChange={e=>setCustomer({...customer,notes:e.target.value})}/></label>{!ownerEdit&&<label className="accessory-choice"><input type="checkbox" required checked={customer.smsConsent} onChange={e=>setCustomer({...customer,smsConsent:e.target.checked})}/>I agree to receive text messages about my shed inquiry.</label>}<label className="catalog-honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={website} onChange={e=>setWebsite(e.target.value)}/></label><button type="submit" className="primary" disabled={busy||!design}>{busy?'Preparing design…':ownerEdit?'Save changes':'Send my design'}</button></form>
 {notice&&<p role="alert">{notice}</p>}
 </dialog>
 {!ownerEdit&&receiptOpen&&<SendReceipt ref={receiptHeading} sending={busy} firstName={customer.firstName} photo={photoJob?.signature===designSignature?photoJob:null} error={sendError} onRetry={()=>submit()}/>}

 </>;
}
