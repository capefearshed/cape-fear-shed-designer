import React,{useEffect,useRef,useState} from 'react';
const SETTINGS=[
 ['lawn','Open lawn','An everyday backyard with a healthy lawn, a simple fence, and a few mature trees.'],
 ['coastal','Coastal yard','A Wilmington, North Carolina backyard with sandy soil, patchy lawn, live oaks and a modest wood fence.'],
 ['garden','Garden setting','A suburban backyard with a tidy lawn, planted borders and a small gravel path.']
];
async function readPhoto(file){
 if(!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP photo. On iPhone, export HEIC photos as JPG first.');
 if(file.size>15*1024*1024)throw new Error('Choose a photo smaller than 15 MB.');
 const bitmap=await createImageBitmap(file,{imageOrientation:'from-image'});
 try{
  const scale=Math.min(1,1600/Math.max(bitmap.width,bitmap.height));
  const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
  canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/jpeg',.86);
 }finally{bitmap.close();}
}
export default function BackyardPreview({capture,design}){
 const [mode,setMode]=useState('sample'),[setting,setSetting]=useState('lawn'),[photo,setPhoto]=useState(''),[placement,setPlacement]=useState('');
 const [shot,setShot]=useState(''),[result,setResult]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ready,setReady]=useState(null);
 const controller=useRef(null),photoVersion=useRef(0);
 const signature=JSON.stringify(design);
 useEffect(()=>{let alive=true;fetch('/api/backyard-preview').then(r=>r.json()).then(d=>{if(alive)setReady(Boolean(d.available));}).catch(()=>{if(alive)setReady(false);});return()=>{alive=false;controller.current?.abort();};},[]);
 useEffect(()=>{setResult('');setShot('');setError('');controller.current?.abort();},[signature,mode,setting,photo,placement]);
 async function upload(event){const file=event.target.files?.[0];if(!file)return;const version=++photoVersion.current;setError('');try{const image=await readPhoto(file);if(version===photoVersion.current)setPhoto(image);}catch(e){if(version===photoVersion.current)setError(e.message);}event.target.value='';}
 function captureView(){try{const image=capture();setShot(image);setResult('');setError('');return image;}catch{setError('The shed view is not ready. Wait for the 3D model to load, then try again.');return null;}}
 async function generate(){
  if(busy)return;
  const shedImage=captureView();if(!shedImage)return;
  const request=new AbortController();controller.current=request;setBusy(true);
  try{
   const response=await fetch('/api/backyard-preview',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({shedImage,yardImage:mode==='photo'?photo:null,mode,setting,placement,design})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'The preview could not be created. Please try again.');
   if(!request.signal.aborted)setResult(data.image);
  }catch(e){if(e.name!=='AbortError')setError(e.message);}finally{if(controller.current===request){setBusy(false);controller.current=null;}}
 }
 return <section className="backyard-preview" aria-labelledby="backyard-title">
  <h3 id="backyard-title">See it in a backyard</h3>
  <p className="help">Use your own yard or choose a setting. Rotate and zoom the shed above to frame the view you want.</p>
  <div className="backyard-modes" role="group" aria-label="Backyard source">
   <button type="button" disabled={busy} aria-pressed={mode==='sample'} onClick={()=>setMode('sample')}>Sample backyard</button>
   <button type="button" disabled={busy} aria-pressed={mode==='photo'} onClick={()=>setMode('photo')}>My backyard photo</button>
  </div>
  {mode==='sample'?<div className="backyard-settings">{SETTINGS.map(([id,label])=><button type="button" key={id} disabled={busy} aria-pressed={setting===id} onClick={()=>setSetting(id)}><span aria-hidden="true">{id==='lawn'?'🌳':id==='coastal'?'🌾':'🌿'}</span>{label}</button>)}</div>:<>
   <label htmlFor="backyard-photo">Upload your backyard</label>
   <input id="backyard-photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={upload}/>
   <p className="help">Use a wide, well-lit photo with clear space for the shed. JPG, PNG or WebP, up to 15 MB.</p>
   {photo&&<div><img className="backyard-photo" src={photo} alt="Your selected backyard"/><button type="button" disabled={busy} onClick={()=>{photoVersion.current++;setPhoto('');}}>Remove photo</button></div>}
   <label htmlFor="backyard-placement">Where should the shed go? <span>(optional)</span></label>
   <textarea id="backyard-placement" maxLength={300} disabled={busy} value={placement} onChange={e=>setPlacement(e.target.value)} placeholder="For example: back right corner, beside the fence."/>
  </>}
  <button type="button" className="backyard-capture" disabled={busy} onClick={captureView}>Capture current shed view</button>
  {shot&&<img className="backyard-photo" src={shot} alt="Shed design captured from your current 3D view"/>}
  <p className="help">When you create a preview, your shed image and any uploaded yard photo are sent to AI image generation. The result is an illustration; details and placement may vary.</p>
  <button type="button" className="primary" disabled={busy||ready!==true||(mode==='photo'&&!photo)} onClick={generate}>{busy?'Creating your backyard preview…':'Create realistic preview'}</button>
  {ready===false&&<p className="help" role="status">Realistic preview generation is not available yet. You can choose a setting and capture your shed view now.</p>}
  {busy&&<><p role="status">This may take a couple of minutes. Keep this page open.</p><button type="button" onClick={()=>controller.current?.abort()}>Cancel</button></>}
  {error&&<p className="backyard-error" role="alert">{error}</p>}
  {result&&<div className="backyard-result"><img src={result} alt="AI visualization of your shed in the chosen backyard"/><a className="primary" href={result} download="cape-fear-shed-backyard.png">Download backyard preview</a></div>}
 </section>;
}
