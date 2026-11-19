import test from 'node:test';
import assert from 'node:assert/strict';
import {validateOwnerContact} from '../src/ownerContact.js';
import {validateCustomer,submitDesign,ownerAddress} from '../src/api.js';
import {buildDesign} from '../src/designContract.js';
import {sampleStates} from '../src/sampleStates.js';
import {applyApprovedColors} from '../src/colorPalette.js';
import {savedContact} from '../src/savedDesign.js';
import raw from '../src/catalog.sample.json' with {type:'json'};
const person={firstName:'Test',lastName:'Owner',phone:'',email:'',address:{street:'',city:'',state:'',zip:''}};
const catalog=applyApprovedColors(structuredClone(raw));
const images=['render','front','left','back','right','elev-front','elev-left','elev-back','elev-right'].map((view,i)=>i===0?{view,pending:true,source:'auto'}:{view,type:'image/jpeg',data:'data:image/jpeg;base64,YQ==',...(i>4?{hidden:true,pxPerFt:50,groundY:700}:{})});
test('owner requires both names; every optional contact field permits blanks',()=>{
 assert.equal(validateOwnerContact(person),'');assert.equal(validateOwnerContact({...person,address:{...person.address,zip:'28403'}}),'');
 for(const field of ['firstName','lastName'])assert.match(validateOwnerContact({...person,[field]:' '}),/first and last name/);
 assert.notEqual(validateCustomer(person),'');
});
test('owner validates supplied phone, email and ZIP formats',()=>{
 for(const [patch,match] of [[{phone:'123'},/10-digit/],[{email:'bad'},/valid email/],[{address:{zip:'2840'}},/5-digit/]])assert.match(validateOwnerContact({...person,...patch}),match);
 assert.equal(validateOwnerContact({...person,phone:'(910) 555-0123',email:'test@example.com',address:{zip:'28403'}}),'');
});
test('build and submit keep owner ZIP-only/blank answers; customer and render validation stay strict',async()=>{
 const previous=globalThis.fetch,requests=[];
 globalThis.fetch=async(url,options)=>{requests.push(JSON.parse(options.body));return {ok:true,json:async()=>({ok:true})};};
 try{
  for(const zip of ['', '28403']){
   const design=buildDesign(catalog,sampleStates(catalog)[0],{customer:{...person,address:{...person.address,zip}},uses:[],source:{code:'',other:'',referredBy:''},images});
   await submitDesign({...design,editToken:'edit-test'});
   const body=requests.at(-1);assert.equal(body.customer.address.zip,zip);assert.equal(body.customer.address.street,'');assert.equal(body.customer.phone,'');assert.deepEqual(body.uses,[]);assert.deepEqual(body.source,{code:'',other:'',referredBy:''});
   await assert.rejects(submitDesign(design),/complete your name/);
   await assert.rejects(submitDesign({...design,renderToken:'render-test'}),/complete your name/);
  }
  assert.equal(requests.length,2);
 }finally{globalThis.fetch=previous;}
});
test('owner address predictions and place details use same edit token/session',async()=>{
 const previous=globalThis.fetch,urls=[];
 globalThis.fetch=async url=>{urls.push(new URL(url));return {ok:true,json:async()=>({suggestions:[]})};};
 try{
  await ownerAddress('token+edit',{q:'4210 Oleander',session:'random-session'});
  await ownerAddress('token+edit',{place:'place-1',session:'random-session'});
  for(const url of urls){assert.equal(url.searchParams.get('designer'),'address');assert.equal(url.searchParams.get('edit'),'token+edit');assert.equal(url.searchParams.get('session'),'random-session');}
  assert.equal(urls[0].searchParams.get('q'),'4210 Oleander');assert.equal(urls[1].searchParams.get('place'),'place-1');assert.equal(urls[1].searchParams.has('q'),false);
  await assert.rejects(ownerAddress('',{q:'street',session:'random-session'}),/owner edit session/);assert.equal(urls.length,2);
 }finally{globalThis.fetch=previous;}
});
test('owner prefill keeps existing address parts and leaves genuinely missing state blank',()=>{
 assert.equal(savedContact({customer:person},{},null,{allowPartial:true}).customer.address.state,'');
 const contact=savedContact({customer:{...person,address:{street:'Saved street',city:'Wilmington',state:'NC',zip:'28401'}}},{zip:'28403'},null,{allowPartial:true});
 assert.deepEqual(contact.customer.address,{street:'Saved street',city:'Wilmington',state:'NC',zip:'28403'});
});
