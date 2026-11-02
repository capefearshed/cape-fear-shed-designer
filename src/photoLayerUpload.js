export const LAYER_NAMES=['shedCutout','pathLayer','shadowLayer'];
export const LAYER_VERSION='cfs-layers-v1';
export const MAX_LAYER_BYTES=8388608;
const error=()=>new Error('The shed photo layers could not be uploaded. Please try again.');
export function pngLayerBlob(value){
 if(value instanceof Blob){if(value.type!=='image/png')throw error();return value;}
 if(typeof value!=='string'||!value.startsWith('data:image/png;base64,'))throw error();
 try{
  const binary=atob(value.slice(22)),bytes=new Uint8Array(binary.length);
  for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
  return new Blob([bytes],{type:'image/png'});
 }catch{throw error();}
}
export async function validateLayerBlob(blob){
 if(!blob.size||blob.size>MAX_LAYER_BYTES)throw error();
 const bytes=new Uint8Array(await blob.slice(0,33).arrayBuffer()),view=new DataView(bytes.buffer);
 if(bytes.length<33||[137,80,78,71,13,10,26,10].some((v,i)=>bytes[i]!==v)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR'||view.getUint32(16)!==1536||view.getUint32(20)!==1024||![4,6].includes(bytes[25]))throw error();
}
export async function uploadPhotoLayers(photo,images,{signal,allocate,put=fetch}={}){
 if(!photo?.id||!photo?.token||!images)throw error();
 signal?.throwIfAborted();
 const blobs=Object.fromEntries(LAYER_NAMES.map(name=>[name,pngLayerBlob(images[name])]));
 await Promise.all(LAYER_NAMES.map(name=>validateLayerBlob(blobs[name])));
 const reply=await allocate(photo,{signal});
 if(reply?.version!==LAYER_VERSION)throw error();
 const files={};
 for(const name of LAYER_NAMES){
  const entry=reply.uploads?.[name];
  if(!entry||typeof entry.path!=='string'||!entry.path||entry.method!=='PUT'||entry.contentType!=='image/png'||!Number.isFinite(entry.maxBytes)||entry.maxBytes<=0||blobs[name].size>entry.maxBytes)throw error();
  let url;try{url=new URL(entry.url);}catch{throw error();}if(url.protocol!=='https:')throw error();
  files[name]=entry.path;
 }
 // Complete every upload before dispatching the paid photo job. On failure,
 // there is no architectural-generation fallback and no polling an unstarted job.
 for(const name of LAYER_NAMES){
  signal?.throwIfAborted();
  const replyPut=await put(reply.uploads[name].url,{method:'PUT',headers:{'Content-Type':'image/png'},body:blobs[name],credentials:'omit',signal:AbortSignal.any([...(signal?[signal]:[]),AbortSignal.timeout(75000)])});
  if(!replyPut.ok)throw error();
 }
 return {version:LAYER_VERSION,width:1536,height:1024,sameCameraAsShedImage:true,files};
}
