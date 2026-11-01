import React,{forwardRef,useEffect,useRef,useState} from 'react';
import {Check,LoaderCircle} from 'lucide-react';
import PhotoShare from './PhotoShare.jsx';

const steps=[['We look over your design','We check sizes, doors and windows.'],['Your quote comes by text','Approve it or ask for changes right from your phone.'],['We pick your build date','Built on site by our crew.']];
export default forwardRef(function SendReceipt({sending,firstName,photo,error,onRetry},ref){
 const video=useRef(null),[reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches),[elapsed,setElapsed]=useState(0),[poster,setPoster]=useState(false),[loaded,setLoaded]=useState(false);
 const ready=photo?.status==='ready'&&loaded,delayed=photo?.status==='failed'||elapsed>=180000;
 const base=import.meta.env.BASE_URL;
 useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>setReduced(media.matches);media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
 useEffect(()=>{if(sending||error)return;const start=Date.now(),timer=setInterval(()=>setElapsed(Date.now()-start),500);return()=>clearInterval(timer);},[sending,error]);
 useEffect(()=>{const player=video.current;if(!player)return;if(reduced||delayed||ready){player.pause();return;}player.play()?.catch(()=>setPoster(true));},[reduced,delayed,ready]);
 const progress=Math.min(90,8+82*(1-Math.exp(-elapsed/45000)));
 return <main ref={ref} tabIndex={-1} className="send-receipt" aria-busy={sending}>
  <div className="send-receipt-content">
   <img className="send-logo" src={base+'brand/logo-transparent.png'} alt="Cape Fear Shed"/>
   <header className="send-status" role="status" aria-live="polite">
    <div className={'send-status-icon'+(sending?' sending':'')} aria-hidden="true">{sending?<LoaderCircle size={48}/>:<Check size={30} strokeWidth={4}/>}</div>
    <h1>{error?'Your design hasn’t been sent yet.':sending?'Sending your design…':firstName?.trim()?`Got it, ${firstName.trim()}!`:'Got it!'}</h1>
    <p>{error?'Please try sending your design again.':sending?'Just a few seconds. Please keep this page open.':'Your design is in. Our team will be in touch with you shortly.'}</p>
   </header>
   <div className={'send-picture'+(ready?' photo-ready':'')}>
    <video ref={video} muted loop playsInline preload="auto" poster={base+'animations/shed-build-poster.jpg'} style={{visibility:reduced||poster?'hidden':undefined}} onError={()=>setPoster(true)}><source src={base+'animations/shed-build.mp4'} type="video/mp4"/></video>
    {(reduced||poster)&&<img className="send-poster" src={base+'animations/shed-build-poster.jpg'} alt="Your shed being built"/>}
    {photo?.status==='ready'&&<img className={'send-photo'+(loaded?' loaded':'')} src={photo.image} alt="Your shed in a landscaped backyard" onLoad={()=>setLoaded(true)} onError={()=>{setLoaded(false);setElapsed(180000);}}/>}
   </div>
   <div className="send-photo-status" style={{visibility:sending?'hidden':undefined}} aria-live="polite">
    {error?<><p role="alert">{error}</p><button type="button" onClick={onRetry}>Try sending again</button></>:ready?<><PhotoShare image={photo.image}/><p className="send-photo-note">This photo will also be on your quote.</p></>:delayed?<p>Your photo is taking longer than usual. We'll include it with your quote.</p>:<>
     <div className="send-progress-label"><strong>Building your photo…</strong><span>about a minute</span></div>
     <div className="send-progress" role="progressbar" aria-label="Building your photo" aria-valuetext="Building your photo"><span style={{width:progress+'%'}}/></div>
     <p>Stay to see your shed in a backyard. If you leave, the photo will still come with your quote.</p>
    </>}
   </div>
   <section className="send-next" style={{opacity:sending ? .55 : 1}}><h2>What happens next</h2><ol>{steps.map(([title,detail],index)=><li key={title}><span className="send-step">{index+1}</span><div><h3>{title}</h3><p>{detail}</p></div></li>)}</ol></section>
   <footer className="send-contact" style={{opacity:sending ? .55 : 1}}><p>Questions? We're happy to help.</p><div className="send-contact-buttons"><a href="tel:+19108398589">Call</a><a href="sms:+19108398589">Text</a></div><p className="send-contact-details">910-839-8589 · <a href="mailto:info@capefearshed.com">info@capefearshed.com</a></p></footer>
  </div>
 </main>;
});
