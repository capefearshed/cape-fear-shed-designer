import {cropReference} from './dormerReference.js';
export async function slidingDoorReference(blob,design,details){
 if(!design?.openings?.some(o=>o.kind==='door'&&o.type==='sliding')||!details?.slidingDoors)return null;
 return cropReference(blob,details.slidingDoors,'sliding door');
}
