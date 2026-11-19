import sharp from 'sharp';
// Supply the setting without its foreground walkway, so the landscape image
// cannot compete with the door-aligned path geometry in the shed reference.
export async function backdropReference(bytes){
 const {width,height}=await sharp(bytes).metadata();
 if(!width||!height)throw new Error('Backdrop dimensions unavailable');
 return sharp(bytes).extract({left:0,top:0,width,height:Math.floor(height*.58)}).jpeg({quality:92}).toBuffer();
}
