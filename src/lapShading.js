// Shadow occupies only the upper 22% of each course, fading into the paint.
export function lapShade(y,base,reveal){
 const t=Math.max(0,Math.min(1,((y-base)/reveal-.78)/.22));
 return 1-.30*t*t*(3-2*t);
}
export function lapShadowShader(base,reveal){return shader=>{
 shader.uniforms.cfsLapBase={value:base};shader.uniforms.cfsLapReveal={value:reveal};
 shader.vertexShader='varying float cfsLapY;\n'+shader.vertexShader;
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ncfsLapY=position.y;');
 shader.fragmentShader='varying float cfsLapY;\nuniform float cfsLapBase;\nuniform float cfsLapReveal;\n'+shader.fragmentShader;
 shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.rgb *= 1.0 - 0.30 * smoothstep(0.78,1.0,(cfsLapY-cfsLapBase)/cfsLapReveal);');
 shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','outgoingLight = mix(outgoingLight, diffuseColor.rgb, 0.65);\n#include <opaque_fragment>');
};}
