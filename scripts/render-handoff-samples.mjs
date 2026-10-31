import {elevationCameras} from '../src/submissionCapture.js';
import {captureScene} from './software-capture.mjs';
// Software captures from the SAME Shed React component used by the designer.
// Software rasterization preserves geometry/colors, but does not render WebGL textures.
import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import React from 'react';
import {createRoot,extend,flushSync} from '@react-three/fiber';
import * as THREE from 'three';
import {SVGRenderer} from 'three/examples/jsm/renderers/SVGRenderer.js';
import sharp from 'sharp';
import catalogRaw from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {modelDesign} from '../src/modelBridge.js';
import {frameBackyardCamera} from '../src/backyardCamera.js';
const catalog=applyApprovedColors(catalogRaw);
class Element{
 constructor(tag){this.tagName=tag;this.attributes={};this.childNodes=[];this.style={};this.width=1200;this.height=800;}
 setAttribute(k,v){this.attributes[k]=String(v);}removeAttribute(k){delete this.attributes[k];}
 appendChild(n){this.childNodes.push(n);return n;}removeChild(n){this.childNodes.splice(this.childNodes.indexOf(n),1);}
 addEventListener(){}removeEventListener(){}
 getContext(){const gradient={addColorStop(){}};return new Proxy({canvas:this,createLinearGradient:()=>gradient,createRadialGradient:()=>gradient,createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})},{get:(t,p)=>p in t?t[p]:()=>{}});}
 get outerHTML(){const attrs=Object.entries(this.attributes).map(([k,v])=>` ${k}="${v.replaceAll('&','&amp;').replaceAll('"','&quot;')}"`).join('');return `<${this.tagName}${attrs}>${this.childNodes.map(n=>n.outerHTML).join('')}</${this.tagName}>`;}
}
globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_,tag)=>new Element(tag)};
globalThis.window={devicePixelRatio:1};globalThis.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),16);globalThis.cancelAnimationFrame=clearTimeout;
extend(THREE);
await fs.mkdir('handoff/samples',{recursive:true});
await build({entryPoints:['src/Shed.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'handoff/.shed-render.mjs'});
const {default:Shed}=await import(path.resolve('handoff/.shed-render.mjs'));
for(const [i,state] of sampleStates(catalog).entries()){
 const d=modelDesign(catalog,state),canvas=new Element('canvas');let scene;
 const renderer={render(){},setPixelRatio(){},setSize(){},getPixelRatio(){return 1;},domElement:canvas};
 const root=createRoot(canvas);root.configure({gl:renderer,frameloop:'never',size:{width:1500,height:1000,top:0,left:0},camera:{position:[20,12,20],fov:39,near:.1,far:500},onCreated:s=>{scene=s;}});
 flushSync(()=>root.render(React.createElement('group',{},
  React.createElement('ambientLight',{intensity:1}),React.createElement('directionalLight',{position:[9,20,12],intensity:2}),
  React.createElement('group',{rotation:[0,0,0]},React.createElement(Shed,{w:d.width,l:d.length,wallHeight:d.height,pitch:d.pitch,roofStyle:d.roofStyle,dormer:d.dormer,paint:d.paint,trim:d.trim,roofColor:d.roof,roofMaterial:d.roofMaterial,metalColor:d.metalColor,sidingType:d.sidingType,concreteSlab:false,openings:d.openings,setSelected(){}})))));
 await new Promise(resolve=>setTimeout(resolve,300));
 if(!scene)throw new Error('Model scene did not mount.');
 scene.scene.updateMatrixWorld(true);const shed=scene.scene.children.find(c=>c.type==='Group')?.children.find(c=>c.type==='Group');
 const camera=new THREE.PerspectiveCamera().copy(scene.camera);const target=frameBackyardCamera(camera,shed||scene.scene,d.openings);camera.lookAt(target);camera.updateMatrixWorld(true);
 const images=[];
 const bounds=new THREE.Box3().setFromObject(shed||scene.scene);
 for(const {view,camera:shotCamera} of [{view:'render',camera},...elevationCameras(bounds)]){
  const pixels=captureScene(scene.scene,shotCamera,1500,1000);
  const jpg=await sharp(pixels.data,{raw:{width:pixels.width,height:pixels.height,channels:4}}).jpeg({quality:85}).toBuffer();
  await fs.writeFile(`handoff/samples/sample-${i+1}-${view}.jpg`,jpg);
  images.push({view,type:'image/jpeg',data:'data:image/jpeg;base64,'+jpg.toString('base64')});
 }
 const design=buildDesign(catalog,state,{mode:i===2?'owner':'customer',startedAt:Date.now(),submittedAt:new Date().toISOString(),customer:{firstName:'Sample',lastName:'Customer',phone:'910-555-0100',email:'sample@example.com',address:{street:'123 Sample Ln',city:'Wilmington',state:'NC',zip:'28403'},smsConsent:false,notes:'Software-rendered test submission; not a real customer.'},images});
 await fs.writeFile(`handoff/samples/sample-${i+1}.json`,JSON.stringify(design,null,2));
 process.stdout.write(`sample-${i+1}: ${images.length} pictures, ${JSON.stringify(design).length} payload bytes\n`);root.unmount();
}
await fs.rm('handoff/.shed-render.mjs');
