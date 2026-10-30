import sharp from 'sharp';
import {readFile} from 'node:fs/promises';
let logo;
export async function brandRendering(input){
 const {width,height}=await sharp(input).metadata();
 if(!width||!height)throw new Error('Image dimensions unavailable');
 logo??=readFile(new URL('../../public/brand/render-mark-white.png',import.meta.url));
 const size=Math.round(Math.min(width*.14,height*.22)),margin=Math.max(8,Math.round(width*.016));
 const mark=await sharp(await logo).resize(size,size,{fit:'contain'}).png().toBuffer();
 const pad=Math.max(8,Math.round(size*.12)),shadowSize=size+pad*2;
 const shadow=Buffer.from(`<svg width="${shadowSize}" height="${shadowSize}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="blur"><feGaussianBlur stdDeviation="${size*.065}"/></filter></defs><ellipse cx="${shadowSize/2}" cy="${shadowSize/2}" rx="${size*.49}" ry="${size*.49}" fill="black" opacity=".55" filter="url(#blur)"/></svg>`);
 const left=margin,top=height-margin-size;
 return sharp(input).composite([{input:shadow,left:Math.max(0,left-pad),top:Math.max(0,top-pad)},{input:mark,left,top}]).png().toBuffer();
}
