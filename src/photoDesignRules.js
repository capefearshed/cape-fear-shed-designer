import {photoSpecification} from './photoSpecification.js';
// Shared by both photo transports. Wall IDs refer to the model, not the entrance.
export const LEGACY_PHOTO_DESIGN_RULES='DESIGN LOCK: Image 1 is the authoritative building, not inspiration. Preserve roof slope direction, high and low walls, wall heights and overhangs. The entrance may be on the LOW wall; never reverse the roof to face the entrance. Preserve exactly the selected openings on their original walls, with their count, positions, sizes, grids and trim. Blank walls remain blank. Hidden openings stay hidden; never move them onto a visible wall. Preserve reference camera and visible walls; do not mirror the building. No invented openings, steps, ramps, landings or accessories. Improve only photographic materials, lighting and surroundings.';
export const VISIBLE_WALL_RULE='Show only the walls visible in image 1, exactly as they appear there; walls out of view are simply not in the picture.';
export const PHOTO_DESIGN_RULES=LEGACY_PHOTO_DESIGN_RULES.replace('Hidden openings stay hidden; never move them onto a visible wall.',VISIBLE_WALL_RULE);
// Build fresh photo-only facts; never mutate the saved design or quote inventory.
export function visiblePhotoFacts(design,visibleWalls){
 const walls=['front','right','back','left'];
 const visible=[...new Set(visibleWalls.filter(wall=>walls.includes(wall)))];
 const scoped={...design,openings:(design.openings||[]).filter(o=>visible.includes(o.wall)),dormer:Boolean(design.dormer)&&visible.includes('front')};
 const facts=photoSpecification(scoped);
 facts.wallOpenings=Object.fromEntries(visible.map(wall=>[wall,{...facts.wallOpenings[wall],rule:'Show exactly these openings and no others on this wall'}]));
 return {design:scoped,facts,visible};
}
export function doorConstructionRules(design){
 const doors=(design.openings||[]).filter(o=>o.kind==='door');
 return [
  ...(doors.some(o=>['single','double'].includes(o.type))?['WOOD SHED DOORS ONLY: Preserve their siding-faced leaves, rails/stiles, selected paint, black strap hinges and handle position from image 1. Do not substitute residential molded leaves. These hardware rules apply only to the selected wood shed doors.']:[]),
  ...(doors.some(o=>o.type==='rollup')?['ROLL-UP ONLY: White or selected-color horizontally corrugated roll-up curtain recessed 4 inches behind exterior casing, with its reference latch/pull and full-width metal threshold. No swing-door leaf, glazing, strap hinges or entry handle/deadbolt. A roll-up does NOT imply a garage man door, adjacent window, concrete driveway, apron or ramp. Include other openings on its wall ONLY if explicitly listed in that wall inventory; never invent a companion door.']:[]),
 ].join('\n');
}

export function photoDesignConstraints(design){
 return {
  instructions:PHOTO_DESIGN_RULES+'\n'+doorConstructionRules(design),
  specificationVersion:'cfs-photo-v3',
  specification:photoSpecification(design),
  windowFrameColor:design.windowFrameColor||'#F0F0ED',
  ...(design.roofStyle==='lean-to'?{roof:{type:'lean-to',angleDegrees:10,highWall:design.roofHighWall==='back'?'back':'front',lowWall:design.roofHighWall==='back'?'front':'back',note:'Model wall IDs are fixed. Whichever wall contains the entrance remains the entrance, including the low back wall. Left and right end walls slope between these heights.'}}:{}),
  openings:(design.openings||[]).map(o=>({...o})),
  referenceImageIsAuthoritative:true
 };
}
