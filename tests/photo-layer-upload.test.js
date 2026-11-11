import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {LAYER_NAMES,uploadPhotoLayers} from '../src/photoLayerUpload.js';
import {followPhoto} from '../src/photoJob.js';
import {uploadPhotoLayers as apiUpload,API_BASE} from '../src/api.js';
const photo={id:'layer-job',token:'test-only-token'};
async function fixtures(){
 const bytes=await sharp({create:{width:1536,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).png().toBuffer();
 const images=Object.fromEntries(LAYER_NAMES.map(name=>[name,'data:image/png;base64,'+bytes.toString('base64')]));
 const reply={version:'cfs-layers-v1',uploads:Object.fromEntries(LAYER_NAMES.map(name=>[name,{path:'job/'+name+'.png',url:'https://example.com/'+name+'.png',method:'PUT',contentType:'image/png',maxBytes:8388608}]))};
 return {images,reply};
}
test('signed upload allocation and raw PUTs finish before photo dispatch; no data URLs survive',async()=>{
 const {images,reply}=await fixtures(),order=[];
 const layers=await uploadPhotoLayers(photo,images,{allocate:async job=>{assert.deepEqual(job,photo);order.push('allocate');return reply;},put:async(url,options)=>{
  order.push(url);assert.equal(options.method,'PUT');assert.equal(options.headers['Content-Type'],'image/png');assert.equal(options.body.type,'image/png');
  assert.equal((await sharp(Buffer.from(await options.body.arrayBuffer())).metadata()).width,1536);
  return {ok:true};
 }});
 assert.equal(order.length,4);assert.equal(order[0],'allocate');
 assert.deepEqual(layers,{version:'cfs-layers-v1',width:1536,height:1024,sameCameraAsShedImage:true,files:Object.fromEntries(LAYER_NAMES.map(name=>[name,reply.uploads[name].path]))});
 const result=await followPhoto(photo,{shedImage:'jpeg',shedCutout:'old-inline'}, {signal:new AbortController().signal,layerImages:images,upload:async()=>layers,start:async(job,body)=>{
  assert.equal('shedCutout' in body,false);assert.deepEqual(body.layers,layers);assert.equal(body.shedImage,'jpeg');return {status:'ready',image:'/photo.png'};
 },poll:()=>assert.fail(),wait:()=>assert.fail()});
 assert.equal(result.status,'ready');
});
test('missing, wrong-sized and opaque-format PNG layers fail before allocation',async()=>{
 const {images}=await fixtures(),allocate=()=>assert.fail('must not allocate');
 await assert.rejects(uploadPhotoLayers(photo,{...images,pathLayer:null},{allocate}));
 const small=await sharp({create:{width:16,height:16,channels:4,background:'#ffffff'}}).png().toBuffer();
 await assert.rejects(uploadPhotoLayers(photo,{...images,pathLayer:'data:image/png;base64,'+small.toString('base64')},{allocate}));
 const rgb=await sharp({create:{width:1536,height:1024,channels:3,background:'#ffffff'}}).png().toBuffer();
 await assert.rejects(uploadPhotoLayers(photo,{...images,pathLayer:'data:image/png;base64,'+rgb.toString('base64')},{allocate}));
});
test('allocation errors, forbidden job state, PUT errors and cancellation never start a paid job',async()=>{
 const {images,reply}=await fixtures();
 for(const upload of [async()=>{throw new Error('409');},async()=>uploadPhotoLayers(photo,images,{allocate:async()=>reply,put:async()=>({ok:false})})]){
  const result=await followPhoto(photo,{}, {signal:new AbortController().signal,layerImages:images,upload,start:()=>assert.fail(),poll:()=>assert.fail(),wait:()=>assert.fail()});assert.equal(result.status,'failed');
 }
 const controller=new AbortController();
 await assert.rejects(uploadPhotoLayers(photo,images,{signal:controller.signal,allocate:async()=>{controller.abort();return reply;},put:()=>assert.fail()}));
 const invalid=structuredClone(reply);invalid.uploads.pathLayer.maxBytes=1;
 await assert.rejects(uploadPhotoLayers(photo,images,{allocate:async()=>invalid,put:()=>assert.fail()}));
});
test('API allocates authenticated paths then uploads bytes without forwarding token to storage',async()=>{
 const {images,reply}=await fixtures(),previous=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>reply};};
 try{
  await apiUpload(photo,images);
  assert.equal(calls[0].url,API_BASE+'/api/form?designer=photo-upload');assert.deepEqual(JSON.parse(calls[0].options.body),photo);
  assert.equal(calls.length,4);
  for(const call of calls.slice(1)){assert.equal(call.options.body instanceof Blob,true);assert.deepEqual(Object.keys(call.options.headers),['Content-Type']);assert.equal(call.options.credentials,'omit');}
 }finally{globalThis.fetch=previous;}
});
