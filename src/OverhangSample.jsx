import React from 'react';
const samples={'standard':'standard','roof-overhang-she-shed':'she-shed','roof-overhang-soffit-8':'soffit','roof-overhang-soffit-8-bird-box':'bird-box'};
export default function OverhangSample({code}){
 const name=samples[code];
 return name?<img className="overhang-sample" src={`${import.meta.env.BASE_URL}overhangs/${name}.webp`} width="540" height="318" alt="" aria-hidden="true" decoding="async"/>:null;
}
