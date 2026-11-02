import test from 'node:test';
import sharp from 'sharp';
import assert from 'node:assert/strict';
import handler from '../api/backyard-preview.js';
import {readFile} from 'node:fs/promises';
import {backdropReference} from '../src/server/backdropReference.js';
import {BACKYARD_SETTINGS} from '../src/backyardSettings.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(body){this.body=body;return this}}}
const referencePixels=Buffer.alloc(128*128*3,240);for(let i=0;i<referencePixels.length/2;i++)referencePixels[i]=50;
const image='data:image/png;base64,'+(await sharp(referencePixels,{raw:{width:128,height:128,channels:3}}).png().toBuffer()).toString('base64');
test('configuration, validation, reference images and provider failures',async()=>{
 const outputImage=(await sharp({create:{width:512,height:342,channels:3,background:'#aabbcc'}}).png().toBuffer()).toString('base64');
 const previous=process.env.OPENAI_API_KEY,originalFetch=globalThis.fetch;
 try{
  delete process.env.OPENAI_API_KEY;
  let res=response();await handler({method:'GET'},res);assert.equal(res.body.available,false);
  res=response();await handler({method:'POST'},res);assert.equal(res.code,503);
  process.env.OPENAI_API_KEY='test-only';
  res=response();await handler({method:'DELETE'},res);assert.equal(res.code,405);
  const body={mode:'sample',setting:'garden',placement:'Beside the fence',shedImage:image,yardImage:image,design:{width:10,length:12,foundation:'slab'}};
  res=response();await handler({method:'POST',body:{...body,shedImage:'https://example.com/private'}},res);assert.equal(res.code,400);
  res=response();await handler({method:'POST',body:{...body,mode:'photo'}},res);assert.equal(res.code,403);
  let blankCalls=0;globalThis.fetch=async()=>{blankCalls++;throw new Error('Must not spend generation on blank reference');};
  const blank='data:image/png;base64,'+(await sharp({create:{width:1536,height:1024,channels:3,background:'#f3f3f1'}}).png().toBuffer()).toString('base64');
  res=response();await handler({method:'POST',body:{...body,shedImage:blank}},res);assert.equal(res.code,400);assert.match(res.body.error,/blank/);assert.equal(blankCalls,0);
  globalThis.fetch=async(url,request)=>{
   assert.equal(url,'https://api.openai.com/v1/images/edits');
   const inputs=request.body.getAll('image[]');assert.equal(inputs.length,2);
   assert.deepEqual(Buffer.from(await inputs[0].arrayBuffer()),Buffer.from(image.split(',')[1],'base64'));
   assert.equal(request.body.get('quality'),'high');assert.equal(request.body.get('input_fidelity'),'high');
   const prompt=request.body.get('prompt');
   const spec=JSON.parse(prompt.split('Design facts (units are labelled; null means copy the image, never guess):\n\n')[1].split('\n\n')[0]);
   assert.deepEqual(spec.footprintFt,{width:10,length:12});assert.match(spec.foundation,/Concrete slab/);
   assert.equal(res.headers['X-CFS-Photo-Prompt'],'cfs-reference-visible-only-v12');
   return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
  };
  res=response();await handler({method:'POST',body},res);assert.equal(res.code,200);assert.match(res.body.image,/^data:image\/png;base64,/);const branded=Buffer.from(res.body.image.split(',')[1],'base64');assert.notEqual(branded.toString('base64'),outputImage);const metadata=await sharp(branded).metadata();assert.equal(metadata.width,512);assert.equal(metadata.height,342);
  for(const [setting,scene] of Object.entries(BACKYARD_SETTINGS)){
   const original=await readFile(new URL('../public'+scene.image,import.meta.url));const expected=await backdropReference(original);const sourceSize=await sharp(original).metadata(),referenceSize=await sharp(expected).metadata();assert.equal(referenceSize.width,sourceSize.width);assert.ok(referenceSize.height<sourceSize.height*.6);
   globalThis.fetch=async(url,request)=>{
    const inputs=request.body.getAll('image[]');assert.equal(inputs.length,2);
    assert.deepEqual(Buffer.from(await inputs[1].arrayBuffer()),expected);
    assert.ok(request.body.get('prompt').includes(scene.pathway));
    return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
   };
   res=response();await handler({method:'POST',body:{...body,mode:'sample',setting,design:{...body.design,foundation:'framed',sidingType:'board-batten'},yardImage:'https://untrusted.example/image.jpg'}},res);assert.equal(res.code,200);
  }
  globalThis.fetch=async(url,request)=>{
   const inputs=request.body.getAll('image[]');assert.equal(inputs.length,3);
   assert.equal(inputs[2].name,'dormer-detail-from-image-1.jpg');
   assert.equal((await sharp(Buffer.from(await inputs[2].arrayBuffer())).metadata()).width,1024);
   assert.match(request.body.get('prompt'),/Image 3 is an enlarged crop/);
   return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
  };
  res=response();await handler({method:'POST',body:{...body,design:{...body.design,dormer:true},referenceDetails:{dormer:{x:0,y:0,width:.5,height:.5}}}},res);assert.equal(res.code,200);
  globalThis.fetch=async()=>{throw new Error('invalid bounds must not invoke provider');};
  res=response();await handler({method:'POST',body:{...body,design:{...body.design,dormer:true},referenceDetails:{dormer:{x:2,y:0,width:.5,height:.5}}}},res);assert.equal(res.code,400);
  for(const withDormer of [false,true]){
   globalThis.fetch=async(url,request)=>{
    const inputs=request.body.getAll('image[]');assert.equal(inputs.length,withDormer?4:3);
    assert.equal(inputs.at(-1).name,'door-transoms-detail-from-image-1.jpg');
    assert.match(request.body.get('prompt'),new RegExp('Image '+(withDormer?4:3)+' is an enlarged crop of the DOOR TRANSOMS'));
    return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
   };
   res=response();await handler({method:'POST',body:{...body,design:{...body.design,dormer:withDormer,windowFrameColor:'#202224',openings:[{kind:'door',transom:true}]},referenceDetails:{dormer:{x:0,y:0,width:.5,height:.5},doorTransoms:{x:.1,y:.1,width:.7,height:.5}}}},res);assert.equal(res.code,200);
  }
  globalThis.fetch=async(url,request)=>{
   const inputs=request.body.getAll('image[]');assert.equal(inputs.length,3);assert.equal(inputs[2].name,'french-doors-detail-from-image-1.jpg');
   assert.match(request.body.get('prompt'),/Image 3 is the FRENCH DOOR detail/);
   assert.match(request.body.get('prompt'),/Exactly ONE lever handle and ONE deadbolt TOTAL/);
   return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
  };
  res=response();await handler({method:'POST',body:{...body,design:{...body.design,openings:[{kind:'door',type:'french'}]},referenceDetails:{frenchDoors:{x:.1,y:.1,width:.7,height:.7}}}},res);assert.equal(res.code,200);
  globalThis.fetch=async(url,request)=>{
   const inputs=request.body.getAll('image[]');assert.equal(inputs.length,3);assert.equal(inputs[2].name,'sliding-door-detail-from-image-1.jpg');
   assert.match(request.body.get('prompt'),/Image 3 is the SLIDING DOOR detail/);
   return {ok:true,json:async()=>({data:[{b64_json:outputImage}]})};
  };
  res=response();await handler({method:'POST',body:{...body,design:{...body.design,openings:[{kind:'door',type:'sliding'}]},referenceDetails:{slidingDoors:{x:.1,y:.1,width:.7,height:.7}}}},res);assert.equal(res.code,200);
  globalThis.fetch=async()=>({ok:false,status:429});
  res=response();await handler({method:'POST',body},res);assert.equal(res.code,502);assert.match(res.body.error,/busy/);
 }finally{globalThis.fetch=originalFetch;if(previous===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previous;}
});
