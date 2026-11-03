import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import fixture from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {modelDesign} from '../src/modelBridge.js';
import {backyardPhotoRequest} from '../src/api.js';
import {submitOwnerDesign} from '../src/ownerSubmission.js';
import {submitRenderedDesign} from '../src/renderSubmission.js';

const catalog=applyApprovedColors(structuredClone(fixture));
const customer={firstName:'Owner',lastName:'Test',phone:'9105550123',email:'test@example.com',address:{street:'123 Test St',city:'Wilmington',state:'NC',zip:'28401'}};
const images=['render','front','left','back','right','elev-front','elev-left','elev-back','elev-right'].map((view,i)=>i===0?{view,pending:true,source:'auto'}:{view,type:'image/jpeg',data:'data:image/jpeg;base64,YQ==',...(i>4?{hidden:true,pxPerFt:50,groundY:700}:{})});
const png=await sharp({create:{width:1536,height:1024,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).png().toBuffer();
const layerImages=Object.fromEntries(['shedCutout','pathLayer','shadowLayer'].map(name=>[name,'data:image/png;base64,'+png.toString('base64')]));
const allocation={version:'cfs-layers-v1',uploads:Object.fromEntries(Object.keys(layerImages).map(name=>[name,{path:'saved-job/'+name+'.png',url:'https://storage.example/'+name+'.png',method:'PUT',contentType:'image/png',maxBytes:8388608}]))};

for(const mode of ['edit','render'])for(const setting of ['lawn','coastal','garden']){
 test(mode+' save uploads layers and sends '+setting+' photo POST before completion',async()=>{
  const previous=globalThis.fetch,events=[];
  let reachPost,releasePost,completed=false;
  const reached=new Promise(resolve=>{reachPost=resolve;}),gate=new Promise(resolve=>{releasePost=resolve;});
  const state={...sampleStates(catalog)[0],backyardSetting:setting};
  const design=buildDesign(catalog,state,{customer,uses:['use-yard'],source:{code:'google'},images});
  const model=modelDesign(catalog,state),captured={image:'data:image/jpeg;base64,YQ==',layerImages,physicalSize:{widthFt:state.shed.width,lengthFt:state.shed.length}};
  const signal=new AbortController().signal;
  globalThis.fetch=async(url,options)=>{
   const action=new URL(url).searchParams.get('designer');
   if(action==='submit'){
    events.push('save');const body=JSON.parse(options.body);
    assert.equal(body[mode+'Token'],'session-token');
    assert.equal(body[mode==='edit'?'renderToken':'editToken'],undefined);
    assert.equal(body.editorState.backyardSetting,setting);
    return {ok:true,json:async()=>({ok:true,quoteNumber:'existing-quote',photo:{id:'saved-job',token:'photo-token'}})};
   }
   if(action==='photo-upload'){
    events.push('allocate');assert.deepEqual(JSON.parse(options.body),{id:'saved-job',token:'photo-token'});
    return {ok:true,json:async()=>allocation};
   }
   if(action==='photo'){
    events.push('photo');const body=JSON.parse(options.body);
    assert.equal(options.method,'POST');assert.equal(body.id,'saved-job');assert.equal(body.token,'photo-token');
    assert.equal(body.request.setting,setting);assert.deepEqual(body.request.design.openings,model.openings);
    assert.equal(body.request.layers.version,'cfs-layers-v1');assert.equal('shedCutout' in body.request,false);
    reachPost();await gate;return {ok:true,json:async()=>({status:'working'})};
   }
   assert.equal(new URL(url).hostname,'storage.example');
   events.push('put');assert.equal(options.method,'PUT');assert.equal(options.body instanceof Blob,true);
   return {ok:true};
  };
  try{
   let saving;
   if(mode==='edit'){
    saving=submitOwnerDesign({...design,editToken:'session-token'},{photoRequest:backyardPhotoRequest(captured.image,model,{setting}),layerImages,signal});
   }else{
    const viewer={captureSubmission:async()=>images,capture:(auto,guide,picked)=>{assert.equal(picked,setting);return captured;}};
    saving=submitRenderedDesign({catalog,loaded:{design,state,editorState:design.editorState},token:'session-token',viewer,model,signal});
   }
   saving=saving.then(response=>{completed=true;events.push('complete');return response;});
   await reached;assert.equal(completed,false);
   assert.deepEqual(events,['save','allocate','put','put','put','photo']);
   releasePost();assert.equal((await saving).quoteNumber,'existing-quote');
   assert.equal(events.at(-1),'complete');
  }finally{releasePost();globalThis.fetch=previous;}
 });
}
test('owner photo failure rejects without reporting completion or saving a second quote',async()=>{
 let saves=0,starts=0;
 const signal=new AbortController().signal;
 await assert.rejects(submitOwnerDesign({editToken:'session-token'},{photoRequest:{setting:'lawn'},layerImages,signal},{
  submit:async()=>{saves++;return {ok:true,photo:{id:'saved-job',token:'photo-token'}};},
  photo:async()=>{starts++;throw new Error('Your design was saved, but the photo layers could not be uploaded.');}
 }),/design was saved.*photo layers/);
 assert.equal(saves,1);assert.equal(starts,1);
});
