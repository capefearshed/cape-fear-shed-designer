export function capturePixels(width=64,height=64){
 const pixels=new Uint8ClampedArray(width*height*4);pixels.fill(255);
 for(let i=0;i<pixels.length/2;i+=4){pixels[i]=60;pixels[i+1]=50;pixels[i+2]=40;}
 return pixels;
}
export function captureRendererMethods(){
 let ratio=1.5,size={x:800,y:600};
 return {domElement:{},getSize:v=>v.set(size.x,size.y),getPixelRatio:()=>ratio,setPixelRatio:r=>{ratio=r;},setSize:(w,h)=>{size={x:w,y:h};},clear(){}};
}
