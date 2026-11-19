export const FLOWER_BOX_GAP_IN=1;
// The front and end boards rise 0.15ft + half their 0.35ft height above the group.
export const FLOWER_BOX_TOP_OFFSET_FT=.15+.35/2;
export function flowerBoxGroupY(windowTrimBottomFt){
 return windowTrimBottomFt-FLOWER_BOX_GAP_IN/12-FLOWER_BOX_TOP_OFFSET_FT;
}
