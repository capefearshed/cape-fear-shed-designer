import test from 'node:test';
import assert from 'node:assert/strict';
import {photoFile,sharePhoto} from '../src/photoShare.js';
test('finished photo is shared as an image file on supported touch devices',async()=>{
 const image='data:image/png;base64,aGVsbG8=',file=photoFile(image);let shared;
 await sharePhoto(file,image,{nav:{maxTouchPoints:1,canShare:()=>true,share:async data=>{shared=data;}},download:()=>assert.fail('unexpected download')});
 assert.equal(shared.files[0],file);assert.equal(file.type,'image/png');assert.equal(await file.text(),'hello');assert.equal(Object.keys(shared).length,2);
});
test('desktop and unsupported phones download; cancelling share does not',async()=>{
 const image='data:image/jpeg;base64,aGVsbG8=',file=photoFile(image);let downloads=0;
 for(const nav of [{maxTouchPoints:0},{maxTouchPoints:1,canShare:()=>false}])await sharePhoto(file,image,{nav,download:()=>downloads++});
 await sharePhoto(file,image,{nav:{maxTouchPoints:1,canShare:()=>true,share:async()=>{throw Object.assign(new Error(),{name:'AbortError'});}},download:()=>downloads++});
 assert.equal(downloads,2);assert.equal(file.name,'cape-fear-shed-backyard.jpg');
});
