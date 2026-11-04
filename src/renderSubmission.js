import {submitDesign,backyardPhotoRequest} from './api.js';
import {buildDesign} from './designContract.js';
import {savedContact} from './savedDesign.js';
import {startPhoto} from './photoJob.js';
import {submitOwnerDesign} from './ownerSubmission.js';
export async function submitRenderedDesign({catalog,loaded,token,viewer,model,signal,onStage=()=>{},attempt={}},{submit=submitDesign,photo=startPhoto}={}){
 if(attempt.prepared)return submitOwnerDesign(attempt.prepared.body,{...attempt.prepared,signal,onStage,attempt},{submit,photo});
 onStage('saving');
 const images=await viewer.captureSubmission(null,'pending');
 const setting=loaded.state.backyardSetting||'coastal';
 const captured=viewer.capture(true,true,setting);
 const contact=savedContact(loaded.design,loaded.contact,loaded.editorState);
 const body=buildDesign(catalog,loaded.state,{...loaded.design,images,customer:contact.customer,uses:contact.uses,usesOther:contact.usesOther,source:contact.source,submittedAt:new Date().toISOString()});
 body.renderToken=token;
 const photoRequest=backyardPhotoRequest(captured.image,model,{setting,referenceDetails:captured.referenceDetails,physicalSize:captured.physicalSize});
 signal.throwIfAborted();
 attempt.prepared={body,photoRequest,layerImages:captured.layerImages};
 return submitOwnerDesign(body,{...attempt.prepared,signal,onStage,attempt},{submit,photo});
}
