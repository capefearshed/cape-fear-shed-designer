import {slidingDoorReference} from '../src/server/slidingDoorReference.js';
import {frenchDoorReference} from '../src/server/frenchDoorReference.js';
import {transomReference} from '../src/server/transomReference.js';
import {dormerReference} from '../src/server/dormerReference.js';
import {assertShedReferenceImage} from '../src/server/referenceValidation.js';
import {buildPhotoPrompt,PHOTO_PROMPT_VERSION} from '../src/server/photoPrompt.js';
import {backdropReference} from '../src/server/backdropReference.js';
import {brandRendering} from '../src/server/renderBranding.js';
import {readFile,access} from 'node:fs/promises';
import {BACKYARD_SETTINGS,PHOTO_PATH_RULE} from '../src/backyardSettings.js';
export const config={maxDuration:300};
function decodeImage(value){
 if(typeof value!=='string'||value.length>1900000)throw new Error('Image is too large. Please capture or upload a smaller image.');
 const match=/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(value);
 if(!match)throw new Error('A valid JPG, PNG or WebP image is required.');
 const bytes=Buffer.from(match[2],'base64');
 if(bytes.length<100)throw new Error('Image is empty.');
 return new Blob([bytes],{type:`image/${match[1]}`});
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method==='GET'){const scenesReady=await Promise.all(Object.values(BACKYARD_SETTINGS).map(scene=>access(new URL('../public'+scene.image,import.meta.url)).then(()=>true,()=>false)));const brandingReady=await access(new URL('../public/brand/render-mark-white.png',import.meta.url)).then(()=>true,()=>false);return res.status(200).json({available:Boolean(process.env.OPENAI_API_KEY)&&scenesReady.every(Boolean)&&brandingReady,scenesReady:scenesReady.every(Boolean),brandingReady});}
 if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});}
 if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'Realistic preview generation is not available yet.'});
 let body;try{
  body=typeof req.body==='string'?JSON.parse(req.body):req.body;
  if(!body||!['sample','photo'].includes(body.mode))throw new Error('Choose a backyard source.');
  if(body.mode==='photo')return res.status(403).json({error:'Personal backyard previews are handled by Cape Fear Shed. Please contact us with your photo and design.'});
  if(body.mode==='sample'&&!Object.hasOwn(BACKYARD_SETTINGS,body.setting))throw new Error('Choose a sample backyard.');
  if(typeof body.placement!=='string'||body.placement.length>300)throw new Error('Placement notes must be under 300 characters.');
  if(!body.design||JSON.stringify(body.design).length>16000)throw new Error('Design details are invalid.');
  const fenceHeight=body.fenceHeightFt??6;
  if(typeof fenceHeight!=='number'||!Number.isFinite(fenceHeight)||fenceHeight<2||fenceHeight>12)throw new Error('Design details: fence height must be between 2 and 12 feet.');
  const form=new FormData();
  form.append('model','gpt-image-1.5');form.append('size','1536x1024');form.append('quality','high');form.append('input_fidelity','high');form.append('n','1');
  const shedReference=decodeImage(body.shedImage);
  await assertShedReferenceImage(shedReference);
  form.append('image[]',shedReference,'shed.png');
  if(body.mode==='photo')form.append('image[]',decodeImage(body.yardImage),'backyard.jpg');
  else {const bytes=await readFile(new URL('../public'+BACKYARD_SETTINGS[body.setting].image,import.meta.url));form.append('image[]',new Blob([await backdropReference(bytes)],{type:'image/jpeg'}),'selected-backdrop-environment-only.jpg');}
  const detail=await dormerReference(shedReference,body.design,body.referenceDetails);
  if(detail)form.append('image[]',new Blob([detail],{type:'image/jpeg'}),'dormer-detail-from-image-1.jpg');
  const transomDetail=await transomReference(shedReference,body.design,body.referenceDetails);
  if(transomDetail)form.append('image[]',new Blob([transomDetail],{type:'image/jpeg'}),'door-transoms-detail-from-image-1.jpg');
  const frenchDetail=await frenchDoorReference(shedReference,body.design,body.referenceDetails);
  if(frenchDetail)form.append('image[]',new Blob([frenchDetail],{type:'image/jpeg'}),'french-doors-detail-from-image-1.jpg');
  const slidingDetail=await slidingDoorReference(shedReference,body.design,body.referenceDetails);
  if(slidingDetail)form.append('image[]',new Blob([slidingDetail],{type:'image/jpeg'}),'sliding-door-detail-from-image-1.jpg');
  const pathway=body.mode==='sample'?BACKYARD_SETTINGS[body.setting].pathway:'If the customer yard has a visible path, continue its existing material, color, stone sizes and layout to the shed door. If there is no path, add a tasteful stone or gravel path.';
  const scene='Wilmington, North Carolina: '+BACKYARD_SETTINGS[body.setting].label+'. Use the environment-only image for scenery. Place the shed toward the rear planting/fence boundary with practical clearance and low landscaping, keeping openings and siding visible. Preserve image 1 camera and proportions.';
  form.append('prompt',buildPhotoPrompt(body.design,{scene,pathway,fenceHeightFt:fenceHeight,hasDormerDetail:Boolean(detail),hasTransomDetail:Boolean(transomDetail),hasFrenchDoorDetail:Boolean(frenchDetail),hasSlidingDoorDetail:Boolean(slidingDetail)}));
  res.setHeader('X-CFS-Photo-Prompt',PHOTO_PROMPT_VERSION);
  const response=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:form,signal:AbortSignal.timeout(240000)});
  if(!response.ok){console.error('Backyard image provider status',response.status);return res.status(502).json({error:response.status===429?'Image generation is busy. Please try again shortly.':'The image service could not create this preview. Please try again later.'});}
  const data=await response.json();const image=data.data?.[0]?.b64_json;
  if(!image)return res.status(502).json({error:'The image service returned no preview. Please try again.'});
  const branded=await brandRendering(Buffer.from(image,'base64'));
  return res.status(200).json({image:`data:image/png;base64,${branded.toString('base64')}`});
 }catch(error){
  if(error instanceof SyntaxError)return res.status(400).json({error:'Invalid preview request.'});
  if(error.name==='TimeoutError')return res.status(504).json({error:'The preview took too long. Please try again.'});
  const validation=['Shed reference','Image is','A valid','Choose a','Placement notes','Design details'];
  if(validation.some(prefix=>error.message?.startsWith(prefix)))return res.status(400).json({error:error.message});
  console.error('Backyard preview failed',error.name);return res.status(500).json({error:'The preview could not be created. Please try again.'});
 }
}
