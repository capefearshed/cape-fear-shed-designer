import React,{useMemo,useState} from 'react';
import {photoFile,sharePhoto} from './photoShare.js';

export default function PhotoShare({image}){
 const file=useMemo(()=>photoFile(image),[image]);
 const [error,setError]=useState('');
 return <><button type="button" className="primary" onClick={async()=>{setError('');try{await sharePhoto(file,image);}catch{setError('Your photo could not be saved. Please try again.');}}}>Save or share my photo</button>{error&&<p role="alert">{error}</p>}</>;
}
