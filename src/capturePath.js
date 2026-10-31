import {Group,Mesh,PlaneGeometry,MeshStandardMaterial} from 'three';

// A temporary, correctly aligned ground-plane guide for the AI reference only.
// It never becomes part of the customer's shed geometry or saved design.
export function createCapturePath(openings,width,length,foundation){
 const root=new Group();
 for(const door of openings.filter(o=>o.kind==='door')){
  const long=door.wall==='front'||door.wall==='back';
  const offset=door.x/12-(long?length:width)/2;
  const direction={front:0,back:Math.PI,right:Math.PI/2,left:-Math.PI/2}[door.wall];
  const start=door.ramp&&foundation!=='slab'?3:0;
  const group=new Group();group.rotation.y=direction;
  group.position.set(long?offset:(door.wall==='right'?1:-1)*length/2,foundation==='slab'?-.004:-.34,long?(door.wall==='front'?1:-1)*width/2:offset);
  const plane=new Mesh(new PlaneGeometry(door.width/12,18),new MeshStandardMaterial({color:'#b8ad94',roughness:1}));
  plane.rotation.x=-Math.PI/2;plane.position.z=start+9+.02;group.add(plane);root.add(group);
 }
 root.userData.dispose=()=>root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
 return root;
}
