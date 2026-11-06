// Resize on the customer's device before sending any photo to the server.
export async function prepareBackyardPhoto(file){
 if(!file.type.startsWith('image/')&&!/\.(jpe?g|png|webp|heic|heif)$/i.test(file.name))throw new Error('Choose a photo from your camera or photo library.');
 let blob=file,bitmap;
 try{bitmap=await createImageBitmap(blob,{imageOrientation:'from-image'});}catch{
  if(/hei[cf]/i.test(file.type+' '+file.name)){
   const {heicTo}=await import('heic-to');blob=await heicTo({blob:file,type:'image/jpeg',quality:.85});
  }
  const url=URL.createObjectURL(blob);
  try{const img=new Image();img.src=url;await img.decode();bitmap=img;}finally{URL.revokeObjectURL(url);}
 }
 try{
  let longest=1600;
  while(longest>=640){
   const scale=Math.min(1,longest/Math.max(bitmap.width,bitmap.height));
   const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
   const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
   for(const quality of [.85,.72,.6]){const image=canvas.toDataURL('image/jpeg',quality);if(image.length<=1700000)return image;}
   longest=Math.floor(longest*.8);
  }
  throw new Error('This photo could not be prepared. Please try another photo.');
 }finally{bitmap.close?.();}
}
