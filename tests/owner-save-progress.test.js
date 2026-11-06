import test from 'node:test';
import assert from 'node:assert/strict';
import {submitOwnerDesign} from '../src/ownerSubmission.js';
import {startPhoto} from '../src/photoJob.js';
const body={editToken:'session'},photoRequest={setting:'lawn'},layerImages={shedCutout:'image'},signal=new AbortController().signal;
const response={ok:true,photo:{id:'job',token:'token'}};

test('owner progress follows save, upload and POST; completion waits for POST',async()=>{
 const events=[];let release,reached;
 const gate=new Promise(resolve=>{release=resolve;}),atPost=new Promise(resolve=>{reached=resolve;});
 const saving=submitOwnerDesign(body,{photoRequest,layerImages,signal,onStage:stage=>events.push(stage)},{
  submit:async()=>{events.push('save');return response;},upload:async()=>{events.push('upload');return {version:'layers'};},
  photo:(job,request,options)=>startPhoto(job,request,{...options,start:async()=>{events.push('post');reached();await gate;return {status:'working'};}})
 }).then(()=>events.push('complete'));
 await atPost;assert.deepEqual(events,['saving','save','sending','upload','starting','post']);
 release();await saving;assert.equal(events.at(-1),'complete');
});
test('upload failure retries the existing saved quote and reports the failed step',async()=>{
 const attempt={};let saves=0,uploads=0,posts=0;
 const deps={submit:async()=>{saves++;return response;},upload:async()=>{if(++uploads===1)throw new Error('network');return {version:'layers'};},photo:(job,request,options)=>startPhoto(job,request,{...options,start:async()=>{posts++;return {status:'working'};}})};
 await assert.rejects(submitOwnerDesign(body,{photoRequest,layerImages,signal,attempt},deps),/Sending pictures failed/);
 await submitOwnerDesign(body,{photoRequest,layerImages,signal,attempt},deps);
 assert.equal(saves,1);assert.equal(uploads,2);assert.equal(posts,1);
});
for(const status of ['waiting','working'])test('lost photo response retry checks '+status+' job before redispatch',async()=>{
 const attempt={};let saves=0,uploads=0,posts=0,polls=0;
 const deps={submit:async()=>{saves++;return response;},upload:async()=>{uploads++;return {version:'layers'};},poll:async()=>{polls++;return {status};},photo:(job,request,options)=>startPhoto(job,request,{...options,start:async()=>{if(++posts===1)throw new Error('lost response');return {status:'working'};}})};
 await assert.rejects(submitOwnerDesign(body,{photoRequest,layerImages,signal,attempt},deps),/Starting the backyard photo failed/);
 await submitOwnerDesign(body,{photoRequest,layerImages,signal,attempt},deps);
 assert.equal(saves,1);assert.equal(uploads,1);assert.equal(polls,1);assert.equal(posts,status==='working'?1:2);
});
test('failed save cannot dispatch photo or become Updated',async()=>{
 let dispatched=false;
 await assert.rejects(submitOwnerDesign(body,{photoRequest,signal},{submit:async()=>{throw new Error('expired');},photo:async()=>{dispatched=true;}}),/Saving your changes failed: expired/);
 assert.equal(dispatched,false);
});
