import {restoreDesign} from './savedDesign.js';
import {buildDesign} from './designContract.js';
import {fitSavedDesign} from './renderFit.js';
export function editableSavedDesign(catalog,response){
 const snapshot=response.editorState??response.design.editorState;
 const original=restoreDesign(catalog,response.design,snapshot);
 if(!snapshot)return {state:original,conflicts:[]};
 const prior=buildDesign(catalog,original);
 if(['shed','colors','elements'].every(key=>JSON.stringify(prior[key])===JSON.stringify(response.design[key])))return {state:original,conflicts:[]};
 const fit=fitSavedDesign(catalog,response.design,snapshot);
 if(fit.state)return fit;
 if(fit.candidate)return {state:fit.candidate,conflicts:fit.conflicts};
 throw new Error(fit.conflicts.map(c=>c.reason).join(' '));
}
