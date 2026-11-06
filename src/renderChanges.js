import {buildDesign,optionByCode} from './designContract.js';
import {restoreDesign} from './savedDesign.js';
import {snapshotState} from './editorSnapshot.js';
import {fitSavedDesign} from './renderFit.js';

// The app supplies catalog choices; all internal state translation lives here.
export function applyRenderChanges(catalog,response){
 const {changes,design,editorState}=response;
 if(changes===undefined){const fit=fitSavedDesign(catalog,design,editorState);if(fit.state)fit.state.backyardSetting=editorState?.backyardSetting||fit.state.backyardSetting||'coastal';return fit;}
 try{
  if(!changes||typeof changes!=='object'||Array.isArray(changes))throw new Error('The quote changes must be an object.');
  const supported=new Set(['size','wallHeight','siding','roofing','dormer','colors']);
  for(const key of Object.keys(changes))if(!supported.has(key))throw new Error('Unsupported quote change: '+key+'.');
  // Legacy requests can be reconstructed safely here: design still contains the old dimensions.
  const baseline=restoreDesign(catalog,design,editorState);
  const original=buildDesign(catalog,baseline,design);
  const updated=structuredClone(original);
  if(changes.size!==undefined){
   const size=catalog.sizes.find(s=>s.code===changes.size);
   if(!size)throw new Error('This shed size is not in the catalog.');
   Object.assign(updated.shed,{size:size.code,width:size.width,length:size.length});
  }
  for(const key of ['wallHeight','siding','roofing'])if(changes[key]!==undefined){
   if(optionByCode(catalog,changes[key])?.kind!==key)throw new Error('This '+key+' code is not in the catalog.');
   updated.shed[key]=changes[key];
  }
  if(changes.dormer!==undefined){
   if(typeof changes.dormer!=='boolean')throw new Error('The dormer change must be true or false.');
   if(changes.dormer)updated.shed.style='style-gable-dormer';
   else if(updated.shed.style==='style-gable-dormer'){updated.shed.style='style-gable';updated.shed.roofPitch=5;}
  }
  if(changes.colors!==undefined){
   if(!changes.colors||typeof changes.colors!=='object'||Array.isArray(changes.colors))throw new Error('The color changes must be an object.');
   for(const [key,value] of Object.entries(changes.colors)){
    if(!['siding','trim','roof'].includes(key))throw new Error('Unsupported color group: '+key+'.');
    const palette=key==='roof'&&updated.shed.roofing==='roof-metal'?catalog.colors.metal:catalog.colors[key];
    const color=typeof value==='string'?palette.find(c=>c.code===value||c.name===value):value;
    if(!color||typeof color!=='object'||typeof color.name!=='string'||!color.name.trim()||(!/^#[0-9a-f]{6}$/i.test(color.hex||'')&&!palette.some(c=>c.name===color.name&&c.hex===color.hex)))throw new Error('Return a saved color object {name,hex,code} or an available palette code/name for '+key+'.');
    updated.colors[key]=structuredClone(color);
   }
  }
  const fitted=fitSavedDesign(catalog,updated,baseline);
  if(fitted.state)fitted.state.backyardSetting=editorState?.backyardSetting||snapshotState(editorState)?.backyardSetting||baseline.backyardSetting||'coastal';
  return fitted;
 }catch(e){return {conflicts:[{id:'design',wall:null,reason:e.message}]};}
}
