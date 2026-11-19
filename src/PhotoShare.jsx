import React,{useEffect,useState} from 'react';
import {Share} from 'lucide-react';
import {photoFile,sharePhoto} from './photoShare.js';

export default function PhotoShare({image}){
 const [file,setFile]=useState(null);
 useEffect(()=>{let alive=true;const controller=new AbortController();setFile(null);
  (async()=>{const prepared=image.startsWith('data:')?photoFile(image):await fetch(image,{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();const blob=await response.blob();if(!['image/png','image/jpeg'].includes(blob.type))throw new Error();return new File([blob],`cape-fear-shed-backyard.${blob.type==='image/png'?'png':'jpg'}`,{type:blob.type});});if(alive)setFile(prepared);})().catch(()=>{if(alive)setError('Your photo could not be prepared for sharing. Please try again.');});
  return()=>{alive=false;controller.abort();};
 },[image]);
 const [error,setError]=useState('');
 return <><button type="button" className="primary" disabled={!file} onClick={async()=>{setError('');try{await sharePhoto(file,image);}catch{setError('Your photo could not be saved. Please try again.');}}}><Share size={20} aria-hidden="true"/> Save or share your photo</button>{error&&<p role="alert">{error}</p>}</>;
}
