export const WINDOW_FRAME_COLORS=[{name:'White',hex:'#F0F0ED'},{name:'Black',hex:'#202224'}];
export function windowFrameColor(colors){return WINDOW_FRAME_COLORS[colors?.window?.name==='Black'?1:0];}
