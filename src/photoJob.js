import {requestPhoto,pollPhoto} from './api.js';
export function photoResult(result){
 if(result?.status==='failed')return {status:'failed'};
 const image=result?.image||result?.url;
 if(result?.status==='ready'&&typeof image==='string'&&/^(data:image\/(png|jpeg);base64,|https?:\/\/|\/)/.test(image))return {status:'ready',image};
 return {status:'working'};
}
const pause=signal=>new Promise((resolve,reject)=>{
 if(signal.aborted){reject(signal.reason);return;}
 const abort=()=>{clearTimeout(timer);reject(signal.reason);};
 const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},5000);
 signal.addEventListener('abort',abort,{once:true});
});
export async function followPhoto(photo,body,{signal,start=requestPhoto,poll=pollPhoto,wait=pause}={}){
 if(!photo?.id||!photo?.token)return {status:'failed'};
 let result;
 try{result=photoResult(await start(photo,body,{signal}));}catch{result={status:'working'};}
 while(!signal.aborted&&result.status==='working'){
  await wait(signal);
  if(signal.aborted)break;
  try{result=photoResult(await poll(photo,{signal}));}catch{/* The saved quote survives temporary network errors. */}
 }
 return signal.aborted?{status:'failed'}:result;
}
