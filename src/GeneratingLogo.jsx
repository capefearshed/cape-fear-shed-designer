import React,{useEffect,useRef,useState} from 'react';
export default function GeneratingLogo({title='Hang tight…',message='Our build crew is putting the finishing touches on your custom shed.'}){
 const video=useRef(null),[fallback,setFallback]=useState(false);
 const base=import.meta.env.BASE_URL+'animations/';
 useEffect(()=>{
  const player=video.current,motion=window.matchMedia('(prefers-reduced-motion: reduce)');let disposed=false;
  function sync(){
   if(motion.matches||document.hidden){player.pause();return;}
   player.play()?.catch(()=>{if(!disposed)setFallback(true);});
  }
  motion.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  return()=>{disposed=true;player.pause();motion.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);};
 },[]);
 return <div className="generation-overlay" role="status" aria-live="polite"><div className="generation-overlay-card">
  <strong>{title}</strong>
  <div className={'generation-build-animation'+(fallback?' use-poster':'')} aria-hidden="true">
   <video ref={video} muted loop playsInline preload="auto" poster={base+'shed-build-poster.jpg'} onError={()=>setFallback(true)}>
    <source src={base+'shed-build.mp4'} type="video/mp4"/>
   </video>
   <img src={base+'shed-build-poster.jpg'} alt=""/>
  </div>
  <p>{message}</p>
 </div></div>;
}
