import test from 'node:test';
import assert from 'node:assert/strict';
import {creepOwnerProgress,ownerProgressCap} from '../src/ownerSaveProgress.js';
import {holdOwnerSaveWakeLock} from '../src/ownerWakeLock.js';
import {submitOwnerDesign} from '../src/ownerSubmission.js';
import {startPhoto} from '../src/photoJob.js';

test('creep advances monotonically and never completes a pending save, upload or photo POST',()=>{
 let value=0;
 for(const [stage,confirmed,cap] of [['saving',0,35],['sending',35,35+40/3],['sending',35+40/3,35+80/3],['sending',35+80/3,75],['starting',75,100]]){
  for(let i=0;i<2000;i++){const next=creepOwnerProgress(value,stage,confirmed);assert(next>=value);assert(next<cap);value=next;}
  assert.equal(ownerProgressCap(stage,confirmed),cap-.5);
 }
 assert.equal(creepOwnerProgress(value,'done',100),100);
 assert.equal(creepOwnerProgress(90,'starting',75)>=90,true);
});
test('confirmed owner progress comes from save response, each completed upload and accepted POST',async()=>{
 const values=[];
 await submitOwnerDesign({}, {photoRequest:{},layerImages:{},onProgress:value=>values.push(value)}, {
  submit:async()=>({ok:true,photo:{id:'job',token:'token'}}),
  upload:async(job,images,{onUpload})=>{for(let i=1;i<=3;i++)onUpload(i,3);return {};},
  photo:(job,body,options)=>startPhoto(job,body,{...options,start:async()=>{assert.equal(values.at(-1),75);return {status:'working'};}})
 });
 assert.deepEqual(values,[35,35+40/3,35+80/3,75,75,75,100]);
});
test('wake lock releases after saving, including a grant received after cleanup',async()=>{
 let release=0,grant;
 const pending=new Promise(resolve=>{grant=resolve;});
 const cleanup=holdOwnerSaveWakeLock({wakeLock:{request:kind=>{assert.equal(kind,'screen');return pending;}}},{});
 cleanup();grant({release:async()=>{release++;}});await new Promise(resolve=>setImmediate(resolve));
 assert.equal(release,1);
 let acquired=0;
 const releaseNormal=holdOwnerSaveWakeLock({wakeLock:{request:async()=>{acquired++;return {release:async()=>{release++;}};}}},{});
 await new Promise(resolve=>setImmediate(resolve));releaseNormal();assert.equal(acquired,1);assert.equal(release,2);
});
test('unsupported and rejected wake locks never block saving',async()=>{
 holdOwnerSaveWakeLock({}, {})();
 const cleanup=holdOwnerSaveWakeLock({wakeLock:{request:async()=>{throw new Error('denied');}}},{});
 await new Promise(resolve=>setImmediate(resolve));cleanup();
});
