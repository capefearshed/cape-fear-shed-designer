import test from 'node:test';
import assert from 'node:assert/strict';
import {DUTCH_LAP_PROFILE as profile} from '../src/dutchLapProfile.js';
import {photoSpecification} from '../src/photoSpecification.js';
import {buildPhotoPrompt} from '../src/server/photoPrompt.js';

test('Dutch lap retains a broad flat face and a deep curved upper cove',()=>{
 const lower=profile.filter(([t])=>t>=.025&&t<=.70);
 assert.ok((Math.max(...lower.map(p=>p[1]))-Math.min(...lower.map(p=>p[1])))*12<.05);
 assert.ok((lower[0][1]-Math.min(...profile.map(p=>p[1])))*12>.4);
 const cove=profile.filter(([t])=>t>.70);
 assert.ok(cove.length>=5);
 assert.ok(cove.some(p=>p[2]<.60));
 assert.ok(profile.at(-1)[1]>profile.at(-2)[1]);
 for(let i=1;i<profile.length;i++)assert.ok(profile[i][0]>profile[i-1][0]);
});

test('photo instructions preserve Dutch lap cove rather than ordinary clapboards',()=>{
 const model={sidingType:'vinyl-dutch',openings:[]};
 assert.match(photoSpecification(model).siding,/concave recessed cove/);
 assert.match(buildPhotoPrompt(model),/4.5-inch exposed courses/);
 assert.doesNotMatch(photoSpecification({sidingType:'vinyl-straight'}).siding,/concave/);
});
