import {withCompatibleOverhang} from './soffitOverhang.js';
import {buildDesign} from './designContract.js';
import {validPlacement} from './catalogLayout.js';
import {editorSnapshot,snapshotState} from './editorSnapshot.js';
export const EXPIRED_LINK='This edit link expired — open it again from the app.';
export function restoreDesign(catalog,design,editorState){
 if(design?.format!=='cfs-designer-v1')throw new Error('This saved design is not supported.');
 if(editorState){const exact=withCompatibleOverhang(catalog,editorSnapshot(snapshotState(editorState)),{repair:true});buildDesign(catalog,exact);if(!validPlacement(catalog,exact.shed,exact.placed))throw new Error('The saved openings do not fit. Review the original design in the app.');return exact;}
 let state=editorState?editorSnapshot(editorState):{shed:{},colors:{},placed:[],extras:[]};
 state.shed={...state.shed,...structuredClone(design.shed)};
 state.colors=structuredClone(design.colors);
 const elements=design.elements||[];
 state.placed=elements.filter(e=>['door','window'].includes(catalog.options.find(o=>o.code===e.code)?.kind)).map(e=>{
  const prior=state.placed?.find(p=>p.id===e.id)||{},option=catalog.options.find(o=>o.code===e.code);
  return {...prior,...structuredClone(e),...(option.kind==='door'?{rampRemoved:!elements.some(r=>r.for===e.id&&r.code===option.ramp),color:e.color||prior.color||null}:{})};
 });
 state.extras=[];
 for(const e of elements.filter(e=>!['door','window','ramp','dormer'].includes(catalog.options.find(o=>o.code===e.code)?.kind))){
  const existing=state.extras.find(x=>x.code===e.code);
  if(existing&&['loft-45','workbench-18'].includes(e.code)){existing.qty+=e.qty;continue;}
  state.extras.push(structuredClone(e));
 }
 state=withCompatibleOverhang(catalog,state,{repair:true});
 buildDesign(catalog,state);
 if(!validPlacement(catalog,state.shed,state.placed))throw new Error('The saved openings do not fit. Review the original design in the app.');
 return state;
}
export function savedContact(design,contact={},editorState){
 const snapshot=editorState??design.editorState??{};
 const old=design.customer||{};
 return {customer:{...old,...Object.fromEntries(['firstName','lastName','phone','email','notes'].map(k=>[k,contact[k]??old[k]??''])),address:Object.fromEntries(['street','city','state','zip'].map(k=>[k,contact[k]??old.address?.[k]??(k==='state'?'NC':'')]))},uses:Array.isArray(contact.use)?contact.use:contact.use?[contact.use]:snapshot.uses??design.uses??[],usesOther:snapshot.usesOther??design.usesOther??'',source:typeof contact.source==='string'?{code:contact.source,other:design.source?.other||'',referredBy:contact.referredBy||''}:{...design.source,...snapshot.source,...contact.source,...(contact.referredBy!==undefined?{referredBy:contact.referredBy}:{})}};
}
