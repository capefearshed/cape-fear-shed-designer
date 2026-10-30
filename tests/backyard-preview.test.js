import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/backyard-preview.js';
import {readFile} from 'node:fs/promises';
import {BACKYARD_SETTINGS} from '../src/backyardSettings.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(code){this.code=code;return this},json(body){this.body=body;return this}}}
const image='data:image/png;base64,'+Buffer.alloc(200,1).toString('base64');
test('configuration, validation, reference images and provider failures',async()=>{
 const previous=process.env.OPENAI_API_KEY,originalFetch=globalThis.fetch;
 try{
  delete process.env.OPENAI_API_KEY;
  let res=response();await handler({method:'GET'},res);assert.equal(res.body.available,false);
  res=response();await handler({method:'POST'},res);assert.equal(res.code,503);
  process.env.OPENAI_API_KEY='test-only';
  res=response();await handler({method:'DELETE'},res);assert.equal(res.code,405);
  const body={mode:'photo',placement:'Beside the fence',shedImage:image,yardImage:image,design:{width:10,length:12}};
  res=response();await handler({method:'POST',body:{...body,shedImage:'https://example.com/private'}},res);assert.equal(res.code,400);
  globalThis.fetch=async(url,request)=>{assert.equal(url,'https://api.openai.com/v1/images/edits');assert.equal(request.body.getAll('image[]').length,2);assert.match(request.body.get('prompt'),/Preserve its dimensions/);assert.match(request.body.get('prompt'),/pathway leading from the foreground to the actual shed entry door/);assert.match(request.body.get('prompt'),/keeping siding, windows and doors visible/);assert.equal(request.body.get('quality'),'high');assert.match(request.body.get('prompt'),/fence as 6 feet tall/);assert.match(request.body.get('prompt'),/human eye-level/);assert.match(request.body.get('prompt'),/65–80 percent/);return {ok:true,json:async()=>({data:[{b64_json:'test-image'}]})}};
  res=response();await handler({method:'POST',body},res);assert.equal(res.code,200);assert.equal(res.body.image,'data:image/png;base64,test-image');
  for(const [setting,scene] of Object.entries(BACKYARD_SETTINGS)){
   const expected=await readFile(new URL('../public'+scene.image,import.meta.url));
   globalThis.fetch=async(url,request)=>{const inputs=request.body.getAll('image[]');assert.equal(inputs.length,2);assert.deepEqual(Buffer.from(await inputs[1].arrayBuffer()),expected);assert.ok(request.body.get('prompt').includes(scene.pathway));assert.match(request.body.get('prompt'),/exact selected Wilmington/);return {ok:true,json:async()=>({data:[{b64_json:'sample'}]})}};
   res=response();await handler({method:'POST',body:{...body,mode:'sample',setting,yardImage:'https://untrusted.example/image.jpg'}},res);assert.equal(res.code,200);
  }
  globalThis.fetch=async()=>({ok:false,status:429});
  res=response();await handler({method:'POST',body},res);assert.equal(res.code,502);assert.match(res.body.error,/busy/);
 }finally{globalThis.fetch=originalFetch;if(previous===undefined)delete process.env.OPENAI_API_KEY;else process.env.OPENAI_API_KEY=previous;}
});
