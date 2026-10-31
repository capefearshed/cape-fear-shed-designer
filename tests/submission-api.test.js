import test from 'node:test';
import assert from 'node:assert/strict';
import {submitDesign,MAX_SUBMISSION_BYTES} from '../src/api.js';
const images=['render','front','left','back','right'].map(view=>({view,type:'image/jpeg',data:'data:image/jpeg;base64,/9j/'}));
test('submission requires ordered five pictures and enforces the body limit',async()=>{
 await assert.rejects(submitDesign({images:[]}),/four wall pictures/);
 await assert.rejects(submitDesign({images:[...images].reverse()}),/four wall pictures/);
 await assert.rejects(submitDesign({images,notes:'x'.repeat(MAX_SUBMISSION_BYTES)}),/too large/);
});
test('test submission never calls the network and redacts the owner token',async()=>{
 const originalFetch=globalThis.fetch,originalInfo=console.info;let logged;
 globalThis.fetch=()=>{throw new Error('Stub must not call a live endpoint');};console.info=(label,value)=>{logged=value;};
 try{
  const result=await submitDesign({images,context:{ownerToken:'private-test-token'}});
  assert.equal(result.ok,true);assert.equal(result.stub,true);assert.equal(logged.context.ownerToken,null);
 }finally{globalThis.fetch=originalFetch;console.info=originalInfo;}
});
