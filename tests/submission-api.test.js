import test from 'node:test';
import assert from 'node:assert/strict';
import {submitDesign,MAX_SUBMISSION_BYTES,validateCustomer,SEND_ERROR,API_BASE} from '../src/api.js';
const images=['render','front','left','back','right'].map(view=>({view,...(view==='render'?{source:'auto'}:{}),type:'image/jpeg',data:'data:image/jpeg;base64,/9j/'}));
const customer={firstName:'Sample',lastName:'Customer',phone:'910-555-0100',email:'sample@example.com',address:{street:'123 Sample Ln',city:'Wilmington',state:'NC',zip:'28403'}};
test('submission requires ordered five pictures and enforces the body limit',async()=>{
 await assert.rejects(submitDesign({customer,images:[]}),/four wall pictures/);
 await assert.rejects(submitDesign({customer,images:[...images].reverse()}),/four wall pictures/);
 await assert.rejects(submitDesign({customer,images,notes:'x'.repeat(MAX_SUBMISSION_BYTES)}),/too large/);
});
test('live test endpoint receives JSON and returns the real quote number',async()=>{
 const originalFetch=globalThis.fetch;let captured;
 globalThis.fetch=async(url,options)=>{captured={url,options};return {ok:true,json:async()=>({ok:true,test:true,quoteNumber:'2020'})};};
 try{
  const result=await submitDesign({customer,images});assert.equal(result.quoteNumber,'2020');
  assert.equal(captured.url,API_BASE+'/api/form?designer=submit');assert.equal(captured.options.method,'POST');assert.equal(captured.options.headers['Content-Type'],'application/json');assert.deepEqual(JSON.parse(captured.options.body).images,images);
 }finally{globalThis.fetch=originalFetch;}
});
test('invalid contacts fail before sending and server errors preserve the design',async()=>{
 assert.match(validateCustomer({...customer,phone:'123'}),/10-digit/);
 assert.match(validateCustomer({...customer,address:{...customer.address,zip:'1234'}}),/5-digit/);
 assert.match(validateCustomer({...customer,email:'invalid'}),/email/);
 const originalFetch=globalThis.fetch,design={customer,images};const before=JSON.stringify(design);
 globalThis.fetch=async()=>({ok:false,status:500});
 try{await assert.rejects(submitDesign(design),{message:SEND_ERROR});assert.equal(JSON.stringify(design),before);}finally{globalThis.fetch=originalFetch;}
});
