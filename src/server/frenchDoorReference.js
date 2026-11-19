import {cropReference} from './dormerReference.js';
export async function frenchDoorReference(blob,design,details){
 if(!design?.openings?.some(o=>o.kind==='door'&&o.type==='french')||!details?.frenchDoors)return null;
 return cropReference(blob,details.frenchDoors,'French door');
}
