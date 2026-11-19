import sharp from 'sharp';
export async function assertShedReferenceImage(blob){
 try{
  const stats=await sharp(Buffer.from(await blob.arrayBuffer())).stats();
  const rgb=stats.channels.slice(0,3);
  if(Math.max(...rgb.map(c=>c.stdev))<3||Math.max(...rgb.map(c=>c.max-c.min))<18||stats.channels[3]?.max===0)throw new Error('blank');
 }catch{
  throw new Error('Shed reference is blank or unreadable. Capture the shed again before generating a photo.');
 }
}
