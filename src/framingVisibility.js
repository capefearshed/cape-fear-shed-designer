// Camera distance is normalized to the automatically fitted interior overview.
export function framingOpacity(distance,overviewDistance){
 const ratio=Math.max(0,Math.min(1,distance/Math.max(.001,overviewDistance)));
 const t=Math.max(0,Math.min(1,(ratio-.2)/.8));
 return .08+.92*t*t*(3-2*t);
}
