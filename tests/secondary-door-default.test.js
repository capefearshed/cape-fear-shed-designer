import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors,defaultSecondaryDoorPaint} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {modelDesign} from '../src/modelBridge.js';
import {buildDesign} from '../src/designContract.js';
import {restoreDesign} from '../src/savedDesign.js';
test('enabling secondary paint starts at Snowscape white immediately in model, payload and saved design',()=>{
 const c=applyApprovedColors(catalog),state=sampleStates(c)[0];
 state.colors.trim=c.colors.trim.find(color=>color.name==='Tricorn Black');
 const before=modelDesign(c,state).openings[0].doorPaint;
 state.placed[0].color=defaultSecondaryDoorPaint(c);
 assert.equal(state.placed[0].color.name,'Snowscape');assert.equal(modelDesign(c,state).openings[0].doorPaint,'#F2F0EB');assert.notEqual(before,'#F2F0EB');
 const design=buildDesign(c,state);assert.equal(design.elements.find(e=>e.id===state.placed[0].id).color.hex,'#F2F0EB');
 assert.equal(modelDesign(c,restoreDesign(c,design,design.editorState)).openings[0].doorPaint,'#F2F0EB');
 state.placed[0].color=null;assert.equal(modelDesign(c,state).openings[0].doorPaint,before);
 const copy=defaultSecondaryDoorPaint(c);copy.hex='#000000';assert.equal(defaultSecondaryDoorPaint(c).hex,'#F2F0EB');
});
