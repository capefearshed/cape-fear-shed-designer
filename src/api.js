import {IMAGE_VIEWS} from './submissionCapture.js';
import {applyApprovedColors} from './colorPalette.js';
import catalog from './catalog.sample.json' with {type:'json'};

// /design/ on the app domain uses same-origin URLs; previews call the CORS-enabled app.
export const API_BASE=import.meta.env?.VITE_API_BASE??(typeof location!=='undefined'&&location.hostname==='app.capefearshed.com'?'':'https://app.capefearshed.com');
export const API_MODE=import.meta.env?.VITE_DESIGNER_STUB==='true'?'stub':'live-test';
export const MAX_SUBMISSION_BYTES=3900000;
export const SEND_ERROR='Something went wrong sending your design. Please try again or text us at 910-839-8589.';
async function request(action,{method='GET',body,query={}}={}){
 try{
  const response=await fetch(API_BASE+'/api/form?'+new URLSearchParams({designer:action,...query}),{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw new Error(SEND_ERROR);
  const data=await response.json();if(action==='submit'&&data.ok!==true)throw new Error(SEND_ERROR);return data;
 }catch{throw new Error(SEND_ERROR);}
}
// Later: return applyApprovedColors(await request('catalog'));
export async function getCatalog(){return applyApprovedColors(structuredClone(catalog));}
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
 const validation=validateCustomer(design.customer||{});if(validation)throw new Error(validation);
 if(!Array.isArray(design.images)||design.images.length!==5||design.images.some((image,i)=>image.view!==IMAGE_VIEWS[i]||image.type!=='image/jpeg'||!image.data?.startsWith('data:image/jpeg;base64,')))throw new Error('The design needs a render and four wall pictures before it can be sent.');
 if(!['customer','auto'].includes(design.images[0].source))throw new Error('The rendered picture is missing its source.');
 if(submissionBytes(design)>=MAX_SUBMISSION_BYTES)throw new Error('The design pictures are too large. Please try again.');
 if(API_MODE==='stub')return {ok:true,stub:true};
 return request('submit',{method:'POST',body:design});
}
export async function loadDesign(id,token){return request('load',{query:{d:id,t:token}});}
export async function getPreviewAvailability(){const r=await fetch('/api/backyard-preview');if(!r.ok)return false;return Boolean((await r.json()).available);}
export async function createBackyardRendering(shedImage,design,{setting='coastal',physicalSize,signal}={}){
 const r=await fetch('/api/backyard-preview',{method:'POST',headers:{'Content-Type':'application/json'},signal,body:JSON.stringify({shedImage,mode:'sample',setting,placement:'',design:{...design,physicalSize},fenceHeightFt:6})});
 const data=await r.json();if(!r.ok||!data.image)throw new Error(data.error||'The shed picture could not be created. Please try again.');return data.image;
}
