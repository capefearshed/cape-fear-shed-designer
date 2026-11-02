export const MEASUREMENT_ID='G-RNDML9B5GJ';
export const ATTRIBUTION_KEY='cfs-designer-attribution-v1';
export const ATTRIBUTION_FIELDS=['gclid','gbraid','wbraid','utm_source','utm_medium','utm_campaign','utm_term','utm_content','fbclid'];
const EVENT_KEY='cfs-design-submitted-events-v1';
const emitted=new Set(),emittedBodies=new WeakSet();
const read=(storage,key)=>{try{return JSON.parse(storage?.getItem(key)||'null');}catch{return null;}};
const write=(storage,key,value)=>{try{storage?.setItem(key,JSON.stringify(value));}catch{/* Storage restrictions must not block a lead. */}};
export function captureSessionAttribution({url,referrer='',storage}={}){
 let landing;try{landing=new URL(url);}catch{return {};}
 // Owner edit/render links must not replace a customer's attribution or save tokens.
 if(['edit','render','t'].some(key=>landing.searchParams.has(key)))return {};
 const saved=read(storage,ATTRIBUTION_KEY),tracking={};
 for(const key of ATTRIBUTION_FIELDS){
  const prior=typeof saved?.[key]==='string'?saved[key]:'';
  tracking[key]=prior||landing.searchParams.get(key)||'';
 }
 tracking.landingPageUrl=typeof saved?.landingPageUrl==='string'?saved.landingPageUrl:landing.href;
 tracking.referrer=typeof saved?.referrer==='string'?saved.referrer:referrer;
 write(storage,ATTRIBUTION_KEY,tracking);return tracking;
}
export function browserAttribution(){
 if(typeof window==='undefined')return {};
 let storage;try{storage=window.sessionStorage;}catch{/* Private browsing can deny storage access. */}
 return captureSessionAttribution({url:window.location.href,referrer:document.referrer,storage});
}
export function trackDesignSubmitted(design,response,{target=typeof window==='undefined'?null:window,storage}={}){
 if(!target||!design||!response||response.stub||design.editToken||design.renderToken||(response.ok!==true&&response.success!==true)||typeof target.gtag!=='function')return false;
 if(!storage)try{storage=target.sessionStorage;}catch{/* Optional storage. */}
 const width=Number(design.shed?.width),length=Number(design.shed?.length);
 const sources=['google','vehicle-wrap','yard-sign','social-media','referral','other'];
 if(!Number.isFinite(width)||!Number.isFinite(length)||width<=0||length<=0||!sources.includes(design.source?.code))return false;
 const id=response.quoteNumber??response.id??response.photo?.id??design.designId;
 const key=id===undefined||id===null?null:String(id);
 const saved=read(storage,EVENT_KEY),known=Array.isArray(saved)?saved.filter(v=>typeof v==='string'):[];
 if(emittedBodies.has(design)||(key&&(emitted.has(key)||known.includes(key))))return false;
 // Explicit allowlist: never send contact fields or referral/free-text answers.
 const parameters={shed_size:width+'x'+length,heard_about_us:design.source.code};
 try{
  if(new URL(target.location?.href||'https://app.capefearshed.com/design/').searchParams.get('ga_debug')==='1')parameters.debug_mode=true;
  target.gtag('event','design_submitted',parameters);
  emittedBodies.add(design);
  if(key){emitted.add(key);write(storage,EVENT_KEY,[...known,key].slice(-100));}
  return true;
 }catch{return false;}
}
