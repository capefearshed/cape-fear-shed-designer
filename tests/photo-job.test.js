import test from 'node:test';
import assert from 'node:assert/strict';
import {followPhoto} from '../src/photoJob.js';
import {backyardPhotoRequest,requestPhoto,pollPhoto,API_BASE} from '../src/api.js';
const signal=new AbortController().signal,photo={id:'job-1',token:'test-token'};
test('photo POST ready returns immediately; dropped POST polls through network errors to a ready URL',async()=>{
 let polls=0,waits=0;
 assert.deepEqual(await followPhoto(photo,{}, {signal,start:async()=>({status:'ready',image:'data:image/png;base64,YQ=='}),poll:()=>assert.fail(),wait:()=>assert.fail()}),{status:'ready',image:'data:image/png;base64,YQ=='});
 const result=await followPhoto(photo,{}, {signal,start:async()=>{throw new Error('timeout');},wait:async()=>{waits++;},poll:async()=>{polls++;if(polls===1)throw new Error('offline');return polls===2?{status:'working'}:{status:'ready',url:'https://app.capefearshed.com/photo.jpg'};}});
 assert.equal(result.image,'https://app.capefearshed.com/photo.jpg');assert.equal(polls,3);assert.equal(waits,3);
});
test('failed photo quietly terminates and cancellation prevents further polling',async()=>{
 assert.deepEqual(await followPhoto(photo,{}, {signal,start:async()=>({status:'failed'}),poll:()=>assert.fail(),wait:()=>assert.fail()}),{status:'failed'});
 const controller=new AbortController();let polls=0;
 const result=await followPhoto(photo,{}, {signal:controller.signal,start:async()=>({status:'working'}),wait:async()=>controller.abort(),poll:async()=>{polls++;return {status:'working'};}});
 assert.equal(result.status,'failed');assert.ok(polls<=1);
});
test('photo API uses the app endpoint and the unchanged preview request body',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({status:'working'})};};
 try{
  const body=backyardPhotoRequest('data:image/jpeg;base64,YQ==',{width:12},{setting:'garden',physicalSize:{widthFt:12}});
  assert.deepEqual(Object.keys(body).sort(),['design','fenceHeightFt','mode','placement','setting','shedImage']);
  await requestPhoto(photo,body,{signal});await pollPhoto(photo,{signal});
  assert.equal(calls[0].url,API_BASE+'/api/form?designer=photo');assert.deepEqual(JSON.parse(calls[0].options.body),{...photo,request:body});
  assert.equal(calls[1].url,API_BASE+'/api/form?designer=photo&id=job-1&token=test-token');
 }finally{globalThis.fetch=original;}
});
