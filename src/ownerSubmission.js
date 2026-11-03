import {submitDesign} from './api.js';
import {startPhoto} from './photoJob.js';
// Both owner routes use the customer photo transport, with an explicit awaited
// POST before returning control to the iframe's completion message.
export async function submitOwnerDesign(body,{photoRequest,layerImages,signal},{submit=submitDesign,photo=startPhoto}={}){
 signal?.throwIfAborted();
 const response=await submit(body);
 if(response?.ok!==true&&response?.success!==true)throw new Error('The design could not be saved.');
 await photo(response.photo,photoRequest,{signal,layerImages});
 return response;
}
