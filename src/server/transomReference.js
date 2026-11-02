import {cropReference} from './dormerReference.js';
export async function transomReference(blob,design,details){
 if(!design?.openings?.some(o=>o.kind==='door'&&o.transom)||!details?.doorTransoms)return null;
 return cropReference(blob,details.doorTransoms,'door transom');
}
