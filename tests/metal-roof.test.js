import {METAL_COLORS} from '../src/metalColors.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {metalProfile,metalRoofAllowed,rakeProfile,METAL_TRIM,ridgeCapSection,rakeStripData} from '../src/metalRoofGeometry.js';
test('ribbed metal profile stays within roof length and repeats raised trapezoids at 9 inches',()=>{
 for(const length of [6+8/12,10+8/12,24+1]){
  const profile=metalProfile(length);
  assert.equal(profile[0][0],-length/2);assert.equal(profile.at(-1)[0],length/2);
  for(let i=0;i<profile.length;i++){const [x,y]=profile[i];assert.ok(Number.isFinite(x)&&Number.isFinite(y));assert.ok(y>=0&&y<=.75/12);if(i)assert.ok(x>=profile[i-1][0]);}
  const peaks=profile.filter(([,y])=>y===.75/12);
  assert.ok(peaks.length>6);
  const tops=[];for(let i=0;i<peaks.length-1;i++){if(Math.abs(peaks[i+1][0]-peaks[i][0]-(2/12*.34))<1e-7)tops.push((peaks[i][0]+peaks[i+1][0])/2);}
  for(let i=1;i<tops.length;i++)assert.ok(Math.abs(tops[i]-tops[i-1]-9/12)<1e-7);
 }
});
test('first metal roof release is limited to standard gables and never dormers',()=>{
 assert.equal(metalRoofAllowed('gable',false),true);
 assert.equal(metalRoofAllowed('gable',true),false);
 assert.equal(metalRoofAllowed('lean-to',false),false);
});

test('rake trim matches the supplied folded profile and mirrors at both gables',()=>{
 const a=rakeProfile(1),b=rakeProfile(-1);
 for(let i=0;i<a.length;i++){assert.ok(Math.abs(a[i][0]+b[i][0])<1e-8);assert.equal(a[i][1],b[i][1]);}
 assert.equal((a[2][1]-a[1][1])*12,2.75);
 assert.ok(Math.abs((a[2][0]-a[3][0])*12-(3+1/16))<1e-8);
 assert.ok(Math.abs(Math.hypot(a[4][0]-a[3][0],a[4][1]-a[3][1])*12-(1+1/16))<1e-8);
 assert.ok(Math.abs(Math.abs(a[5][0]-a[4][0])*12-.75)<1e-8);
 assert.ok(Math.abs(Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1])*12-.5)<1e-8);
 assert.equal(METAL_TRIM.eaveProjectionIn,1);
});
test('continuous ridge cap follows each roof pitch and leaves room for the folded closure tabs',()=>{
 for(const pitch of [5,6,7,8]){
  const angle=Math.atan(pitch/12),section=ridgeCapSection(angle);
  assert.equal(section[0][0],-7/12);assert.equal(section.at(-1)[0],7/12);
  for(const [z,y] of section)assert.ok(y>.035-Math.abs(z)*Math.tan(angle));
 }
});

test('mirrored rake faces point outward and both top flanges face upward',()=>{
 for(const end of [-1,1]){
  const {vertices,indices}=rakeStripData(end,8);
  const normal=(segment)=>{const tri=indices.slice(segment*6,segment*6+3).map(i=>vertices.slice(i*3,i*3+3));const a=tri[1].map((v,i)=>v-tri[0][i]),b=tri[2].map((v,i)=>v-tri[0][i]);return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];};
  assert.ok(normal(1)[0]*end>0);assert.ok(normal(2)[1]>0);
 }
});
test('full supplied metal color chart is available with Galvalume first',()=>{
 assert.equal(METAL_COLORS.length,21);assert.equal(METAL_COLORS[0][0],'galvalume');
 assert.equal(new Set(METAL_COLORS.map(c=>c[0])).size,21);
 for(const [,name,hex] of METAL_COLORS){assert.ok(name);assert.match(hex,/^#[0-9A-F]{6}$/);}
 for(const name of ['Arctic White','Copper Metallic','Burnished Slate','Patriot Red','Marine Green'])assert.ok(METAL_COLORS.some(c=>c[1]===name));
});
