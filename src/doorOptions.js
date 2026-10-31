export const DOOR_OPTIONS=[
 {id:'single32',label:'32 in single door',width:32,height:73.5,type:'single'},
 {id:'single36',label:'36 in single door',width:36,height:73.5,type:'single'},
 {id:'double48',label:'4 ft double door',width:48,height:73.5,type:'double'},
 {id:'double60',label:'5 ft double door',width:60,height:73.5,type:'double'},
 {id:'residential36',label:'36 in residential door',width:36,height:80,type:'residential',minWallHeight:8},
 {id:'french72',label:'72 × 80 in French doors',width:72,height:80,type:'french',minWallHeight:8},
 {id:'sliding72',label:'6 ft sliding glass door',width:72,height:80,type:'sliding',minWallHeight:8},
 {id:'rollup72',label:'6 × 7 ft roll-up door',width:72,height:84,type:'rollup',recessIn:4,threshold:'aluminum-diamond-plate'},
];
export const isResidentialDoor=o=>['residential','french','sliding'].includes(o.type);
export const doorAllowed=(o,height,width=0,roofStyle='gable',wall=o.wall)=>o.type==='rollup'
 ? width>=10&&height>=7&&roofStyle==='gable'&&['left','right'].includes(wall)
 : !isResidentialDoor(o)||height>=8;
