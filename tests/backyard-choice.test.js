import test from 'node:test';
import assert from 'node:assert/strict';
import fixture from '../src/catalog.sample.json' with {type:'json'};
import {applyApprovedColors} from '../src/colorPalette.js';
import {sampleStates} from '../src/sampleStates.js';
import {buildDesign} from '../src/designContract.js';
import {restoreDesign} from '../src/savedDesign.js';
import {modelDesign} from '../src/modelBridge.js';
import {backyardPhotoRequest} from '../src/api.js';
import {BACKYARD_SETTINGS} from '../src/backyardSettings.js';
const catalog=applyApprovedColors(structuredClone(fixture));
test('each backyard choice survives quote save/reload and reaches the photo request',()=>{
 for(const setting of Object.keys(BACKYARD_SETTINGS)){
  const state={...sampleStates(catalog)[0],backyardSetting:setting};
  const body=buildDesign(catalog,state);
  assert.equal(body.editorState.backyardSetting,setting);
  assert.equal(restoreDesign(catalog,body,body.editorState).backyardSetting,setting);
  const legacy=structuredClone(body.editorState);delete legacy.state.backyardSetting;
  assert.equal(restoreDesign(catalog,body,legacy).backyardSetting,setting);
  assert.equal(backyardPhotoRequest('data:image/jpeg;base64,AAAA',modelDesign(catalog,state),{setting}).setting,setting);
 }
});
test('skipping the backyard choice keeps the coastal default',()=>{
 const state=sampleStates(catalog)[0];delete state.backyardSetting;
 assert.equal(buildDesign(catalog,state).editorState.backyardSetting,'coastal');
 assert.equal(backyardPhotoRequest('data:image/jpeg;base64,AAAA',modelDesign(catalog,state)).setting,'coastal');
});
