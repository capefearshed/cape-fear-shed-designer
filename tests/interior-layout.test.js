import test from 'node:test';
import assert from 'node:assert/strict';
import {INTERIOR_SPECS,interiorLayout,openingRects,wallPanels,wallPose} from '../src/interiorLayout.js';
test('loft and bench switch gable ends while retaining exact dimensions',()=>{
 assert.equal(INTERIOR_SPECS.loft.undersideIn,72);
 for(let width=4;width<=16;width+=2)for(let length=Math.max(6,width);length<=24;length+=2)for(const wall of ['left','right']){
  const p=interiorLayout(width,length,{loft:true,workbench:true},{loft:wall,workbench:wall});
  for(const id of ['loft','workbench']){assert.equal(p[id].wall,wall);assert.equal(Math.sign(p[id].x),wall==='left'?-1:1);assert.ok(Math.abs(p[id].x)+p[id].width/2<=p.insideLength/2+1e-8);assert.equal(p[id].depth,p.insideWidth);assert.ok(Math.abs((p[id].top-p[id].bottom)*12-4)<1e-8);}
  assert.equal(p.loft.width*12,45);assert.equal(p.loft.bottom*12,72);
  assert.equal(p.workbench.width*12,18);assert.equal(p.workbench.top*12,34);
 }
});
test('surf rack has a horizontal row at 12-inch centers on every wall, clear of doors',()=>{
 for(const wall of ['front','back','left','right']){
  const p=interiorLayout(10,12,{surfRack:true},{surfRack:wall},[{id:'door',wall,kind:'door',x:30,width:36,height:73.5,y:0}]);
  const rack=p.surfRack;assert.equal(rack.wall,wall);assert.equal(rack.height,3.5);assert.ok(rack.count>=2);
  for(let i=1;i<rack.dowels.length;i++)assert.equal(rack.dowels[i]-rack.dowels[i-1],1);
  const door=openingRects(wall,10,12,[{wall,kind:'door',x:30,width:36,height:73.5,y:0}])[0];
  assert.ok(rack.center+rack.railWidth/2<=door.x-door.width/2-.29||rack.center-rack.railWidth/2>=door.x+door.width/2+.29);
 }
 const full=interiorLayout(4,6,{}, {surfRack:'left'},[{id:'door',wall:'left',kind:'door',x:24,width:42,height:73.5,y:0}]);assert.equal(full.surfRack.count,0);
});
test('wall backing preserves every door and window hole and maps all four wall coordinates',()=>{
 for(const wall of ['front','back','left','right']){
  const openings=[{id:'a',wall,kind:'door',x:30,width:36,height:73.5,y:0},{id:'b',wall,kind:'window',x:85,width:20,height:28.5,y:40}];
  const rects=openingRects(wall,10,12,openings),pose=wallPose(wall,10,12),panels=wallPanels(pose.span,7,rects);
  for(const r of rects){assert.equal(r.x,(openings.find(o=>o.id===r.id).x/12-pose.span/2)*pose.reverse);for(const panel of panels){const overlapsX=Math.min(panel.x+panel.width/2,r.x+r.width/2)-Math.max(panel.x-panel.width/2,r.x-r.width/2);const overlapsY=Math.min(panel.y+panel.height/2,r.top)-Math.max(panel.y-panel.height/2,r.bottom);assert.ok(overlapsX<1e-8||overlapsY<1e-8);}}
 }
});

test('windows do not shorten surf racks; mounting rail lowers below their sills',()=>{
 for(const wall of ['front','back','left','right']){
  const empty=interiorLayout(10,12,{}, {surfRack:wall}).surfRack;
  const pose=wallPose(wall,10,12);
  const beneath=interiorLayout(10,12,{}, {surfRack:wall},[{id:'window',wall,kind:'window',x:pose.span*6,width:30,height:28.5,y:40}]).surfRack;
  assert.equal(beneath.railWidth,empty.railWidth);assert.equal(beneath.count,empty.count);assert.equal(beneath.center,empty.center);
  assert.ok(beneath.height+2.75/12<40/12);
 }
});
