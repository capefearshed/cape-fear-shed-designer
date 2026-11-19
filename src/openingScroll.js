// Accumulate small movements, but ignore jitter and overscroll at either end.
export function openingActionsForScroll(previous,scrollTop){
 const top=Math.max(0,scrollTop);
 if(top<=24)return {top,hidden:false};
 const delta=top-previous.top;
 if(delta>=12)return {top,hidden:true};
 if(delta<=-8)return {top,hidden:false};
 return previous;
}
