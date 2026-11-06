export const BLANK_REFERENCE_ERROR='The shed picture is blank. Please return to the shed preview and try again.';
// This detects empty/uniform captures, not whether a nonempty picture is the correct shed.
export function assertReferencePixels(pixels){
 let samples=0,foreground=0,min=255,max=0;
 for(let i=0;i<pixels.length;i+=64){
  const alpha=pixels[i+3]/255;
  const rgb=[243,244,241].map((bg,c)=>pixels[i+c]*alpha+bg*(1-alpha));
  const brightness=(rgb[0]+rgb[1]+rgb[2])/3;
  min=Math.min(min,brightness);max=Math.max(max,brightness);samples++;
  if(Math.max(...rgb.map((v,c)=>Math.abs(v-[243,244,241][c])))>18)foreground++;
 }
 if(!samples||max-min<18||foreground/samples<.005)throw new Error(BLANK_REFERENCE_ERROR);
}
export function showReferenceExterior(scene,object){
 if(!object)return ()=>{};
 const changed=new Map();
 const set=(node,visible)=>{if(!changed.has(node))changed.set(node,node.visible);node.visible=visible;};
 let branch=object;
 for(let node=object;node&&node!==scene;node=node.parent){set(node,true);branch=node;}
 for(const child of scene.children)if(child!==branch&&!child.isLight)set(child,false);
 object.updateWorldMatrix(true,true);
 return ()=>{for(const [node,visible] of changed)node.visible=visible;};
}
