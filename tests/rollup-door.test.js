import test from 'node:test';
import assert from 'node:assert/strict';
import {PlaneGeometry,Matrix4} from 'three';
import {DOOR_OPTIONS,doorAllowed} from '../src/doorOptions.js';
import {cutWallGeometry,rollupHoles} from '../src/wallCutout.js';
const door=DOOR_OPTIONS.find(o=>o.type==='rollup');
test('roll-up requires width at least 10, walls strictly above 7 and a gable end',()=>{
 assert.deepEqual([door.width,door.height,door.recessIn],[72,84,4]);
 for(const width of [4,6,8,10,12,14,16])for(const height of [6.5,7,8])for(const roof of ['gable','lean-to'])for(const wall of ['front','back','left','right']){
  assert.equal(doorAllowed({...door,wall},height,width,roof),width>=10&&height>7&&roof==='gable'&&['left','right'].includes(wall));
 }
});
test('siding cutout removes the door rectangle and preserves the surrounding wall and UVs',()=>{
 const source=new PlaneGeometry(12,8);source.translate(0,4,0);
 const cut=cutWallGeometry(source,new Matrix4(),[{left:-3,right:3,bottom:0,top:7}]);
 const pos=cut.attributes.position;let area=0;
 for(let i=0;i<pos.count;i+=3){
  const x=[0,1,2].map(j=>pos.getX(i+j)),y=[0,1,2].map(j=>pos.getY(i+j));
  const centerX=x.reduce((a,b)=>a+b,0)/3,centerY=y.reduce((a,b)=>a+b,0)/3;
  assert.ok(!(centerX>-3+1e-6&&centerX<3-1e-6&&centerY>0&&centerY<7-1e-6));
  area+=Math.abs((x[1]-x[0])*(y[2]-y[0])-(y[1]-y[0])*(x[2]-x[0]))/2;
 }
 assert.ok(Math.abs(area-(12*8-6*7))<1e-5);
 assert.equal(cut.attributes.uv.count,pos.count);
 assert.equal(cut.attributes.normal.count,pos.count);
 source.dispose();cut.dispose();
});
test('recessed gable holes follow offsets on both opposite end walls',()=>{
 for(const wall of ['left','right']){
  const holes=rollupHoles([{...door,wall,x:48}],wall,12);
  assert.equal((holes[0].left+holes[0].right)/2,wall==='right'?2:-2);
  assert.equal(holes[0].top,7+1.5/12);
 }
});

test('threshold extends beneath and beyond the recessed curtain on wood and concrete floors',async()=>{
 const {rollupThreshold}=await import('../src/rollupGeometry.js');
 for(const floorOffset of [0,.0275]){
  const t=rollupThreshold(4/12,floorOffset);
  assert.ok(t.z-t.depth/2< -4/12-.027);
  assert.ok(t.z+t.depth/2>0);
  assert.ok(t.y-t.thickness/2>floorOffset);
 }
});
