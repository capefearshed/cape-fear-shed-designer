// y increases upward: darkest at the top, full paint tone at the bottom.
export function lapShade(y,base,reveal){return 1-.26*Math.max(0,Math.min(1,(y-base)/reveal));}
