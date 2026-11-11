import test from 'node:test';
import assert from 'node:assert/strict';
import {followPhoto,PHOTO_JOB_ERROR,PHOTO_START_ERROR,PHOTO_UPLOAD_ERROR} from '../src/photoJob.js';
import {backyardPhotoRequest,requestPhoto,pollPhoto,API_BASE} from '../src/api.js';
const signal=new AbortController().signal,photo={id:'job-1',token:'test-token'};
test('photo POST ready returns immediately; dropped POST polls through network errors to a ready URL',async()=>{
 let polls=0,waits=0;
 assert.deepEqual(await followPhoto(photo,{}, {signal,start:async()=>({status:'ready',image:'data:image/png;base64,YQ=='}),poll:()=>assert.fail(),wait:()=>assert.fail()}),{status:'ready',image:'data:image/png;base64,YQ=='});
 const result=await followPhoto(photo,{}, {signal,start:async()=>{throw new Error('timeout');},wait:async()=>{waits++;},poll:async()=>{polls++;if(polls===1)throw new Error('offline');return polls===2?{status:'working'}:{status:'ready',url:'https://app.capefearshed.com/photo.jpg'};}});
 assert.equal(result.image,'https://app.capefearshed.com/photo.jpg');assert.equal(polls,3);assert.equal(waits,3);
});
test('failed photo reports an error and cancellation prevents further polling',async()=>{
 assert.deepEqual(await followPhoto(photo,{}, {signal,start:async()=>({status:'failed'}),poll:()=>assert.fail(),wait:()=>assert.fail()}),{status:'failed',stage:'job',error:PHOTO_JOB_ERROR});
 const controller=new AbortController();let polls=0;
 const result=await followPhoto(photo,{}, {signal:controller.signal,start:async()=>({status:'working'}),wait:async()=>controller.abort(),poll:async()=>{polls++;return {status:'working'};}});
 assert.equal(result.status,'failed');assert.ok(polls<=1);
});
test('photo API uses the app endpoint and the unchanged preview request body',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({status:'working'})};};
 try{
  const body=backyardPhotoRequest('data:image/jpeg;base64,YQ==',{width:12},{setting:'garden',physicalSize:{widthFt:12}});
  assert.ok(body.placement.length<=300);assert.match(body.placement,/leave a side or corner/);assert.match(body.placement,/behind the logo/);
  assert.deepEqual(Object.keys(body).sort(),['design','fenceHeightFt','mode','placement','setting','shedImage']);
  await requestPhoto(photo,body,{signal});await pollPhoto(photo,{signal});
  assert.equal(calls[0].url,API_BASE+'/api/form?designer=photo');assert.deepEqual(JSON.parse(calls[0].options.body),{...photo,request:body});
  assert.equal(calls[1].url,API_BASE+'/api/form?designer=photo&id=job-1&token=test-token');
 }finally{globalThis.fetch=original;}
});
test('low-wall entrance and same-wall window reach the durable worker without reinterpretation',async()=>{
 const design={roofStyle:'lean-to',width:6,length:8,openings:[{id:'door',kind:'door',type:'single',wall:'back',x:24},{id:'window',kind:'window',wall:'back',x:60}]};
 const body=backyardPhotoRequest('reference',design);
 assert.equal(body.design.renderingConstraints.roof.lowWall,'back');
 assert.equal(body.design.renderingConstraints.roof.highWall,'front');
 assert.deepEqual(body.design.renderingConstraints.openings,design.openings);
 assert.deepEqual(body.design.openings,design.openings);
 assert.match(body.design.renderingConstraints.instructions,/entrance may be on the LOW wall/);
 const previous=globalThis.fetch;
 try{globalThis.fetch=async(url,options)=>{const sent=JSON.parse(options.body).request;assert.deepEqual(sent,JSON.parse(JSON.stringify(body)));return {ok:true,json:async()=>({status:'working'})};};await requestPhoto(photo,body,{signal});}finally{globalThis.fetch=previous;}
});
test('owner iframe completion waits until layer uploads and the durable photo request finish',async()=>{
 const events=[];
 const result=await followPhoto(photo,{}, {signal,layerImages:{},upload:async()=>{events.push('upload');return {files:{}};},start:async()=>{events.push('start');return {status:'ready',image:'/ready.jpg'};},onStarted:accepted=>events.push(accepted?'accepted':'rejected')});
 assert.deepEqual(events,['upload','start','accepted']);assert.equal(result.status,'ready');
 const failures=[];
 await followPhoto(photo,{}, {signal,layerImages:{},upload:async()=>{throw Error('upload');},start:()=>assert.fail(),onStarted:ok=>failures.push(ok)});
 assert.deepEqual(failures,[false]);
});

test('upload failure reports a visible failure before dispatch without polling an unstarted job',async()=>{
 const failures=[];
 const result=await followPhoto(photo,{setting:'lawn'},{signal,layerImages:{},upload:async()=>{throw Error('storage rejected');},start:()=>assert.fail(),poll:()=>assert.fail(),onStarted:(ok,detail)=>failures.push({ok,detail})});
 assert.equal(result.stage,'upload');assert.equal(result.error,PHOTO_UPLOAD_ERROR);
 assert.deepEqual(failures,[{ok:false,detail:result}]);
});
test('a lost start response reports the problem while polling can recover the saved job',async()=>{
 const failures=[];
 const result=await followPhoto(photo,{}, {signal,start:async()=>{throw Error('offline');},onStarted:(ok,detail)=>failures.push({ok,detail}),wait:async()=>{},poll:async()=>({status:'ready',image:'/photo.jpg'})});
 assert.equal(failures[0].ok,false);assert.equal(failures[0].detail.error,PHOTO_START_ERROR);
 assert.equal(result.status,'ready');
});
test('all three backyard choices await uploads before accepting the photo start',async()=>{
 for(const setting of ['lawn','coastal','garden']){
  const events=[];let release;
  const gate=new Promise(resolve=>{release=resolve;});
  const pending=followPhoto(photo,{setting,shedImage:'reference'},{signal,layerImages:{shedCutout:'png'},upload:async()=>{events.push('upload');await gate;return {version:'cfs-layers-v1',files:{}};},start:async(job,body)=>{events.push('post');assert.equal(body.setting,setting);assert.equal(body.layers.version,'cfs-layers-v1');return {status:'ready',image:'/ready.png'};},onStarted:accepted=>events.push(accepted?'accepted':'rejected')});
  assert.deepEqual(events,['upload']);release();
  assert.equal((await pending).status,'ready');assert.deepEqual(events,['upload','post','accepted']);
 }
});
