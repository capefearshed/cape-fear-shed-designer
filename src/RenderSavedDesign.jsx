import React,{useEffect,useRef,useState,useMemo} from 'react';
import DesignerViewer from './DesignerViewer.jsx';
import {loadRenderDesign} from './api.js';
import {applyRenderChanges} from './renderChanges.js';
import {EXPIRED_LINK} from './savedDesign.js';
import {modelDesign} from './modelBridge.js';
import {submitRenderedDesign} from './renderSubmission.js';
import OwnerSaveReceipt from './OwnerSaveReceipt.jsx';
const post=message=>{if(window.parent!==window)window.parent.postMessage(message,window.location.origin);};
export default function RenderSavedDesign({catalog,token}){
 const [loaded,setLoaded]=useState(null),[error,setError]=useState(''),[ready,setReady]=useState(false),[stage,setStage]=useState('saving'),[progress,setProgress]=useState(0),[retry,setRetry]=useState(0);
 const viewer=useRef(null),started=useRef(false),controller=useRef(null),attempt=useRef({});
 useEffect(()=>{let active=true;(async()=>{try{
  if(!token)throw new Error(EXPIRED_LINK);
  const response=await loadRenderDesign(token);
  // Tokens are authorized by the server; tolerate owner-render or the shared owner-edit mode.
  if(!['owner-edit','owner-render'].includes(response.mode))throw new Error('This link cannot update pictures.');
  const fitted=applyRenderChanges(catalog,response);
  if(!active)return;
  if(fitted.conflicts.length){post({type:'cfs-render-conflict',conflicts:fitted.conflicts});setError('This design needs attention. Open Edit design to finish.');return;}
  setLoaded({...response,state:fitted.state});
 }catch(e){if(active)setError(e.message);}})();return()=>{active=false;};},[catalog,token]);
 useEffect(()=>()=>controller.current?.abort(),[]);
 const model=useMemo(()=>loaded?modelDesign(catalog,loaded.state):null,[catalog,loaded]);
 useEffect(()=>{
  if(!loaded||!ready||started.current)return;
  started.current=true;
  (async()=>{try{
   // Keep the canvas visible and laid out throughout both normal capture paths.
   await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   controller.current=new AbortController();
   const response=await submitRenderedDesign({catalog,loaded,token,viewer:viewer.current,model,signal:controller.current.signal,attempt:attempt.current,onStage:setStage,onProgress:setProgress});
   setStage('done');post({type:'cfs-render-done',quoteNumber:response.quoteNumber??loaded.quoteNumber});
  }catch(e){setError(e.message);}})();
 },[loaded,ready,catalog,model,token,retry]);
 return <><OwnerSaveReceipt stage={stage} progress={progress} error={error} onRetry={()=>{if(!loaded||!ready){window.location.reload();return;}setError('');setStage('saving');started.current=false;setRetry(value=>value+1);}}/>{model&&<div className="render-saved-design" inert="" aria-hidden="true"><div className="render-visible-canvas"><DesignerViewer ref={viewer} design={model} tab="review" wall="front" interactive={false} onSelect={()=>{}} onReady={()=>setReady(true)} onError={()=>setError('Preparing pictures failed. Open the app in a browser with WebGL enabled and try again.')}/></div></div>}</>;
}
