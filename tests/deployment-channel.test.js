import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {isTestChannel} from '../src/deploymentChannel.js';
import {getCatalog,submitDesign} from '../src/api.js';
import {trackDesignSubmitted} from '../src/leadAnalytics.js';
import catalog from '../src/catalog.sample.json' with {type:'json'};

test('test folder disables the entire Google tag and confirmed conversions',()=>{
 const script=readFileSync(new URL('../index.html',import.meta.url),'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];
 const target={location:{pathname:'/design-test/',href:'https://app.capefearshed.com/design-test/'},gtag(){assert.fail('test conversion');}};
 vm.runInNewContext(script,{window:target});
 assert.equal(target.dataLayer,undefined);
 assert.equal(trackDesignSubmitted({shed:{width:10,length:12},source:{code:'google'}},{ok:true},{target}),false);
 assert.equal(isTestChannel('/design/'),false);
 assert.equal(isTestChannel('/design-test/nested'),true);
});

test('catalog retains server test items and submit explicitly marks only the test channel',async()=>{
 const previousFetch=globalThis.fetch,previousLocation=globalThis.location;
 const extra={...catalog.options.find(o=>o.kind==='window'),code:'window-test-new',testOnly:true};
 const incoming={...structuredClone(catalog),options:[...catalog.options,extra]};
 const customer={firstName:'Test',lastName:'Channel',phone:'9105550100',email:'test@example.com',address:{street:'Sample',city:'Wilmington',zip:'28403'}};
 const images=[{view:'render',source:'auto',pending:true},...['front','left','back','right','elev-front','elev-left','elev-back','elev-right'].map(view=>({view,type:'image/jpeg',data:'data:image/jpeg;base64,/9j/',...(view.startsWith('elev-')?{hidden:true,pxPerFt:40,groundY:750}:{})}))];
 try{
  for(const [path,channel] of [['/design-test/','test'],['/design/',undefined]]){
   globalThis.location={pathname:path};
   globalThis.fetch=async(url,options)=>{
    if(url.includes('designer=catalog')){assert.equal(new URL(url,'https://app.capefearshed.com').searchParams.get('channel'),channel||null);return {ok:true,json:async()=>incoming};}
    assert.equal(JSON.parse(options.body).channel,channel);return {ok:true,json:async()=>({ok:true})};
   };
   const result=await getCatalog();assert.deepEqual(result.options,incoming.options);
   const design={customer,images};await submitDesign(design);assert.equal(design.channel,undefined);
  }
 }finally{globalThis.fetch=previousFetch;if(previousLocation===undefined)delete globalThis.location;else globalThis.location=previousLocation;}
});
