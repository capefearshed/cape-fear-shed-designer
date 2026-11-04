import {validateOwnerContact} from './ownerContact.js';
import {isTestChannel} from './deploymentChannel.js';
import {trackDesignSubmitted} from './leadAnalytics.js';
import {editorSnapshot} from './editorSnapshot.js';
import {EXPIRED_LINK} from './savedDesign.js';
import {uploadPhotoLayers as uploadLayers} from './photoLayerUpload.js';
import {photoDesignConstraints} from './photoDesignRules.js';
import {PHOTO_PATH_RULE} from './backyardSettings.js';
import {IMAGE_VIEWS,TECHNICAL_VIEWS} from './submissionCapture.js';
import {applyApprovedColors} from './colorPalette.js';
import catalog from './catalog.sample.json' with {type:'json'};

// /design/ on the app domain uses same-origin URLs; previews call the CORS-enabled app.
export const API_BASE=import.meta.env?.VITE_API_BASE??(typeof location!=='undefined'&&location.hostname==='app.capefearshed.com'?'':'https://app.capefearshed.com');
export const API_MODE=import.meta.env?.VITE_DESIGNER_STUB==='true'?'stub':'live-test';
export const MAX_SUBMISSION_BYTES=3900000;
export const SEND_ERROR='Something went wrong sending your design. Please try again or text us at 910-839-8589.';
async function request(action,{method='GET',body,query={},signal}={}){
 try{
  const response=await fetch(API_BASE+'/api/form?'+new URLSearchParams({designer:action,...query}),{method,signal,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  const ownerRequest=query.edit!==undefined||query.render!==undefined||body?.renderToken||body?.editToken;
  if(!response.ok){
   if(ownerRequest){
    const detail=await Promise.resolve().then(()=>response.json()).catch(()=>({}));
    const error=new Error(response.status===401?EXPIRED_LINK:detail.message||detail.error||SEND_ERROR);
    error.ownerLink=true;error.status=response.status;throw error;
   }
   throw new Error(SEND_ERROR);
  }
  const data=await response.json();if(action==='submit'&&data.ok!==true)throw new Error(SEND_ERROR);return data;
 }catch(error){if(error.ownerLink)throw error;throw new Error(SEND_ERROR);}
}
export async function getCatalog(){
 if(API_MODE==='stub')return applyApprovedColors(structuredClone(catalog));
 return applyApprovedColors(await request('catalog',{query:isTestChannel()?{channel:'test'}:{}}));
}
export function submissionBytes(design){return new TextEncoder().encode(JSON.stringify(design)).length;}
export function validateCustomer(customer){
 const required=[customer.firstName,customer.lastName,customer.phone,customer.email,customer.address?.street,customer.address?.city,customer.address?.zip];
 if(required.some(v=>!String(v||'').trim()))return 'Please complete your name, mobile phone, email and address.';
 if(customer.phone.replace(/\D/g,'').length!==10)return 'Enter a 10-digit mobile phone number.';
 if(!/^\d{5}$/.test(customer.address.zip))return 'Enter a 5-digit ZIP code.';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email))return 'Enter a valid email address.';
 return '';
}
export async function submitDesign(design){
 if(isTestChannel())design={...design,channel:'test'};
 if(design.editorState)editorSnapshot(design.editorState);
 const validation=design.editToken?validateOwnerContact(design.customer||{}):validateCustomer(design.customer||{});if(validation)throw new Error(validation);
 if(!Array.isArray(design.images)||design.images.length!==9||design.images.some((image,i)=>image.view!==[...IMAGE_VIEWS,...TECHNICAL_VIEWS][i]||(!(i===0&&image.pending===true&&image.source==='auto'&&image.data===undefined)&&(image.type!=='image/jpeg'||!image.data?.startsWith('data:image/jpeg;base64,')))))throw new Error('The design needs a render, four wall pictures and four technical elevations before it can be sent.');
 if(design.images.slice(5).some(image=>image.hidden!==true||!Number.isFinite(image.pxPerFt)||image.pxPerFt<=0||!Number.isFinite(image.groundY)||image.groundY<0||image.groundY>800))throw new Error('The technical elevation pictures need valid scale and ground-line metadata.');
 if(!['customer','auto'].includes(design.images[0].source))throw new Error('The rendered picture is missing its source.');
 if(submissionBytes(design)>=MAX_SUBMISSION_BYTES)throw new Error('The design pictures are too large. Please try again.');
 if(API_MODE==='stub')return {ok:true,stub:true};
 const result=await request('submit',{method:'POST',body:design});
 trackDesignSubmitted(design,result);
 return result;
}
export async function loadDesign(id,token){return request('load',{query:{d:id,t:token}});}
export async function getPreviewAvailability(){const r=await fetch('/api/backyard-preview');if(!r.ok)return false;return Boolean((await r.json()).available);}
export async function createBackyardRendering(shedImage,design,{setting='coastal',physicalSize,referenceDetails,shedCutout,signal}={}){
 const r=await fetch('/api/backyard-preview',{method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify(backyardPhotoRequest(shedImage,design,{setting,physicalSize,referenceDetails,shedCutout}))});
 const data=await r.json();if(!r.ok||!data.image)throw new Error(data.error||'The shed picture could not be created. Please try again.');return data.image;
}

export function backyardPhotoRequest(shedImage,design,{setting='coastal',physicalSize,referenceDetails,shedCutout}={}){
 const body={...(shedCutout?{shedCutout}:{}),...(referenceDetails?{referenceDetails}:{}),shedImage,mode:'sample',setting,placement:PHOTO_PATH_RULE,fenceHeightFt:6,design:{...design,physicalSize,renderingConstraints:photoDesignConstraints(design)}};
 if(new TextEncoder().encode(JSON.stringify(body)).length>=4000000)throw new Error('The photo request is too large. Please try again.');
 return body;
}
export async function uploadPhotoLayers(photo,images,{signal,onUpload}={}){
 return uploadLayers(photo,images,{signal,onUpload,allocate:(job,{signal})=>request('photo-upload',{method:'POST',body:{id:job.id,token:job.token},signal:AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(15000)])})});
}
export async function requestPhoto(photo,body,{signal}={}){
 return request('photo',{method:'POST',body:{id:photo.id,token:photo.token,request:body},signal:AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(75000)])});
}
export async function pollPhoto(photo,{signal}={}){
 return request('photo',{query:{id:photo.id,token:photo.token},signal:AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(15000)])});
}

export function loadOwnerDesign(editToken){return request('load',{query:{edit:editToken}});}

export function loadRenderDesign(renderToken){return request('load',{query:{render:renderToken}});}

export function ownerAddress(editToken,{q,place,session,signal}={}){
 if(!editToken||!session)return Promise.reject(new Error('Address suggestions require an owner edit session.'));
 return request('address',{query:{edit:editToken,session,...(place?{place}:{q})},signal});
}
