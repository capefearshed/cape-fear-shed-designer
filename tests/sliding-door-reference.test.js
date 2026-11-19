import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera} from 'three';
import {referenceDetails} from '../src/referenceDetails.js';
import {slidingDoorReference} from '../src/server/slidingDoorReference.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const design={openings:[{kind:'door',type:'sliding'}]};
test('sliding facts lock one far-right door handle and all glass has faint soft reflections',()=>{
 const facts=photoSpecification(design);assert.equal(facts.openings[0].hardware.pullHandles,1);assert.equal(facts.openings[0].hardware.centerHandle,false);assert.equal(facts.openings[0].hardware.deadbolts,0);
 const prompt=buildPhotoPrompt(design,{hasSlidingDoorDetail:true});assert.match(prompt,/Image 3 is the SLIDING DOOR detail/);assert.match(prompt,/NO center-seam handle/);assert.match(prompt,/never to the surrounding wall casing/);
 assert.match(buildPhotoPrompt({}),/Every wall window, dormer window, door transom/);assert.match(prompt,/VERY FAINT, slightly blurred reflections/);assert.match(prompt,/barely perceptible veil/);assert.match(prompt,/No bright reflected lawn/);assert.match(buildPhotoPrompt({...design,foundation:'slab'}),/never wedge-shaped or ramped/);
 assert.ok(!buildPhotoPrompt({}).includes('SLIDING GLASS DOOR:'));
 assert.match(buildPhotoPrompt(design,{hasDormerDetail:true,hasTransomDetail:true,hasFrenchDoorDetail:true,hasSlidingDoorDetail:true}),/Image 6 is the SLIDING DOOR detail/);
});
test('visible sliding unit projects and crops from original source, missing inputs stay compatible',async()=>{
 const root=new Group(),unit=new Mesh(new BoxGeometry(6,6.67,.2),new MeshBasicMaterial());unit.userData.photoDetail='sliding-door';unit.position.y=4;root.add(unit);
 const camera=new PerspectiveCamera(39,1.5,.1,500);camera.position.set(0,5,20);camera.lookAt(0,4,0);
 const details=referenceDetails(root,camera);assert.ok(details.slidingDoors.width>.2);assert.equal(details.frenchDoors,undefined);
 const blob=new Blob([await sharp({create:{width:400,height:300,channels:3,background:'#abc'}}).png().toBuffer()]);
 assert.equal((await sharp(await slidingDoorReference(blob,design,details)).metadata()).width,1024);
 assert.equal(await slidingDoorReference(blob,design),null);assert.equal(await slidingDoorReference(blob,{openings:[]},details),null);
 await assert.rejects(slidingDoorReference(blob,design,{slidingDoors:{x:-1,y:0,width:1,height:1}}),/invalid sliding door/);
 unit.rotation.y=Math.PI;assert.equal(referenceDetails(root,camera),undefined);
});
