import {foundationCode} from './designContract.js';
export function sampleStates(catalog){
 const color=name=>catalog.colors.siding.find(c=>c.name===name)||{name,code:null,hex:null,custom:true};
 const standard=kind=>catalog.options.find(o=>o.kind===kind&&o.standard)?.code;
 const base=(width,length)=>({shed:{style:'style-gable',size:`size-${width}x${length}`,width,length,wallHeight:standard('wallHeight'),roofPitch:5,siding:standard('siding'),roofing:standard('roofing'),foundation:foundationCode(width)},colors:{siding:catalog.colors.siding.find(c=>c.unpainted)||catalog.colors.siding.find(c=>c.name==='Unpainted')||catalog.colors.siding[0],trim:catalog.colors.trim.find(c=>c.standard),roof:catalog.colors.roof[0]},placed:[],extras:[]});
 const small=base(8,12);small.placed=[{id:'door-1',code:'door-4-double',wall:'front',x:72,y:0,rampRemoved:true}];
 const painted=base(12,16);painted.shed.wallHeight='wall-7';painted.colors.siding=color('Sea Salt');painted.placed=[{id:'door-1',code:'door-5-double',wall:'front',x:96,y:0,rampRemoved:true},{id:'window-1',code:'window-18x27',wall:'left',x:72,y:40},{id:'window-2',code:'window-18x27',wall:'right',x:72,y:40}];painted.placed[0].rampRemoved=false;painted.placed[0].shutters=false;painted.placed[1].shutters=true;painted.extras=[{code:'loft-45',qty:1,wall:'left'},{code:'surf-rack',qty:1,wall:'back',dowel:18},{code:'anchors-hurricane',qty:1}];
 const large=base(16,24);large.shed.siding='siding-lp-lap';large.shed.roofing='roof-metal';large.colors.roof=catalog.colors.metal?.[0]||{name:'Galvalume',hex:'#BFC4C5',code:null};large.placed=[{id:'door-1',code:'door-5-double',wall:'front',x:84,y:0,rampRemoved:true},{id:'door-2',code:'door-4-double',wall:'front',x:204,y:0,rampRemoved:true}];large.extras=[{code:'loft-45',qty:1,wall:'left'},{code:'workbench-18',qty:1,wall:'right'}];
 return [small,painted,large];
}
