import React,{useEffect,useRef,useState} from 'react';
import {prepareBackyardPhoto} from './prepareBackyardPhoto.js';
const SETTINGS=[['lawn','Open lawn'],['coastal','Coastal yard'],['garden','Garden setting']];
export default function BackyardPreview({capture,design}){
 const [mode,setMode]=useState('sample'),[setting,setSetting]=useState('garden'),[photo,setPhoto]=useState(''),[placement,setPlacement]=useState('');
 const [physicalSize,setPhysicalSize]=useState(null),[fenceHeight,setFenceHeight]=useState('6');
 const [shot,setShot]=useState(''),[result,setResult]=useState(''),[busy,setBusy]=useState(false),[uploading,setUploading]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(null);
 const [opened,setOpened]=useState(false),[step,setStep]=useState(1),[adjusting,setAdjusting]=useState(false);
 const dialog=useRef(null),controller=useRef(null),photoVersion=useRef(0);
 const signature=JSON.stringify(design);
 useEffect(()=>{let alive=true;fetch('/api/backyard-preview').then(r=>r.json()).then(d=>{if(alive)setReady(Boolean(d.available));}).catch(()=>{if(alive)setReady(false);});return()=>{alive=false;controller.current?.abort();};},[]);
 useEffect(()=>{setResult('');setShot('');setError('');controller.current?.abort();},[signature,mode,setting,photo,placement,fenceHeight]);
 useEffect(()=>{if(opened&&!dialog.current.open)dialog.current.showModal();else if(!opened&&dialog.current.open)dialog.current.close();},[opened]);
 useEffect(()=>{dialog.current?.scrollTo({top:0,behavior:'instant'});},[step]);
 async function upload(event){
  const input=event.target,file=input.files?.[0];if(!file)return;const version=++photoVersion.current;
  setError('');setUploading(true);setPhoto('');
  try{const image=await prepareBackyardPhoto(file);if(version===photoVersion.current)setPhoto(image);}catch{if(version===photoVersion.current)setError('We could not read this photo. Please try a different photo or a screenshot of it.');}
  finally{if(version===photoVersion.current)setUploading(false);input.value='';}
 }
 function preview(auto=true){try{const captured=capture(auto);setShot(captured.image);setPhysicalSize(captured.physicalSize);setResult('');setError('');setStep(2);setAdjusting(false);setOpened(true);}catch{setError('The shed view is not ready. Wait for the model to load, then try again.');}}
 function start(){setStep(1);setError('');setAdjusting(false);setOpened(true);}
 async function generate(){
  if(busy||!shot)return;
  const request=new AbortController();controller.current=request;setBusy(true);setError('');
  try{
   const response=await fetch('/api/backyard-preview',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({shedImage:shot,yardImage:mode==='photo'?photo:null,mode,setting,placement,design:{...design,physicalSize},fenceHeightFt:Number(fenceHeight)})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'The preview could not be created. Please try again.');
   if(!request.signal.aborted){setResult(data.image);setStep(3);}
  }catch(e){if(e.name!=='AbortError')setError(e.message);}finally{if(controller.current===request){setBusy(false);controller.current=null;}}
 }
 const output=result&&<div className="backyard-result"><img src={result} alt="AI visualization of your designed shed in a landscaped backyard"/><a className="primary" href={result} download="cape-fear-shed-backyard.png">Download backyard photo</a></div>;
 return <section className="backyard-preview" aria-labelledby="backyard-title">
  <h3 id="backyard-title">See it in a backyard</h3>
  <p className="help">Create a realistic photo of your shed with landscaping and a pathway to the door. We’ll guide you through it and automatically frame the full shed.</p>
  {adjusting?<><p role="status">Rotate and zoom the shed above. Keep the entire shed visible, including the door.</p><button type="button" className="primary" onClick={()=>preview(false)}>Use this view and continue</button><button type="button" onClick={()=>preview(true)}>Use automatic view</button></>:<button type="button" className="primary" disabled={busy} onClick={start}>Create backyard photo</button>}
  {!opened&&error&&<p role="alert" className="backyard-error">{error}</p>}{!opened&&output}
  <dialog ref={dialog} className="backyard-dialog" aria-labelledby="backyard-dialog-title" onCancel={e=>{if(busy||uploading)e.preventDefault();else setOpened(false);}} onClose={()=>setOpened(false)}>
   <div className="backyard-dialog-head"><h2 id="backyard-dialog-title">Your shed, brought to life</h2><button type="button" disabled={busy||uploading} aria-label="Close backyard photo setup" onClick={()=>setOpened(false)}>×</button></div>
   <ol className="backyard-steps" aria-label="Photo steps"><li aria-current={step===1?'step':undefined}>1. Setting</li><li aria-current={step===2?'step':undefined}>2. Shed view</li><li aria-current={step===3?'step':undefined}>3. Your photo</li></ol>
   {step===1&&<>
    <h3>Choose your backyard</h3><p className="help">Use a sample setting or your own yard. Next, we’ll frame the full shed, using an eye-level angle that prioritizes the door and other features. You can adjust the angle before creating your image.</p>
    <div className="backyard-modes" role="group" aria-label="Backyard source"><button type="button" disabled={uploading} aria-pressed={mode==='sample'} onClick={()=>setMode('sample')}>Sample backyard</button><button type="button" disabled={uploading} aria-pressed={mode==='photo'} onClick={()=>setMode('photo')}>My backyard photo</button></div>
    {mode==='sample'?<div className="backyard-settings">{SETTINGS.map(([id,label])=><button type="button" key={id} aria-pressed={setting===id} onClick={()=>setSetting(id)}>{label}</button>)}</div>:<>
     <label htmlFor="backyard-photo">Choose a backyard photo</label><input id="backyard-photo" type="file" accept="image/*,.heic,.heif" disabled={uploading} onChange={upload}/>
     <p className="help">Choose directly from your phone’s photo library. Large photos resize automatically. Use a well-lit photo with clear space for the shed.</p>
     {uploading&&<p role="status">Preparing your photo…</p>}
     {photo&&<div><img className="backyard-photo" src={photo} alt="Your selected backyard"/><button type="button" onClick={()=>{photoVersion.current++;setPhoto('');}}>Remove photo</button></div>}
     <label htmlFor="backyard-fence-height">Fence height in feet (if visible)</label><input id="backyard-fence-height" type="number" min="2" max="12" step=".5" value={fenceHeight} onChange={e=>setFenceHeight(e.target.value)}/><p className="help">We assume a 6-foot fence. Change this if you know its height to help the shed fit the scale of your yard. This is a visual estimate, not a site measurement.</p><label htmlFor="backyard-placement">Where should the shed go? (optional)</label><textarea id="backyard-placement" maxLength={300} value={placement} onChange={e=>setPlacement(e.target.value)} placeholder="For example: back right corner, beside the fence."/>
    </>}
    <button type="button" className="primary" disabled={uploading||(mode==='photo'&&(!photo||Number(fenceHeight)<2||Number(fenceHeight)>12))} onClick={()=>preview(true)}>Next: Preview shed view</button>
   </>}
   {step===2&&<><h3>Check your shed view</h3><p className="help">This is the view we’ll use for your backyard photo. Check that your shed and door are visible.</p>{shot&&<img className="backyard-photo" src={shot} alt="Shed angle selected for your backyard photo"/>}
    <div className="backyard-modes"><button type="button" disabled={busy} onClick={()=>{setAdjusting(true);setOpened(false);}}>Adjust view</button><button type="button" disabled={busy} onClick={()=>preview(true)}>Reset to automatic view</button></div>
    <p className="help">We’ll add natural lighting, landscaping and a pathway to your door. Your shed image and any yard photo are sent to AI image generation. This is an illustration; details and placement may vary.</p>
    <button type="button" className="primary" disabled={busy||ready!==true} onClick={generate}>{busy?'Creating your backyard photo…':'Create this backyard photo'}</button>
    {ready===false&&<p role="status">Backyard photo generation is not activated yet.</p>}
    {busy?<p role="status">This may take a couple of minutes. Keep this page open.</p>:<button type="button" onClick={()=>{setStep(1);setError('');}}>Back to setting</button>}
   </>}
   {step===3&&<><h3>Your backyard photo is ready</h3>{output}<button type="button" onClick={()=>setOpened(false)}>Done</button></>}
   {error&&<p className="backyard-error" role="alert">{error}</p>}
  </dialog>
 </section>;
}
