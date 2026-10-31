import {BufferGeometry,Float32BufferAttribute,Vector3} from 'three';

function interpolate(a,b,t){
 return {p:a.p.map((v,i)=>v+(b.p[i]-v)*t),data:a.data.map((values,i)=>values.map((v,j)=>v+(b.data[i][j]-v)*t))};
}
function clip(poly,axis,value,sign){
 const output=[];
 for(let i=0;i<poly.length;i++){
  const a=poly[i],b=poly[(i+1)%poly.length];
  const da=(a.p[axis]-value)*sign,db=(b.p[axis]-value)*sign;
  if(da>=0)output.push(a);
  if((da>=0)!==(db>=0))output.push(interpolate(a,b,da/(da-db)));
 }
 return output;
}
// Subtract rectangular door holes from every siding profile, preserving
// each vertex's original UV and normal and the existing course/batten layout.
export function cutWallGeometry(source,meshToWall,holes){
 const names=Object.keys(source.attributes),attributes=names.map(n=>source.attributes[n]);
 const arrays=names.map(()=>[]),index=source.index,count=index?index.count:source.attributes.position.count;
 const point=new Vector3();
 for(let i=0;i<count;i+=3){
  let polygons=[Array.from({length:3},(_,j)=>{
   const vertex=index?index.getX(i+j):i+j;
   point.fromBufferAttribute(source.attributes.position,vertex).applyMatrix4(meshToWall);
   return {p:[point.x,point.y,point.z],data:attributes.map(a=>Array.from({length:a.itemSize},(_,k)=>a.array[vertex*a.itemSize+k]))};
  })];
  for(const hole of holes){
   const next=[];
   for(const poly of polygons){
    let inside=poly;
    for(const [axis,value,sign] of [[0,hole.left,1],[0,hole.right,-1],[1,hole.bottom,1],[1,hole.top,-1]]){
     const outside=clip(inside,axis,value,-sign);
     if(outside.length>=3)next.push(outside);
     inside=clip(inside,axis,value,sign);
     if(inside.length<3)break;
    }
   }
   polygons=next;
  }
  for(const poly of polygons)for(let j=1;j<poly.length-1;j++)for(const v of [poly[0],poly[j],poly[j+1]]){
   v.data.forEach((values,k)=>arrays[k].push(...values));
  }
 }
 const geometry=new BufferGeometry();
 names.forEach((name,i)=>geometry.setAttribute(name,new Float32BufferAttribute(arrays[i],attributes[i].itemSize)));
 geometry.normalizeNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
export function rollupHoles(openings,wall,width,sidingDrop=1.5/12){
 return openings.filter(o=>o.type==='rollup'&&o.wall===wall).map(o=>{
  const center=(o.x/12-width/2)*(wall==='right'?-1:1);
  return {left:center-o.width/24,right:center+o.width/24,bottom:sidingDrop-1e-4,top:sidingDrop+o.height/12};
 });
}
