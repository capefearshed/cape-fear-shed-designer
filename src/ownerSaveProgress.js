// Each completion unlocks the next interval; creeping never claims completion.
export function ownerProgressCap(stage,confirmed=0){
 if(stage==='done'||confirmed>=100)return 100;
 if(stage==='saving')return 34.5;
 if(stage==='starting')return 99.5;
 const finished=Math.min(3,Math.floor((Math.max(35,confirmed)-35)*3/40+0.0001));
 return Math.min(74.5,35+40*(finished+1)/3-0.5);
}
export function creepOwnerProgress(current,stage,confirmed){
 const floor=stage==='done'?100:Math.max(confirmed||0,stage==='starting'?75:stage==='sending'?35:0);
 const cap=ownerProgressCap(stage,confirmed);
 const value=Math.max(current,floor);
 return Math.max(value,Math.min(cap,value+Math.max(0.025,(cap-value)*0.012)));
}
