export function holdOwnerSaveWakeLock(nav=globalThis.navigator,doc=globalThis.document){
 let stopped=false,lock=null,pending=false;
 const release=value=>{try{Promise.resolve(value?.release()).catch(()=>{});}catch{}};
 async function acquire(){
  if(stopped||pending||lock||!nav?.wakeLock?.request||doc?.visibilityState==='hidden')return;
  pending=true;
  try{
   const value=await nav.wakeLock.request('screen');
   if(stopped){release(value);return;}
   lock=value;
   value.addEventListener?.('release',()=>{if(lock===value)lock=null;},{once:true});
  }catch{/* Unsupported, denied or interrupted wake locks never block saving. */}
  finally{pending=false;}
 }
 const visible=()=>{if(doc?.visibilityState==='visible')acquire();};
 doc?.addEventListener?.('visibilitychange',visible);
 acquire();
 return ()=>{stopped=true;doc?.removeEventListener?.('visibilitychange',visible);release(lock);lock=null;};
}
