import {Vector3,Matrix3,Color,SRGBColorSpace,DoubleSide,BackSide} from 'three';
// Depth-buffered software capture of the assembled Three.js scene.
// Used for integration fixtures when hardware WebGL is unavailable.
export function captureScene(scene,camera,width=1200,height=800){
 const rgba=new Uint8Array(width*height*4),depth=new Float64Array(width*height);depth.fill(Infinity);
 for(let i=0;i<rgba.length;i+=4){rgba[i]=243;rgba[i+1]=244;rgba[i+2]=241;rgba[i+3]=255;}
 const light=new Vector3(.3,.8,.5).normalize(),fill=new Vector3(-.8,.4,-.4).normalize();
 const edge=(ax,ay,bx,by,x,y)=>(x-ax)*(by-ay)-(y-ay)*(bx-ax);
 scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
 scene.traverse(mesh=>{
  if(!mesh.isMesh||!mesh.visible||!mesh.geometry?.attributes.position)return;
  let ancestor=mesh.parent;while(ancestor){if(!ancestor.visible)return;ancestor=ancestor.parent;}
  const geometry=mesh.geometry,position=geometry.attributes.position,normal=geometry.attributes.normal,index=geometry.index;
  const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material;if(!material?.visible)return;
  const normalMatrix=new Matrix3().getNormalMatrix(mesh.matrixWorld),projected=[],normals=[];
  for(let i=0;i<position.count;i++){
   const p=new Vector3().fromBufferAttribute(position,i).applyMatrix4(mesh.matrixWorld).project(camera);
   projected.push([(p.x+1)*width/2,(1-p.y)*height/2,p.z]);
   normals.push(normal?new Vector3().fromBufferAttribute(normal,i).applyMatrix3(normalMatrix).normalize():new Vector3(0,0,1));
  }
  const count=index?index.count:position.count;
  for(let i=0;i<count;i+=3){
   const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),p=ids.map(id=>projected[id]);
   if(p.some(v=>!Number.isFinite(v[0]))||p.every(v=>v[2]>1)||p.every(v=>v[2]<-1))continue;
   const area=edge(...p[0].slice(0,2),...p[1].slice(0,2),...p[2].slice(0,2));
   if(Math.abs(area)<1e-9||material.side!==DoubleSide&&(material.side===BackSide?area>=0:area<=0))continue;
   const x0=Math.max(0,Math.floor(Math.min(...p.map(v=>v[0])))),x1=Math.min(width-1,Math.ceil(Math.max(...p.map(v=>v[0]))));
   const y0=Math.max(0,Math.floor(Math.min(...p.map(v=>v[1])))),y1=Math.min(height-1,Math.ceil(Math.max(...p.map(v=>v[1]))));
   const n=normals[ids[0]].clone().add(normals[ids[1]]).add(normals[ids[2]]).normalize();if(area<0)n.negate();
   const intensity=.52+.46*Math.max(0,n.dot(light))+.16*Math.max(0,n.dot(fill));
   const color=(material.color||new Color('#ffffff')).clone().multiplyScalar(intensity);color.convertLinearToSRGB();
   const r=Math.min(255,Math.round(color.r*255)),g=Math.min(255,Math.round(color.g*255)),b=Math.min(255,Math.round(color.b*255));
   for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const a=edge(p[1][0],p[1][1],p[2][0],p[2][1],x+.5,y+.5)/area;
    const b1=edge(p[2][0],p[2][1],p[0][0],p[0][1],x+.5,y+.5)/area,c=1-a-b1;
    if(a<0||b1<0||c<0)continue;
    const z=a*p[0][2]+b1*p[1][2]+c*p[2][2],pixel=y*width+x;
    if(z>=depth[pixel])continue;depth[pixel]=z;
    const offset=pixel*4;rgba[offset]=r;rgba[offset+1]=g;rgba[offset+2]=b;
   }
  }
 });
 return {data:Buffer.from(rgba),width,height,channels:4};
}
