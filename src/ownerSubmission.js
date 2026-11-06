import {submitDesign,pollPhoto,uploadPhotoLayers} from './api.js';
import {startPhoto,PHOTO_JOB_ERROR} from './photoJob.js';
// Keep the successful save and uploaded layers for photo-only retries.
export async function submitOwnerDesign(body,{photoRequest,layerImages,signal,onStage=()=>{},onProgress=()=>{},attempt={}},{submit=submitDesign,photo=startPhoto,upload=uploadPhotoLayers,poll=pollPhoto}={}){
 signal?.throwIfAborted();
 let stage='saving';
 try{
  if(!attempt.response){
   onStage(stage);
   const response=await submit(body);
   if(response?.ok!==true&&response?.success!==true)throw new Error('The design could not be saved.');
   attempt.response=response;
   onProgress(35);
  }
  const response=attempt.response;
  stage='starting';
  if(attempt.postAttempted){
   onStage(stage);onProgress(75);
   const result=await poll(response.photo,{signal});
   if(result.status==='failed')throw new Error(PHOTO_JOB_ERROR);
   if(['working','ready'].includes(result.status)){onProgress(100);return response;}
   if(result.status!=='waiting')throw new Error('Could not confirm the backyard photo status. Please try again.');
  }
  stage='sending';onStage(stage);
  await photo(response.photo,photoRequest,{signal,layerImages,
   upload:async(job,images,options)=>{
    if(!attempt.layers)attempt.layers=await upload(job,images,{...options,onUpload:(finished,total)=>onProgress(35+40*finished/total)});
    onProgress(75);
    return attempt.layers;
   },
   onStage:()=>{stage='starting';onStage(stage);onProgress(75);attempt.postAttempted=true;}
  });
  onProgress(100);
  return response;
 }catch(error){
  const label=stage==='saving'?'Saving your changes failed':stage==='sending'?'Sending pictures failed':'Starting the backyard photo failed';
  throw new Error(label+': '+error.message,{cause:error});
 }
}
