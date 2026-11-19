import sharp from 'sharp';
// Derive detail pixels from image 1, never from a generated picture or scenery.
export async function dormerReference(blob,design,details){
 if(!design?.dormer||!details?.dormer)return null; // Older clients remain compatible.
 return cropReference(blob,details.dormer,'dormer');
}
export async function cropReference(blob,r,label){
 if(!['x','y','width','height'].every(key=>Number.isFinite(r[key]))||r.x<0||r.y<0||r.width<=0||r.height<=0||r.x+r.width>1.000001||r.y+r.height>1.000001)throw new Error('Design details: invalid '+label+' reference bounds.');
 const bytes=Buffer.from(await blob.arrayBuffer()),{width,height}=await sharp(bytes).metadata();
 const left=Math.floor(r.x*width),top=Math.floor(r.y*height);
 const cropWidth=Math.min(width-left,Math.ceil(r.width*width)),cropHeight=Math.min(height-top,Math.ceil(r.height*height));
 if(cropWidth<32||cropHeight<16)return null;
 return sharp(bytes).extract({left,top,width:cropWidth,height:cropHeight}).resize({width:1024}).jpeg({quality:95}).toBuffer();
}
