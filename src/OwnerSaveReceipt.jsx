import React,{useEffect,useRef,useState} from 'react';
import {creepOwnerProgress} from './ownerSaveProgress.js';
import {holdOwnerSaveWakeLock} from './ownerWakeLock.js';
export const OWNER_SAVE_STEPS={saving:'Saving your changes…',sending:'Sending pictures…',starting:'Starting the backyard photo…'};
export default function OwnerSaveReceipt({stage='saving',progress=0,error='',onRetry}){
 const heading=useRef(null),done=stage==='done'&&!error;
 const [displayed,setDisplayed]=useState(progress),running=!done&&!error;
 const value=done?100:Math.max(displayed,progress,stage==='starting'?75:stage==='sending'?35:0);
 useEffect(()=>{
  if(!running)return;
  const timer=setInterval(()=>setDisplayed(current=>creepOwnerProgress(current,stage,progress)),500);
  return ()=>clearInterval(timer);
 },[running,stage,progress]);
 useEffect(()=>{if(running)return holdOwnerSaveWakeLock();},[running]);
 useEffect(()=>{heading.current?.focus();},[]);
 return <main className="send-receipt owner-save-receipt" aria-busy={!done&&!error}>
  <div className="send-receipt-content">
   <img className="send-logo" src={import.meta.env.BASE_URL+'brand/logo-transparent.png'} alt="Cape Fear Shed"/>
   <header className="send-status" role="status" aria-live="polite">
    <h1 ref={heading} tabIndex={-1}>{error?'Update needs attention':done?'✓ Updated':OWNER_SAVE_STEPS[stage]}</h1>
    <p>{error?'The update could not be completed.':done?'The new backyard photo will appear on the quote in about a minute.':'Please keep this window open while we finish.'}</p>
   </header>
   <div className={'send-progress owner-save-progress'+(error?' failed':'')} role="progressbar" aria-label="Updating your design" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-valuetext={error?'Update paused':done?'Updated':OWNER_SAVE_STEPS[stage]}><span style={{width:value+'%'}}/></div>
   {error?<><p className="owner-save-error" role="alert">{error}</p><button type="button" className="primary" onClick={onRetry}>Try again</button></>:<button type="button" className="primary" disabled={!done} onClick={()=>window.parent.postMessage({type:'cfs-close-preview'},window.location.origin)}>Close</button>}
  </div>
 </main>;
}
