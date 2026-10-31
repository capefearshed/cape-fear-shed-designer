import {applyApprovedColors} from './colorPalette.js';
import catalog from './catalog.sample.json' with {type:'json'};

export const API_BASE = '';
export const API_MODE = 'stub';
export const MAX_SUBMISSION_BYTES = 3900000;
async function request(action,{method='GET',body,query={}}={}){
 const url=API_BASE+'/api/form?'+new URLSearchParams({designer:action,...query});
 const response=await fetch(url,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json();
 if(!response.ok)throw new Error(data.error||'The request could not be completed. Please try again.');
 return data;
}
// Switch this return to request('catalog') when Claude enables the live catalog.
export async function getCatalog(){return applyApprovedColors(structuredClone(catalog));}
export async function priceDesign(design){return API_MODE==='stub'?structuredClone(design.estimate):request('price',{method:'POST',body:design});}
export function submissionBytes(design){return new TextEncoder().encode(JSON.stringify(design)).length;}
export async function submitDesign(design){
 if(submissionBytes(design)>=MAX_SUBMISSION_BYTES)throw new Error('The design pictures are too large. Please try a smaller capture.');
 if(API_MODE!=='stub')return request('submit',{method:'POST',body:design});
 const logged=structuredClone(design);if(logged.context)logged.context.ownerToken=null;
 console.info('Cape Fear Shed test submission — not sent to the quote app',logged);
 return {ok:true,stub:true,designId:null};
}
export async function loadDesign(id,token){
 if(API_MODE==='stub')throw new Error('Loading saved designs will be available when the quote app enables it.');
 return request('load',{query:{d:id,t:token}});
}
