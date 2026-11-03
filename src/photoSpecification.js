// Facts from the model used for the authoritative reference image.
const numeric=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))?Number(v):null;
const hex=v=>/^#[0-9a-f]{6}$/i.test(v||'')?v.toUpperCase():null;
const SIDING={
 'lp-panel':'LP SmartSide vertical grooved panels; no raised battens',
 lap:'LP SmartSide horizontal lap, 6-inch reveal; never vertical panels or board-and-batten',
 'board-batten':'LP SmartSide board-and-batten, 16-inch batten spacing; no battens on door leaves',
 'vinyl-straight':'Horizontal straight-lap vinyl',
 'vinyl-dutch':'Horizontal Dutch-lap vinyl with recessed upper profile',
};
export function photoSpecification(d){
 const dormerWidth=d.dormer?(d.length>=18?10:d.length>=14?8:6):null;
 const frames=hex(d.windowFrameColor)||'#F0F0ED';
 return {
  footprintFt:{width:numeric(d.width),length:numeric(d.length)},selectedSidewallHeightFt:numeric(d.height),
  colors:{siding:hex(d.paint),trim:hex(d.trim),windowFrames:frames},
  glazingAppearance:'All window and door glass: barely perceptible, softly blurred outdoor reflections over quiet shaded glass, never a recognizable mirrored landscape; preserve selected frame colors and grids; no opaque black panels, mirror finish or frosted glass',
  siding:SIDING[d.sidingType]||'Copy the reference siding exactly',
  roof:{...(d.soffitOverhang?{edgeTrim:{name:d.birdBoxOverhang?'8-inch Soffit with Bird Box':'8-inch Soffit Overhang',projectionIn:8,boxDepthIn:4,sides:'all four sides',underside:'Fully boxed, matching trim color',orientation:d.birdBoxOverhang?'Sidewall soffit undersides are horizontal, parallel to the ground and perpendicular to siding. Fascia faces are plumb. Gable rakes follow the roof pitch with closed bird-box corner returns joining all four rake/eave junctions. Match trim color.':'Sidewall eave faces rotate with roof pitch, perpendicular to roof plane; never plumb like the She Shed trim'}}:{}),...(!d.soffitOverhang&&d.sheShedOverhang?{edgeTrim:{name:'She Shed Overhang',thicknessIn:.75,faceHeightIn:3.5,sides:'all four sides',orientation:'Vertical face parallel to siding; follows roof pitch at end walls; matches trim color; preserve existing roof projection; no added soffit panels'}}:{}),...(d.roofStyle==='lean-to'?{highWall:d.roofHighWall==='back'?'back':'front',lowWall:d.roofHighWall==='back'?'front':'back'}:{}),style:d.roofStyle==='lean-to'?'lean-to':'gable',pitch:d.roofStyle==='lean-to'?'10 degrees':numeric(d.pitch)===null?null:String(numeric(d.pitch))+':12',material:d.roofMaterial==='metal'?'ribbed metal':'architectural shingles',color:d.roofMaterial==='metal'?hex(d.metalColor):(d.roof||null),eaveAndRakeOverhangIn:d.soffitOverhang?8:d.sidingType?(d.sidingType!=='lp-panel'?6:4):null},
  dormer:d.dormer?{wall:'front',widthFt:dormerWidth,roofPitch:'2:12',windowCount:dormerWidth===6?2:3,windowWidthIn:dormerWidth===10?29:23,windowHeightIn:10,grid:{frameColor:frames,verticalDividersPerWindow:3,horizontalDividersPerWindow:0}}:null,
  foundation:d.foundation==='slab'?'Concrete slab; no wooden floor, ramp, landing, apron or steps':'Retain exact reference wood floor, supports and ground clearance; no invented masonry or extra skids',
  wallOpenings:Object.fromEntries(['front','right','back','left'].map(wall=>{const selected=(d.openings||[]).filter(o=>o.wall===wall);return [wall,{doorCount:selected.filter(o=>o.kind==='door').length,windowCount:selected.filter(o=>o.kind==='window').length,openings:selected.map(o=>({id:o.id||null,kind:o.kind,type:o.type})),rule:'No other doors or windows on this wall; if hidden by the reference view, do not relocate its openings'}];})),
  openings:(d.openings||[]).map(o=>({
   id:o.id||null,kind:o.kind||null,wall:o.wall||null,type:o.type||null,widthIn:numeric(o.width),heightIn:numeric(o.height),centerFromWallStartIn:numeric(o.x),bottomAboveFloorIn:numeric(o.y)||0,
   ...(o.kind==='window'?{grid:{frameColor:frames,columns:2,rows:4},shutters:Boolean(o.shutters),flowerBox:Boolean(o.flowerBox)}:{}),
   ...(o.kind==='door'?{...(o.type==='sliding'?{hardware:{pullHandles:1,handleLocation:'far-right vertical stile of the door leaf as viewed from outside; not surrounding trim',centerHandle:false,deadbolts:0,exteriorHinges:false},glazing:{panesPerLeaf:1,grids:false}}:{}),...(o.type==='french'?{hardware:{entrySets:1,activeLeaf:'left as viewed from outside',leverHandles:1,deadbolts:1,passiveLeafHardware:'none visible',exteriorStrapHinges:false},glazing:{panesPerLeaf:1,grids:false,appearance:'Clear glass with subtle yard/sky reflections and shaded interior depth; never opaque black panels'}}:{}),paint:hex(o.doorPaint),ramp:Boolean(o.ramp)&&d.foundation!=='slab',transom:Boolean(o.transom),...(o.transom?{transomGrid:{frameColor:frames,panesPerLeaf:o.type==='double'?(o.width===60?4:3):5,horizontalDividers:0,note:'Vertical dividers only; NEVER add horizontal bars or white muntins'}}:{})}:{}),
  })),
  camera:'Copy exact visible walls, camera direction and building silhouette from the shed image. Never mirror or switch to straight-on.',
  approach:'Path continues the exact ramp axis, direction and width at its bottom edge. With no ramp, center on doorway perpendicular to its wall. No bend, offset, flare or invented ramp; never aim toward bottom-center.',
 };
}
