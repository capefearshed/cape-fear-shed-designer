import test from 'node:test';
import assert from 'node:assert/strict';
import {INTERIOR_SPECS,interiorLayout} from '../src/interiorLayout.js';
test('interior accessories retain specified dimensions and fit every offered footprint',()=>{
 assert.equal(INTERIOR_SPECS.loft.undersideIn,72);
 for(let width=4;width<=16;width+=2)for(let length=Math.max(6,width);length<=24;length+=2){
  for(const loft of [false,true]){
   const p=interiorLayout(width,length,{loft});
   assert.equal(p.loft.width*12,45);
   assert.ok(Math.abs((p.loft.top-p.loft.bottom)*12-4)<1e-8);
   assert.equal(p.loft.bottom*12,72);
   assert.equal(p.workbench.top*12,34);
   assert.equal(p.workbench.depth*12,18);
   assert.ok(Math.abs((p.workbench.top-p.workbench.bottom)*12-4)<1e-8);
   assert.ok(p.workbench.width>0);
   if(loft)assert.ok(p.workbench.x-p.workbench.width/2>=p.loft.x+p.loft.width/2-1e-8);
   assert.equal((p.surfRack.levels[1]-p.surfRack.levels[0])*12,12);
   assert.equal((p.surfRack.levels[2]-p.surfRack.levels[1])*12,12);
  }
 }
});
