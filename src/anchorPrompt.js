export function anchorPromptEligible({review,owner,foundation,selected,available}){
 return Boolean(review&&!owner&&foundation!=='foundation-slab'&&available);
}
export function anchorPromptTracking(shown,selected){return shown?{anchorPrompt:{shown:true,added:Boolean(selected)}}:{};}
export function trackAnchorPromptAdd(target=window){
 if(typeof target.gtag==='function')try{target.gtag('event','anchor_prompt_add');}catch{/* Tracking must not interrupt selection. */}
}
