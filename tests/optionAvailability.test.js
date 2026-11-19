import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {roofingUnavailableReason,openingUnavailableReason} from '../src/optionAvailability.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../src/catalog.sample.json',import.meta.url)));
const shed={width:10,length:12,wallHeight:'wall-6-6',style:'style-gable'};
test('metal restriction explains dormer and allows lean-to',()=>{
 assert.match(roofingUnavailableReason(catalog,{...shed,style:'style-gable-dormer'},'roof-metal'),/dormer/);
 assert.equal(roofingUnavailableReason(catalog,{...shed,style:'style-lean-to'},'roof-metal'),'');
});
test('opening explanations distinguish height, wall and space restrictions',()=>{
 const residential=catalog.options.find(o=>o.kind==='door'&&o.requires?.minWall===8);
 assert.ok(residential);
 assert.match(openingUnavailableReason(catalog,shed,[],residential,'front'),/8′ sidewalls/);
 const rollup=catalog.options.find(o=>o.code.includes('rollup')&&o.kind==='door');
 assert.match(openingUnavailableReason(catalog,shed,[],rollup,'front'),/gable end walls/);
 const door=catalog.options.find(o=>o.code==='door-4-double');
 assert.equal(openingUnavailableReason(catalog,shed,[],door,'front'),'');
 assert.match(openingUnavailableReason(catalog,{...shed,length:4},[],door,'front'),/clear space/);
});
