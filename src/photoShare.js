export function photoFile(image){
 const match=/^data:(image\/(?:png|jpeg));base64,(.+)$/.exec(image);
 if(!match)throw new Error('A finished photo is required.');
 const bytes=Uint8Array.from(atob(match[2]),c=>c.charCodeAt(0));
 return new File([bytes],`cape-fear-shed-backyard.${match[1]==='image/png'?'png':'jpg'}`,{type:match[1]});
}
export async function sharePhoto(file,image,{nav=navigator,download}={}){
 const save=download||(()=>{const a=document.createElement('a');a.href=image;a.download=file.name;a.click();});
 // Call share directly in the tap handler: awaiting a fetch loses iOS activation.
 if(nav.maxTouchPoints>0&&nav.share&&nav.canShare?.({files:[file]})){
  try{await nav.share({files:[file],title:'My Cape Fear Shed'});return;}catch(error){if(error.name==='AbortError')return;}
 }
 save();
}
