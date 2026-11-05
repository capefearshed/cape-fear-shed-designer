import React,{useEffect,useId,useRef,useState} from 'react';
import {ownerAddress} from './api.js';
export default function OwnerStreetInput({token,value,onChange,onSelect}){
 const id=useId(),session=useRef(null),generation=useRef(0),selecting=useRef(false),selectedStreet=useRef(null);
 const [focused,setFocused]=useState(false),[suggestions,setSuggestions]=useState([]),[active,setActive]=useState(-1),[loading,setLoading]=useState(false);
 const current=useRef({token,value});current.current={token,value};
 useEffect(()=>{
  setSuggestions([]);setActive(-1);
  if(!focused||!token||value.trim().length<3||selecting.current||value===selectedStreet.current)return;
  const controller=new AbortController(),version=++generation.current;
  const timer=setTimeout(async()=>{try{
   const response=await ownerAddress(token,{q:value.trim(),session:session.current,signal:controller.signal});
   if(!controller.signal.aborted&&version===generation.current)setSuggestions((response.suggestions||[]).filter(s=>typeof s.id==='string'&&typeof s.main==='string').slice(0,5));
  }catch{/* Manual address entry always remains available. */}},250);
  return ()=>{clearTimeout(timer);controller.abort();};
 },[value,token,focused]);
 useEffect(()=>()=>{generation.current++;},[]);
 async function pick(suggestion){
  if(selecting.current)return;
  selecting.current=true;setLoading(true);setSuggestions([]);const version=++generation.current;
  const selectedSession=session.current,selectedToken=token;
  try{
   const address=await ownerAddress(token,{place:suggestion.id,session:selectedSession});
   if(version!==generation.current||current.current.token!==selectedToken)return;
   selectedStreet.current=address.street;
   onSelect(Object.fromEntries(['street','city','state','zip'].map(key=>[key,typeof address[key]==='string'?address[key]:''])));
  }catch{/* No dropdown error interrupts typing. */}
  finally{session.current=crypto.randomUUID();selecting.current=false;setLoading(false);}
 }
 return <div className="owner-street" onBlur={event=>{
  const box=event.currentTarget;
  if(box.contains(event.relatedTarget))return;
  setTimeout(()=>{
   if(!box.contains(document.activeElement)){setFocused(false);setSuggestions([]);}
  },300);
 }}>
  <label htmlFor={id}>street</label>
  <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={suggestions.length>0} aria-controls={id+'-choices'} aria-activedescendant={active>=0?id+'-'+active:undefined} aria-busy={loading} autoComplete="off" value={value}
   onFocus={()=>{session.current=crypto.randomUUID();selectedStreet.current=null;setFocused(true);}}
   onChange={event=>{generation.current++;selectedStreet.current=null;session.current??=crypto.randomUUID();onChange(event.target.value);}}
   onKeyDown={event=>{if(event.key==='Escape'){setSuggestions([]);return;}if(!suggestions.length)return;if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();setActive(index=>(index+(event.key==='ArrowDown'?1:suggestions.length-1)+suggestions.length)%suggestions.length);}if(event.key==='Enter'&&active>=0){event.preventDefault();pick(suggestions[active]);}}}/>
  {suggestions.length>0&&<div id={id+'-choices'} className="owner-address-suggestions" role="listbox" aria-label="Address suggestions">{suggestions.map((suggestion,index)=><button key={suggestion.id} id={id+'-'+index} role="option" aria-selected={active===index} type="button" onPointerDown={event=>event.preventDefault()} onMouseDown={event=>event.preventDefault()} onClick={()=>pick(suggestion)}><strong>{suggestion.main}</strong><span>{suggestion.rest}</span></button>)}</div>}
 </div>;
}
