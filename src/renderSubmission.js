import {submitDesign,backyardPhotoRequest} from './api.js';
import {buildDesign} from './designContract.js';
import {savedContact} from './savedDesign.js';
import {startPhoto} from './photoJob.js';
import {submitOwnerDesign} from './ownerSubmission.js';
export async function submitRenderedDesign({catalog,loaded,token,viewer,model,signal},{submit=submitDesign,photo=startPhoto}={}){
 const images=await viewer.captureSubmission(null,'pending');
 const setting=loaded.state.backyardSetting||'coastal';
 const captured=viewer.capture(true,true,setting);
 const contact=savedContact(loaded.design,loaded.contact,loaded.editorState);
 const body=buildDesign(catalog,loaded.state,{...loaded.design,images,customer:contact.customer,uses:contact.uses,usesOther:contact.usesOther,source:contact.source,submittedAt:new Date().toISOString()});
 body.renderToken=token;
 const photoRequest=backyardPhotoRequest(captured.image,model,{setting,referenceDetails:captured.referenceDetails,physicalSize:captured.physicalSize});
 signal.throwIfAborted();
 return submitOwnerDesign(body,{photoRequest,signal,layerImages:captured.layerImages},{submit,photo});
}
