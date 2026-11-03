import fixtureCatalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {getCatalog,loadRenderDesign,API_BASE} from '../src/api.js';
import {buildDesign} from '../src/designContract.js';
import {sampleStates} from '../src/sampleStates.js';
import {modelDesign} from '../src/modelBridge.js';
import {fitSavedDesign} from '../src/renderFit.js';
import {submitRenderedDesign} from '../src/renderSubmission.js';
const catalog=applyApprovedColors(structuredClone(fixtureCatalog));
test('automatic render uses normal captures and fitted design, then starts photo before completing',async()=>{
 const state=sampleStates(catalog)[1],original=buildDesign(catalog,state);original.shed.length=12;
 const fitted=fitSavedDesign(catalog,original,state).state;fitted.backyardSetting='lawn';
 const loaded={design:original,state:fitted,contact:{firstName:'Edited'},quoteNumber:'Q-1'};
 const images=['render','front','left','back','right','elev-front','elev-left','elev-back','elev-right'].map(view=>({view}));
 const detail={visibleWalls:['front','left'],detailCrops:[{id:'door-1'}]},layers={shedCutout:'png',pathLayer:'png',shadowLayer:'png'},events=[];
 const viewer={captureSubmission:async(render,source)=>{assert.equal(render,null);assert.equal(source,'pending');events.push('pictures');return images;},capture:(auto,guide,setting)=>{assert.equal(auto,true);assert.equal(guide,true);assert.equal(setting,'lawn');events.push('reference');return {image:'reference',referenceDetails:detail,physicalSize:{widthFt:12},layerImages:layers};}};
 const result=await submitRenderedDesign({catalog,loaded,token:'opaque-render',viewer,model:modelDesign(catalog,fitted),signal:new AbortController().signal},{submit:async body=>{events.push('submit');assert.equal(body.renderToken,'opaque-render');assert.equal(body.editToken,undefined);assert.equal(body.shed.length,12);assert.equal(body.elements[0].x,72);assert.equal(body.customer.firstName,'Edited');assert.deepEqual(body.images,images);assert.deepEqual(body.editorState.state,fitted);return {ok:true,quoteNumber:'Q-1',photo:{id:'job',token:'job-token'}};},photo:async(job,request,options)=>{events.push('photo');assert.equal(job.id,'job');assert.equal(request.setting,'lawn');assert.deepEqual(request.referenceDetails,detail);assert.deepEqual(options.layerImages,layers);return {status:'working'};}});
 assert.equal(result.quoteNumber,'Q-1');assert.deepEqual(events,['pictures','reference','submit','photo']);
});
test('render load forwards only render token and reports expiry',async()=>{
 const before=globalThis.fetch;let url;
 try{globalThis.fetch=async input=>{url=input;return {ok:true,json:async()=>({mode:'owner-render'})};};await loadRenderDesign('opaque+render');assert.equal(url,API_BASE+'/api/form?designer=load&render=opaque%2Brender');globalThis.fetch=async()=>({status:401,ok:false});await assert.rejects(loadRenderDesign('expired'),/This edit link expired/);}finally{globalThis.fetch=before;}
});
