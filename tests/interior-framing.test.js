import test from 'node:test';
import assert from 'node:assert/strict';
import {interiorFramingRects,interiorStudRanges} from '../src/interiorLayout.js';
test('interior door header begins at 72 inches and fits below standard top plates',()=>{
 const [r]=interiorFramingRects('front',10,12,[{id:'door',kind:'door',wall:'front',x:72,y:0,width:48,height:73.5}]);
 assert.equal(r.top,6);assert.equal(r.top+.25,6.5-.25);
 assert.deepEqual(interiorStudRanges(r,6.5),[]);
});
test('window cripple studs stop at rail faces',()=>{
 const cut={bottom:40/12,top:68.5/12};
 const [below,above]=interiorStudRanges(cut,8);
 assert.equal(below[1],cut.bottom-.125);assert.equal(above[0],cut.top+.25);
});
