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
const photoError=(stage,message)=>Object.assign(new Error(message),{stage});
const failed=error=>({status:'failed',stage:error.stage||'start',error:error.message||PHOTO_START_ERROR});
// One awaited dispatch for customers, owner edits and render-only saves. It ends
// only after the layers and the photo POST have completed, before any iframe ack.
export async function startPhoto(photo,body,{signal,start=requestPhoto,layerImages,upload=uploadPhotoLayers,onStage=()=>{}}={}){
 if(!photo?.id||!photo?.token)throw photoError('start',PHOTO_START_ERROR);
 signal?.throwIfAborted();
 if(layerImages){
  try{
   const layers=await upload(photo,layerImages,{signal});
   const {shedCutout,...request}=body;body={...request,layers};
  }catch{if(signal?.aborted)signal.throwIfAborted();throw photoError('upload',PHOTO_UPLOAD_ERROR);}
 }
 signal?.throwIfAborted();
 let result;
 onStage();
 try{result=photoResult(await start(photo,body,{signal}));}
 catch{if(signal?.aborted)signal.throwIfAborted();throw photoError('start',PHOTO_START_ERROR);}
 if(result.status==='failed')throw photoError('job',PHOTO_JOB_ERROR);
 return result;
}
const pause=signal=>new Promise((resolve,reject)=>{
 if(signal.aborted){reject(signal.reason);return;}
 const abort=()=>{clearTimeout(timer);reject(signal.reason);};
 const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},5000);
 signal.addEventListener('abort',abort,{once:true});
});
export async function followPhoto(photo,body,{signal,start=requestPhoto,poll=pollPhoto,wait=pause,layerImages,upload=uploadPhotoLayers,onStarted=()=>{}}={}){
 let result;
 try{result=await startPhoto(photo,body,{signal,start,layerImages,upload});onStarted(true);}
 catch(error){
  if(signal?.aborted){onStarted(false);return {status:'failed',stage:'canceled'};}
  const failure=failed(error);onStarted(false,failure);
  // Upload failures and missing credentials cannot have started a worker.
  if(error.stage!=='start'||!photo?.id||!photo?.token)return failure;
  result={status:'working'};
 }
 while(!signal.aborted&&result.status==='working'){
  await wait(signal);
  if(signal.aborted)break;
  try{result=photoResult(await poll(photo,{signal}));}catch{/* The saved quote survives temporary network errors. */}
 }
 return signal.aborted?{status:'failed',stage:'canceled'}:result.status==='failed'?{...result,stage:'job',error:PHOTO_JOB_ERROR}:result;
}
