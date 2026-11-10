import test from 'node:test';
import assert from 'node:assert/strict';
import {anchorPromptEligible,anchorPromptTracking,trackAnchorPromptAdd} from '../src/anchorPrompt.js';
test('anchor option appears on customer Review with wood foundation whether selected or not',()=>{
 const base={review:true,owner:false,foundation:'foundation-floor',selected:false,available:true};
 assert.equal(anchorPromptEligible(base),true);
 assert.equal(anchorPromptEligible({...base,selected:true}),true);
 for(const patch of [{review:false},{owner:true},{foundation:'foundation-slab'},{available:false}])assert.equal(anchorPromptEligible({...base,...patch}),false);
});
test('tracking omits unseen prompts and reflects current selection including undo',()=>{
 assert.deepEqual(anchorPromptTracking(false,true),{});
 assert.deepEqual(anchorPromptTracking(true,true),{anchorPrompt:{shown:true,added:true}});
 assert.deepEqual(anchorPromptTracking(true,false),{anchorPrompt:{shown:true,added:false}});
 const calls=[];trackAnchorPromptAdd({gtag:(...args)=>calls.push(args)});
 assert.deepEqual(calls,[['event','anchor_prompt_add']]);
 assert.doesNotThrow(()=>trackAnchorPromptAdd({}));
 assert.doesNotThrow(()=>trackAnchorPromptAdd({gtag:()=>{throw Error('unavailable');}}));
});

test('both anchor pickers submit the same automatic quantity element',async()=>{
 const {buildDesign}=await import('../src/designContract.js');
 const {sampleStates}=await import('../src/sampleStates.js');
 const {applyApprovedColors}=await import('../src/colorPalette.js');
 const {default:fixture}=await import('../src/catalog.sample.json',{with:{type:'json'}});
 const catalog=applyApprovedColors(structuredClone(fixture)),state=sampleStates(catalog)[0];
 state.extras.push({code:'anchors-hurricane',qty:1});
 const anchors=buildDesign(catalog,state).elements.filter(e=>e.code==='anchors-hurricane');
 assert.equal(anchors.length,1);assert.equal(anchors[0].auto,true);assert.equal(anchors[0].qty,1);
 assert.equal(anchors[0].wall,undefined);
});
