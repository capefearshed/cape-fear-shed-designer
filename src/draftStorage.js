import {buildDesign} from './designContract.js';
import {validPlacement} from './catalogLayout.js';
const KEY='cfs-designer-draft-v1';
export function readDraft(catalog,storage){
 try{const draft=JSON.parse(storage.getItem(KEY));if(draft?.catalogVersion!==catalog.version||!draft.state) return null;
  buildDesign(catalog,draft.state);if(!validPlacement(catalog,draft.state.shed,draft.state.placed))return null;
  return draft;
 }catch{return null;}
}
export function saveDraft(catalog,state,storage){try{storage.setItem(KEY,JSON.stringify({catalogVersion:catalog.version,savedAt:Date.now(),state}));return true;}catch{return false;}}
