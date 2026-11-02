import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera} from 'three';
import {referenceDetails} from '../src/referenceDetails.js';
import {transomReference} from '../src/server/transomReference.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const design={windowFrameColor:'#202224',openings:[{kind:'door',transom:true}]};
test('transom bounds include both door leaves and omit the hidden far wall',()=>{
 const root=new Group();
 for(const x of [-1,1]){const leaf=new Mesh(new BoxGeometry(1.4,.85,.05),new MeshBasicMaterial());leaf.position.set(x,4,2);leaf.userData.photoDetail='door-transom';root.add(leaf);}
 const back=new Mesh(new BoxGeometry(2,1,.05),new MeshBasicMaterial());back.position.set(0,4,-2);back.rotation.y=Math.PI;back.userData.photoDetail='door-transom';root.add(back);
 const camera=new PerspectiveCamera(39,1.5,.1,500);camera.position.set(0,5,15);camera.lookAt(0,4,0);
 const details=referenceDetails(root,camera);assert.ok(details.doorTransoms.width>.2);assert.equal(details.dormer,undefined);
 const expected=structuredClone(details);root.remove(back);assert.deepEqual(referenceDetails(root,camera),expected);
 root.children.forEach(n=>n.rotation.y=Math.PI);assert.equal(referenceDetails(root,camera),undefined);
});
test('transom crop supports non-dormer designs and older requests',async()=>{
 const blob=new Blob([await sharp({create:{width:200,height:100,channels:3,background:'#202224'}}).png().toBuffer()]);
 const bounds={doorTransoms:{x:.1,y:.2,width:.6,height:.3}};
 const crop=await transomReference(blob,design,bounds);assert.equal((await sharp(crop).metadata()).width,1024);
 assert.equal(await transomReference(blob,design),null);assert.equal(await transomReference(blob,{openings:[]},bounds),null);
 await assert.rejects(transomReference(blob,design,{doorTransoms:{x:-1,y:0,width:1,height:1}}),/invalid door transom/);
});
test('transom prompt numbers images conditionally and follows black or white selection',()=>{
 assert.match(buildPhotoPrompt(design,{hasTransomDetail:true}),/Image 3 is an enlarged crop of the DOOR TRANSOMS/);
 const both=buildPhotoPrompt(design,{hasDormerDetail:true,hasTransomDetail:true});
 assert.match(both,/Image 4 is an enlarged crop of the DOOR TRANSOMS/);assert.match(both,/window-frame color #202224/);
 assert.match(buildPhotoPrompt({...design,windowFrameColor:'#f0f0ed'},{hasTransomDetail:true}),/window-frame color #F0F0ED/);
 assert.ok(!buildPhotoPrompt(design).includes('crop of the DOOR TRANSOMS'));
});
