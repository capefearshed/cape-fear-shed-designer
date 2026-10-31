export const structuralStyle=code=>code==='style-gable-dormer'?'style-gable':code;
export function styleUnavailableReason(catalog,shed,code=shed.style){
 const style=catalog.styles.find(s=>s.code===code);
 if(!style||style.available===false)return 'This shed style is not available.';
 if(style.maxWidth&&shed.width>style.maxWidth)return `${style.label} is available up to ${style.maxWidth}′ wide.`;
 if(style.widths&&!style.widths.includes(shed.width))return `${style.label} requires ${style.widths.join('′ or ')}′ width.`;
 if(style.lengths&&!style.lengths.includes(shed.length))return 'A dormer is not available for this shed length.';
 if(code==='style-gable-dormer'&&(catalog.rules.dormerNotFor?.includes(shed.length)||!catalog.options.some(o=>o.kind==='dormer'&&o.forLength?.includes(shed.length))))return 'A dormer is not available for this shed length.';
 return '';
}
export function withShedStyle(catalog,state,code){
 const reason=styleUnavailableReason(catalog,state.shed,code);if(reason)throw new Error(reason);
 const style=catalog.styles.find(s=>s.code===code),next={...state,gablePitch:state.shed.style==='style-gable'?(state.shed.roofPitch||5):(state.gablePitch||5),shed:{...state.shed,style:code}};
 delete next.shed.roofAngle;delete next.shed.roofPitch;
 if(style.roofAngle)next.shed.roofAngle=style.roofAngle;
 else next.shed.roofPitch=style.mainPitch||next.gablePitch||style.defaultPitch||5;
 if(style.roofing&&!style.roofing.includes(state.shed.roofing)){
  next.shed.roofing=style.roofing[0];next.colors={...state.colors,roof:catalog.colors.roof[0]};
 }
 return next;
}
