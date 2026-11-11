// Leave room to stop on the first controls, then ease into the collapsed view.
export function viewerShrinkTarget(scrollTop,viewportHeight){
 const progress=Math.max(0,Math.min(1,(scrollTop-96)/520));
 return Math.max(0,viewportHeight)*.3*progress*progress*(3-2*progress);
}
