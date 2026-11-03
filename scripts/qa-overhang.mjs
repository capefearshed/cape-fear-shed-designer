import {captureScene} from './software-capture.mjs';
// Software captures from the SAME Shed React component used by the designer.
// Software rasterization preserves geometry/colors, but does not render WebGL textures.
import fs from 'node:fs/promises';
import path from 'node:path';
import {build} from 'esbuild';
import React from 'react';
import {createRoot,extend,flushSync} from '@react-three/fiber';
import * as THREE from 'three';
import sharp from 'sharp';
import catalogRaw from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {modelDesign} from '../src/modelBridge.js';
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
globalThis.window={devicePixelRatio:1,navigator:{userAgent:"Node QA"},screen:{width:900,height:650}};globalThis.requestAnimationFrame=callback=>setTimeout(()=>callback(performance.now()),16);globalThis.cancelAnimationFrame=clearTimeout;
extend(THREE);
await fs.mkdir('handoff/qa',{recursive:true});
await build({entryPoints:['src/Shed.jsx'],bundle:true,platform:'node',format:'esm',packages:'external',outfile:'handoff/.shed-render.mjs'});
const {default:Shed}=await import(path.resolve('handoff/.shed-render.mjs'));
for(const variant of ['standard','she-shed','soffit','soffit-lean']){
 const state=sampleStates(catalog)[0];state.shed.width=10;state.shed.length=12;
 if(variant==='soffit-lean')state.shed.style='style-lean-to';
 if(variant.startsWith('soffit'))state.extras.push({code:'roof-overhang-soffit-8',qty:1});
 if(variant==='she-shed')state.extras.push({code:'roof-overhang-she-shed',qty:1});
 const d=modelDesign(catalog,state),canvas=new Element('canvas');let scene;
 const renderer={render(){},setPixelRatio(){},setSize(){},getPixelRatio(){return 1;},domElement:canvas};
 const root=createRoot(canvas);root.configure({gl:renderer,frameloop:'never',size:{width:900,height:650,top:0,left:0},camera:{position:[20,12,20],fov:39,near:.1,far:500},onCreated:s=>{scene=s;}});
 flushSync(()=>root.render(React.createElement('group',{},React.createElement(Shed,{w:d.width,l:d.length,wallHeight:d.height,pitch:d.pitch,roofStyle:d.roofStyle,roofHighWall:d.roofHighWall,sheShedOverhang:d.sheShedOverhang,soffitOverhang:d.soffitOverhang,paint:d.paint,trim:d.trim,roofColor:d.roof,roofMaterial:d.roofMaterial,metalColor:d.metalColor,sidingType:d.sidingType,concreteSlab:false,openings:d.openings,setSelected(){}}))));
 await new Promise(resolve=>setTimeout(resolve,100));
 if(!scene)throw new Error('Model did not mount');
 const camera=new THREE.PerspectiveCamera(39,900/650,.1,500);camera.position.set(18,10.5,20);camera.lookAt(0,4.5,0);camera.updateMatrixWorld(true);
 const pixels=captureScene(scene.scene,camera,900,650);
 await sharp(pixels.data,{raw:{width:900,height:650,channels:4}}).png().toFile('handoff/qa/overhang-'+variant+'.png');
 console.log('Captured',variant);root.unmount();
}
await fs.rm('handoff/.shed-render.mjs');process.exit(0);
