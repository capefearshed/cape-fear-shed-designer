import React,{useId} from 'react';
import {BACKYARD_SETTINGS} from './backyardSettings.js';
export default function BackyardChoice({setting='coastal',onChange}){
 const title=useId();
 return <section className="backyard-choice" aria-labelledby={title}>
  <h3 id={title}>Which backyard looks most like yours?</h3>
  <div className="backyard-choice-tiles">{Object.entries(BACKYARD_SETTINGS).map(([id,scene])=><button type="button" key={id} aria-pressed={setting===id} onClick={()=>onChange(id)}><img src={scene.thumbnail} alt="" width="480" height="320"/><span><strong>{scene.label}{setting===id?' ✓':''}</strong><small>{scene.description}</small></span></button>)}</div>
 </section>;
}
