import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Mesh,BoxGeometry,Box3} from 'three';
import {removeEditorObjects} from '../src/editorScene.js';
test('selected-opening editor overlays cannot alter capture bounds and are restored to their parent',()=>{
 const root=new Group(),shed=new Mesh(new BoxGeometry(12,8,10)),outline=new Mesh(new BoxGeometry(30,30,30));root.add(shed);shed.add(outline);outline.userData.editorOnly=true;
 const restore=removeEditorObjects(root);assert.equal(outline.parent,null);assert.equal(new Box3().setFromObject(root).max.x,6);
 restore();assert.equal(outline.parent,shed);assert.equal(outline.visible,true);assert.equal(new Box3().setFromObject(root).max.x,15);
});
