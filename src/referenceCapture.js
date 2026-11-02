import {showReferenceExterior} from './referenceValidation.js';
import {captureSceneCanvas} from './captureCanvas.js';
// Fixed landscape capture using the same display transform as the visible viewer.
export function captureBackyardReference(state,camera,object){
 const restoreVisibility=showReferenceExterior(state.scene,object);
 try{
  const canvas=captureSceneCanvas(state,camera,1536,1024);
  for(const quality of [.9,.85,.75,.65]){const image=canvas.toDataURL('image/jpeg',quality);if(image.length<1800000)return image;}
  throw new Error('The reference picture is too large. Please try again.');
 }finally{restoreVisibility();}
}
