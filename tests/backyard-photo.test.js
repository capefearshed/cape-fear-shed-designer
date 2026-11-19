import test from 'node:test';
import assert from 'node:assert/strict';
import {prepareBackyardPhoto} from '../src/prepareBackyardPhoto.js';
test('large phone photos are resized and compressed below the server limit',async()=>{
 const oldBitmap=globalThis.createImageBitmap,oldDocument=globalThis.document;
 let closed=false,canvas,drawn=false;const qualities=[];
 try{
  globalThis.createImageBitmap=async()=>({width:8064,height:6048,close(){closed=true}});
  globalThis.document={createElement(){canvas={getContext:()=>({fillRect(){},drawImage(){drawn=true}}),toDataURL(type,q){qualities.push(q);return 'data:image/jpeg;base64,'+'A'.repeat(q>.75?1800000:1200000)}};return canvas}};
  const result=await prepareBackyardPhoto({type:'image/jpeg',name:'phone.jpg',size:32*1024*1024});
  assert.equal(canvas.width,1600);assert.equal(canvas.height,1200);assert.ok(drawn&&closed);assert.ok(result.length<1700000);assert.deepEqual(qualities,[.85,.72]);
 }finally{globalThis.createImageBitmap=oldBitmap;globalThis.document=oldDocument;}
});
