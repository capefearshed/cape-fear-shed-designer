import React,{useEffect,useRef,useState} from 'react';
import {BACKYARD_SETTINGS} from './backyardSettings.js';
export default function BackyardPreview({capture,design,saveDesign}){
 const [setting,setSetting]=useState('garden');
 const [physicalSize,setPhysicalSize]=useState(null);
 const [shot,setShot]=useState(''),[result,setResult]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(null);
 const [opened,setOpened]=useState(false),[step,setStep]=useState(1),[adjusting,setAdjusting]=useState(false);
 const dialog=useRef(null),controller=useRef(null);
 const signature=JSON.stringify(design);
 useEffect(()=>{let alive=true;fetch('/api/backyard-preview').then(r=>r.json()).then(d=>{if(alive)setReady(Boolean(d.available));}).catch(()=>{if(alive)setReady(false);});return()=>{alive=false;controller.current?.abort();};},[]);
 useEffect(()=>{setResult('');setShot('');setError('');controller.current?.abort();},[signature,setting]);
 useEffect(()=>{if(opened&&!dialog.current.open)dialog.current.showModal();else if(!opened&&dialog.current.open)dialog.current.close();},[opened]);
 useEffect(()=>{dialog.current?.scrollTo({top:0,behavior:'instant'});},[step]);
 function preview(auto=true){try{const captured=capture(auto);setShot(captured.image);setPhysicalSize(captured.physicalSize);setResult('');setError('');setStep(2);setAdjusting(false);setOpened(true);}catch{setError('The shed view is not ready. Wait for the model to load, then try again.');}}
 function downloadView(){try{const captured=capture(true),link=document.createElement('a');link.href=captured.image;link.download='cape-fear-shed-design-view.jpg';link.click();setError('');}catch{setError('The shed is still loading. Please try downloading the view again.');}}
 function start(){setStep(1);setError('');setAdjusting(false);setOpened(true);}
 async function generate(){
  if(busy||!shot)return;
  const request=new AbortController();controller.current=request;setBusy(true);setError('');
  try{
   const response=await fetch('/api/backyard-preview',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({shedImage:shot,mode:'sample',setting,placement:'',design:{...design,physicalSize},fenceHeightFt:6})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'The preview could not be created. Please try again.');
   if(!request.signal.aborted){setResult(data.image);setStep(3);}
  }catch(e){if(e.name!=='AbortError')setError(e.message);}finally{if(controller.current===request){setBusy(false);controller.current=null;}}
 }
 const output=result&&<div className="backyard-result"><img src={result} alt="AI visualization of your designed shed in a landscaped backyard"/><a className="primary" href={result} download="cape-fear-shed-backyard.png">Download backyard photo</a></div>;
 return <section className="backyard-preview" aria-labelledby="backyard-title">
  <h3 id="backyard-title">See it in a backyard</h3>
  <p className="help">Create a realistic photo of your shed with landscaping and a pathway to the door. We’ll guide you through it and automatically frame the full shed.</p>
  {adjusting?<><p role="status">Rotate and zoom the shed above. Keep the entire shed visible, including the door.</p><button type="button" className="primary" onClick={()=>preview(false)}>Use this view and continue</button><button type="button" onClick={()=>preview(true)}>Use automatic view</button></>:<button type="button" className="primary" disabled={busy} onClick={start}>Create backyard photo</button>}
  <details className="personal-backyard-request"><summary>Want to see it in your actual backyard?</summary><p className="help">Cape Fear Shed can help you plan a personal backyard preview. Send us a well-lit yard photo and the shed view you can download below. We’ll discuss placement, dimensions and any questions before creating your image.</p><p className="help">Download your design file too, so we have a record of your exact selections. Downloading does not send it to us automatically.</p><button type="button" onClick={saveDesign}>Download my design file</button><button type="button" onClick={downloadView}>Download shed view</button><a className="primary" href="sms:+19108398589">Text Cape Fear Shed</a><p className="help">Attach your backyard photo and downloaded shed view to your text. Call or text (910) 839-8589.</p></details>
  {!opened&&error&&<p role="alert" className="backyard-error">{error}</p>}{!opened&&output}
  <dialog ref={dialog} className="backyard-dialog" aria-labelledby="backyard-dialog-title" onCancel={e=>{if(busy)e.preventDefault();else setOpened(false);}} onClose={()=>setOpened(false)}>
   <div className="backyard-dialog-head"><h2 id="backyard-dialog-title">Your shed, brought to life</h2><button type="button" disabled={busy} aria-label="Close backyard photo setup" onClick={()=>setOpened(false)}>×</button></div>
   <ol className="backyard-steps" aria-label="Photo steps"><li aria-current={step===1?'step':undefined}>1. Setting</li><li aria-current={step===2?'step':undefined}>2. Shed view</li><li aria-current={step===3?'step':undefined}>3. Your photo</li></ol>
   {step===1&&<>
    <h3>Choose your backyard</h3><p className="help">Choose one of our three Wilmington backyard settings. Next, we’ll frame the full shed, using an eye-level angle that prioritizes the door and other features. You can adjust the angle before creating your image.</p>
    <p className="help">Three Wilmington-inspired backyards. Choose a scene below—browsing these previews does not generate an image.</p><div className="backyard-scene-cards">{Object.entries(BACKYARD_SETTINGS).map(([id,scene])=><button type="button" key={id} aria-pressed={setting===id} onClick={()=>setSetting(id)}><img src={scene.thumbnail} alt="" width="480" height="320"/><span><strong>{scene.label}{setting===id?' ✓':''}</strong><small>{scene.description}</small></span></button>)}</div><figure className="backyard-scene-preview"><img src={BACKYARD_SETTINGS[setting].image} alt={BACKYARD_SETTINGS[setting].description}/><figcaption>Your selected backdrop: {BACKYARD_SETTINGS[setting].label}. Your shed will be placed toward the back of the yard and framed prominently. Lighting, planting and pathway may adapt to fit.</figcaption></figure>
    <button type="button" className="primary" onClick={()=>preview(true)}>Next: Preview shed view</button>
   </>}
   {step===2&&<><h3>Check your shed view</h3><p className="help">This is the view we’ll use for your backyard photo. Check that your shed and door are visible.</p>{shot&&<img className="backyard-photo" src={shot} alt="Shed angle selected for your backyard photo"/>}
    <div className="backyard-modes"><button type="button" disabled={busy} onClick={()=>{setAdjusting(true);setOpened(false);}}>Adjust view</button><button type="button" disabled={busy} onClick={()=>preview(true)}>Reset to automatic view</button></div>
    <p className="help">We’ll add natural lighting, landscaping and a pathway to your door. Your shed image and selected backdrop are sent to AI image generation. This is an illustration; details and placement may vary.</p>
    <button type="button" className="primary" disabled={busy||ready!==true} onClick={generate}>{busy?'Creating your backyard photo…':'Create this backyard photo'}</button>
    {ready===false&&<p role="status">Backyard photo generation is not activated yet.</p>}
    {busy?<p role="status">This may take a couple of minutes. Keep this page open.</p>:<button type="button" onClick={()=>{setStep(1);setError('');}}>Back to setting</button>}
   </>}
   {step===3&&<><h3>Your backyard photo is ready</h3>{output}<button type="button" onClick={()=>setOpened(false)}>Done</button></>}
   {error&&<p className="backyard-error" role="alert">{error}</p>}
  </dialog>
 </section>;
}
