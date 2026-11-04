import React,{useEffect,useRef} from 'react';
export const OWNER_SAVE_STEPS={saving:'Saving your changes…',sending:'Sending pictures…',starting:'Starting the backyard photo…'};
export default function OwnerSaveReceipt({stage='saving',error='',onRetry}){
 const heading=useRef(null),done=stage==='done'&&!error;
 useEffect(()=>{heading.current?.focus();},[]);
 return <main className="send-receipt owner-save-receipt" aria-busy={!done&&!error}>
  <div className="send-receipt-content">
   <img className="send-logo" src={import.meta.env.BASE_URL+'brand/logo-transparent.png'} alt="Cape Fear Shed"/>
   <header className="send-status" role="status" aria-live="polite">
    <h1 ref={heading} tabIndex={-1}>{error?'Update needs attention':done?'✓ Updated':OWNER_SAVE_STEPS[stage]}</h1>
    <p>{error?'The update could not be completed.':done?'The new backyard photo will appear on the quote in about a minute.':'Please keep this window open while we finish.'}</p>
   </header>
   {!done&&!error&&<div className="owner-save-progress" role="progressbar" aria-label="Updating your design" aria-valuetext={OWNER_SAVE_STEPS[stage]}><span/></div>}
   {error?<><p className="owner-save-error" role="alert">{error}</p><button type="button" className="primary" onClick={onRetry}>Try again</button></>:<button type="button" className="primary" disabled={!done} onClick={()=>window.parent.postMessage({type:'cfs-close-preview'},window.location.origin)}>Close</button>}
  </div>
 </main>;
}
