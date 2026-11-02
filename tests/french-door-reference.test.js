import test from 'node:test';
import assert from 'node:assert/strict';
import sharp from 'sharp';
import {Group,Mesh,BoxGeometry,MeshBasicMaterial,PerspectiveCamera} from 'three';
import {referenceDetails} from '../src/referenceDetails.js';
import {frenchDoorReference} from '../src/server/frenchDoorReference.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';
const design={openings:[{kind:'door',type:'french',width:72,height:80}]};
test('French facts and conditional prompt keep one active set and clear ungridded glass',()=>{
 const door=photoSpecification(design).openings[0];assert.equal(door.hardware.entrySets,1);assert.equal(door.hardware.leverHandles,1);assert.equal(door.hardware.deadbolts,1);assert.equal(door.hardware.exteriorStrapHinges,false);assert.equal(door.glazing.grids,false);
 const prompt=buildPhotoPrompt(design,{hasFrenchDoorDetail:true});assert.match(prompt,/Image 3 is the FRENCH DOOR detail/);assert.match(prompt,/passive RIGHT leaf has NO visible/);assert.match(prompt,/reflections of this yard, trees and sky/);
 assert.match(buildPhotoPrompt(design,{hasDormerDetail:true,hasTransomDetail:true,hasFrenchDoorDetail:true}),/Image 5 is the FRENCH DOOR detail/);
 assert.ok(!buildPhotoPrompt({openings:[{kind:'door',type:'double'}]}).includes('FRENCH DOORS:'));
});
test('French detail projects only the visible unit and crops source pixels',async()=>{
 const root=new Group(),unit=new Mesh(new BoxGeometry(6,6.67,.2),new MeshBasicMaterial());unit.userData.photoDetail='french-doors';unit.position.y=4;root.add(unit);
 const camera=new PerspectiveCamera(39,1.5,.1,500);camera.position.set(0,5,20);camera.lookAt(0,4,0);
 const details=referenceDetails(root,camera);assert.ok(details.frenchDoors.width>.2);assert.equal(details.doorTransoms,undefined);
 const blob=new Blob([await sharp({create:{width:400,height:300,channels:3,background:'#abbccd'}}).png().toBuffer()]);
 assert.equal((await sharp(await frenchDoorReference(blob,design,details)).metadata()).width,1024);
 assert.equal(await frenchDoorReference(blob,design),null);assert.equal(await frenchDoorReference(blob,{openings:[]},details),null);
 await assert.rejects(frenchDoorReference(blob,design,{frenchDoors:{x:-1,y:0,width:1,height:1}}),/invalid French door/);
 unit.rotation.y=Math.PI;assert.equal(referenceDetails(root,camera),undefined);
});
