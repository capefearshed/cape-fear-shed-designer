import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera,Vector3} from 'three';
import {referenceDetails} from '../src/referenceDetails.js';
import {dormerReference} from '../src/server/dormerReference.js';
import {backyardPhotoRequest} from '../src/api.js';
import {buildPhotoPrompt,PHOTO_PROMPT_VERSION} from '../src/server/photoPrompt.js';

test('projects rotated dormer into the exact reference camera and transports its bounds',()=>{
 const shed=new Group(),dormer=new Group();shed.rotation.y=-.2;dormer.position.set(0,5,0);dormer.userData.photoDetail='dormer';
 dormer.add(new Mesh(new BoxGeometry(6,2,3),new MeshBasicMaterial()));shed.add(dormer);
 const camera=new PerspectiveCamera(39,1.5,.1,500);camera.position.set(15,12,20);camera.lookAt(0,4,0);
 const details=referenceDetails(shed,camera);assert.ok(details.dormer.width>.1);
 const box=details.dormer;
 const center=dormer.getWorldPosition(new Vector3()).project(camera),x=(center.x+1)/2,y=(1-center.y)/2;
 assert.ok(x>=box.x&&x<=box.x+box.width&&y>=box.y&&y<=box.y+box.height);
 assert.deepEqual(backyardPhotoRequest('image',{dormer:true},{referenceDetails:details}).referenceDetails,details);
 camera.lookAt(100,4,0);assert.equal(referenceDetails(shed,camera),undefined);
 assert.equal(referenceDetails(new Group(),camera),undefined);
});
test('detail is an enlarged pixel crop of image 1; old clients and no dormer need no extra image',async()=>{
 const data=Buffer.alloc(200*100*3,255);
 for(let y=20;y<60;y++)for(let x=50;x<150;x++){const i=(y*200+x)*3;data[i]=20;data[i+1]=40;data[i+2]=60;}
 const blob=new Blob([await sharp(data,{raw:{width:200,height:100,channels:3}}).png().toBuffer()]);
 const detail=await dormerReference(blob,{dormer:true},{dormer:{x:.25,y:.2,width:.5,height:.4}});
 const metadata=await sharp(detail).metadata(),stats=await sharp(detail).stats();
 assert.equal(metadata.width,1024);assert.equal(metadata.height,410);
 assert.ok(Math.abs(stats.channels[0].mean-20)<3);assert.ok(Math.abs(stats.channels[2].mean-60)<3);
 assert.equal(await dormerReference(blob,{dormer:false},{dormer:{}}),null);
 assert.equal(await dormerReference(blob,{dormer:true}),null);
 await assert.rejects(dormerReference(blob,{dormer:true},{dormer:{x:.9,y:0,width:.5,height:.2}}),/invalid dormer/);
 await assert.rejects(dormerReference(blob,{dormer:true},{dormer:{x:0,y:0,width:NaN,height:1}}),/invalid dormer/);
});
test('third-image instructions are conditional and distinguish dormer grids from wall windows',()=>{
 const basic=buildPhotoPrompt({dormer:true}),detail=buildPhotoPrompt({dormer:true},{hasDormerDetail:true});
 assert.ok(!basic.includes('Image 3'));assert.match(detail,/Image 3 is an enlarged crop/);
 assert.match(detail,/ZERO HORIZONTAL DIVIDERS/);assert.match(detail,/ordinary wall windows have horizontal grids/);
 assert.equal(PHOTO_PROMPT_VERSION,'cfs-reference-visible-walls-v11');
});
