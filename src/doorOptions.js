export const DOOR_OPTIONS=[
 {id:'single32',label:'32 in single door',width:32,height:73.5,type:'single'},
 {id:'single36',label:'36 in single door',width:36,height:73.5,type:'single'},
 {id:'double48',label:'4 ft double door',width:48,height:73.5,type:'double'},
 {id:'double60',label:'5 ft double door',width:60,height:73.5,type:'double'},
 {id:'residential36',label:'36 in residential door',width:36,height:80,type:'residential',minWallHeight:8},
 {id:'french72',label:'72 × 80 in French doors',width:72,height:80,type:'french',minWallHeight:8},
 {id:'sliding72',label:'6 ft sliding glass door',width:72,height:80,type:'sliding',minWallHeight:8},
];
export const isResidentialDoor=o=>['residential','french','sliding'].includes(o.type);
export const doorAllowed=(o,height)=>!isResidentialDoor(o)||height>=8;
