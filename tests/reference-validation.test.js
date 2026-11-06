import test from 'node:test';
import assert from 'node:assert/strict';
import {Scene,Group,DirectionalLight} from 'three';
import {assertReferencePixels,showReferenceExterior} from '../src/referenceValidation.js';
test('rejects transparent, uniform and compression-noise-only references',()=>{
 const p=new Uint8Array(64*64*4);
 assert.throws(()=>assertReferencePixels(p),/blank/);
 p.fill(255);assert.throws(()=>assertReferencePixels(p),/blank/);
 for(let i=0;i<p.length;i+=4){p[i]=243+(i%3);p[i+1]=244;p[i+2]=241;}
 assert.throws(()=>assertReferencePixels(p),/blank/);
 for(let i=0;i<p.length/2;i+=4){p[i]=60;p[i+1]=50;p[i+2]=40;}
 assert.doesNotThrow(()=>assertReferencePixels(p));
});
test('capture reveals hidden exterior ancestors, hides interior, and restores state',()=>{
 const scene=new Scene(),parent=new Group(),exterior=new Group(),interior=new Group(),light=new DirectionalLight();
 parent.add(exterior);scene.add(parent,interior,light);parent.visible=false;exterior.visible=false;
 const restore=showReferenceExterior(scene,exterior);
 assert.equal(parent.visible,true);assert.equal(exterior.visible,true);assert.equal(interior.visible,false);assert.equal(light.visible,true);
 restore();assert.equal(parent.visible,false);assert.equal(exterior.visible,false);assert.equal(interior.visible,true);
});
