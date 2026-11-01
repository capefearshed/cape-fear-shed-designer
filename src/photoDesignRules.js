// Shared by both photo transports. Wall IDs refer to the model, not the entrance.
export const PHOTO_DESIGN_RULES='DESIGN LOCK: Image 1 is the authoritative building, not inspiration. Preserve the lean-to roof slope direction, high and low walls, wall heights and overhangs exactly. The entrance may be on the LOW wall; never make it the high wall or reverse the roof to face the entrance. Preserve EVERY visible opening, including a window sharing the door wall: exact count, wall, position, size, pane layout and trim. Copy each selected door from image 1, including flat siding-faced construction, rail/stile layout, paint, hinge side, black strap hinges and handle position. Never substitute a residential or molded panel door. Apply residential/French/sliding/roll-up construction only to an opening explicitly of that type. Preserve the reference camera and visible walls; do not mirror the building. Do not add steps, ramps, landings or accessories absent from the design. Improve only photographic materials, lighting and surroundings. Before returning, compare roof slope, every door and every window against image 1; correct any mismatch.';
export function photoDesignConstraints(design){
 return {
  instructions:PHOTO_DESIGN_RULES,
  ...(design.roofStyle==='lean-to'?{roof:{type:'lean-to',angleDegrees:10,highWall:'front',lowWall:'back',note:'Model wall IDs are fixed. Whichever wall contains the entrance remains the entrance, including the low back wall. Left and right end walls slope between these heights.'}}:{}),
  openings:(design.openings||[]).map(o=>({...o})),
  referenceImageIsAuthoritative:true
 };
}
