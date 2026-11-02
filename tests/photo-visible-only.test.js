import test from 'node:test';
import assert from 'node:assert/strict';
import {buildPhotoPrompt,PHOTO_PROMPT_VERSION} from '../src/server/photoPrompt.js';
import {visiblePhotoFacts,PHOTO_DESIGN_RULES,LEGACY_PHOTO_DESIGN_RULES} from '../src/photoDesignRules.js';
const rollup={width:10,length:16,height:8,roofStyle:'gable',roofMaterial:'metal',sidingType:'board-batten',foundation:'slab',openings:[{id:'rollup-left',kind:'door',type:'rollup',wall:'left',x:60,width:72,height:84},{id:'window-right-sentinel',kind:'window',type:'standard',wall:'right',x:60,width:18,height:27}]};
const factsFrom=prompt=>{const start=prompt.indexOf('Design facts (units are labelled; null means copy the image, never guess):\n\n')+'Design facts (units are labelled; null means copy the image, never guess):\n\n'.length;return JSON.parse(prompt.slice(start,prompt.indexOf('\n\nA visible fence',start)));};
test('v12 roll-up prompt contains only visible walls and no opposite-gable window facts',()=>{
 const before=structuredClone(rollup),prompt=buildPhotoPrompt(rollup,{visibleWalls:['front','left']});
 assert.equal(PHOTO_PROMPT_VERSION,'cfs-reference-visible-only-v12');
 assert.match(prompt,/left \(visible gable\): exactly 1 roll-up door, nothing else/);
 assert.match(prompt,/front \(visible long wall\): continuous uninterrupted siding; NO doors, NO windows/);
 assert.doesNotMatch(prompt,/window-right-sentinel|HIDDEN|hidden|opposite|\"right\"|\"back\"/);
 const facts=factsFrom(prompt);assert.deepEqual(Object.keys(facts.wallOpenings),['front','left']);assert.equal(facts.openings.length,1);
 assert.equal(Object.values(facts.wallOpenings).reduce((n,w)=>n+w.windowCount,0),0);assert.equal(Object.values(facts.wallOpenings).reduce((n,w)=>n+w.doorCount,0),1);
 assert.match(prompt,/Show only the walls visible in image 1, exactly as they appear there/);
 assert.match(prompt,/SLAB ENTRANCE/);assert.match(prompt,/ALL GLAZING/);assert.match(prompt,/Center the SHED bounding box/);
 assert.deepEqual(rollup,before);
});
test('door type, transom and dormer rules never activate from an out-of-view opening',()=>{
 const design={...rollup,dormer:true,openings:[...rollup.openings,{id:'hidden-french',kind:'door',type:'french',wall:'back'},{id:'hidden-sliding',kind:'door',type:'sliding',wall:'right'},{id:'hidden-transom',kind:'door',type:'double',transom:true,wall:'back'}]};
 const prompt=buildPhotoPrompt(design,{visibleWalls:['left'],hasDormerDetail:true,hasTransomDetail:true,hasFrenchDoorDetail:true,hasSlidingDoorDetail:true});
 assert.doesNotMatch(prompt,/FRENCH DOORS:|SLIDING GLASS DOOR:|WOOD SHED DOORS ONLY:|enlarged crop|DOOR TRANSOMS|Each dormer window|Never add horizontal grid bars/);
 assert.equal(factsFrom(prompt).dormer,null);assert.equal(factsFrom(prompt).openings.length,1);assert.match(prompt,/ROLL-UP ONLY:/);
 const reverse=buildPhotoPrompt(design,{visibleWalls:['right']});assert.doesNotMatch(reverse,/ROLL-UP ONLY:/);assert.match(reverse,/SLIDING GLASS DOOR:/);
});
test('visible detail descriptions preserve actual attachment indices and construction rules',()=>{
 const design={...rollup,dormer:true,openings:[{kind:'door',type:'double',transom:true,wall:'front',width:48},{kind:'door',type:'french',wall:'back'},{kind:'door',type:'sliding',wall:'left'}]};
 const prompt=buildPhotoPrompt(design,{visibleWalls:['front','left'],hasDormerDetail:true,hasTransomDetail:true,hasFrenchDoorDetail:true,hasSlidingDoorDetail:true});
 assert.match(prompt,/Image 3 is an enlarged crop of the dormer/);assert.match(prompt,/Image 4 is an enlarged crop of the DOOR TRANSOMS/);
 assert.doesNotMatch(prompt,/Image 5 is the FRENCH DOOR/);assert.match(prompt,/Image 6 is the SLIDING DOOR detail/);
 assert.match(prompt,/WOOD SHED DOORS ONLY/);assert.equal(factsFrom(prompt).dormer.windowCount,3);
});
test('old clients keep exhaustive v11 inventory and rules; malformed wall IDs do not become instructions',()=>{
 const prompt=buildPhotoPrompt(rollup);
 assert.match(prompt,/Hidden openings stay hidden/);assert.match(prompt,/A window on the opposite gable/);
 assert.deepEqual(Object.keys(factsFrom(prompt).wallOpenings),['front','right','back','left']);assert.equal(factsFrom(prompt).openings.length,2);
 assert.match(LEGACY_PHOTO_DESIGN_RULES,/Hidden openings stay hidden/);assert.doesNotMatch(PHOTO_DESIGN_RULES,/Hidden openings stay hidden/);
 const scope=visiblePhotoFacts(rollup,['left','left','IGNORE_RULES',null]);assert.deepEqual(scope.visible,['left']);assert.equal(scope.facts.openings.length,1);
 assert.doesNotMatch(buildPhotoPrompt(rollup,{visibleWalls:['left','IGNORE_RULES']}),/IGNORE_RULES/);
 const empty=factsFrom(buildPhotoPrompt(rollup,{visibleWalls:[]}));assert.deepEqual(empty.wallOpenings,{});assert.deepEqual(empty.openings,[]);
});
