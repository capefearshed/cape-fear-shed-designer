import {submitDesign,backyardPhotoRequest} from './api.js';
import {buildDesign} from './designContract.js';
import {savedContact} from './savedDesign.js';
import {followPhoto} from './photoJob.js';
export async function submitRenderedDesign({catalog,loaded,token,viewer,model,signal},{submit=submitDesign,photo=followPhoto}={}){
 const images=await viewer.captureSubmission(null,'pending');
 const setting=loaded.state.backyardSetting||'coastal';
 const captured=viewer.capture(true,true,setting);
 const contact=savedContact(loaded.design,loaded.contact,loaded.editorState);
 const body=buildDesign(catalog,loaded.state,{...loaded.design,images,customer:contact.customer,uses:contact.uses,usesOther:contact.usesOther,source:contact.source,submittedAt:new Date().toISOString()});
 body.renderToken=token;
 const photoRequest=backyardPhotoRequest(captured.image,model,{setting,referenceDetails:captured.referenceDetails,physicalSize:captured.physicalSize});
 signal.throwIfAborted();
 const response=await submit(body);
 const accepted=await new Promise(resolve=>{photo(response.photo,photoRequest,{signal,layerImages:captured.layerImages,onStarted:resolve}).catch(()=>resolve(false));});
 if(!accepted)throw new Error('Pictures saved, but the backyard photo could not be started. Open the design again from the app to retry.');
 return response;
}
