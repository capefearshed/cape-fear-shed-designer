import {requestPhoto,pollPhoto,uploadPhotoLayers} from './api.js';
export const PHOTO_UPLOAD_ERROR='Your design was saved, but the photo layers could not be uploaded. Your backyard photo has not started. Please contact our team for help.';
export const PHOTO_START_ERROR='Your design was saved, but we could not confirm that the backyard photo request was sent. Please keep this page open or contact our team for help.';
export const PHOTO_JOB_ERROR='Your design was saved, but the backyard photo could not be created. Please contact our team for help.';
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
export async function followPhoto(photo,body,{signal,start=requestPhoto,poll=pollPhoto,wait=pause,layerImages,upload=uploadPhotoLayers,onStarted=()=>{}}={}){
 if(!photo?.id||!photo?.token){const failure={status:'failed',stage:'start',error:PHOTO_START_ERROR};onStarted(false,failure);return failure;}
 if(signal?.aborted){onStarted(false);return {status:'failed'};}
 if(layerImages){
  try{
   const layers=await upload(photo,layerImages,{signal});
   const {shedCutout,...request}=body;body={...request,layers};
  }catch{const failure={status:'failed',stage:signal?.aborted?'canceled':'upload',error:PHOTO_UPLOAD_ERROR};onStarted(false,failure);return failure;}
 }
 let result;
 try{result=photoResult(await start(photo,body,{signal}));onStarted(result.status!=='failed',result.status==='failed'?{...result,stage:'job',error:PHOTO_JOB_ERROR}:undefined);}catch{onStarted(false,{status:'failed',stage:'start',error:PHOTO_START_ERROR});result={status:'working'};}
 while(!signal.aborted&&result.status==='working'){
  await wait(signal);
  if(signal.aborted)break;
  try{result=photoResult(await poll(photo,{signal}));}catch{/* The saved quote survives temporary network errors. */}
 }
 return signal.aborted?{status:'failed',stage:'canceled'}:result.status==='failed'?{...result,stage:'job',error:PHOTO_JOB_ERROR}:result;
}
