import {removeEditorObjects} from './editorScene.js';
import ChoiceCamera from './ChoiceCamera.jsx';
import {captureBackyardReference} from './referenceCapture.js';
import React,{forwardRef,useImperativeHandle,useRef,useLayoutEffect,useState} from 'react';
import {Canvas,useThree} from '@react-three/fiber';
import {ContactShadows,OrbitControls} from '@react-three/drei';
import {Box3,Vector3} from 'three';
import Shed from './Shed.jsx';
import InteriorShed from './InteriorShed.jsx';
import {WallCamera,InteriorCamera} from './designerViewParts.jsx';
import {frameBackyardCamera,frameFrontLeftCamera} from './backyardCamera.js';
import {captureSubmissionImages} from './submissionCapture.js';
import {createCapturePath} from './capturePath.js';

const initialOrbitTarget=[0,3.7,0];

class PreviewBoundary extends React.Component{
 constructor(props){super(props);this.state={error:false};}
 static getDerivedStateFromError(){return {error:true};}
 render(){return this.state.error?<div className="catalog-preview-unavailable" role="status"><strong>3D preview unavailable in this browser</strong><p>Your selections are available below. Use a browser with WebGL enabled to view and capture your shed.</p></div>:this.props.children;}
}
export default forwardRef(function DesignerViewer({design,tab,wall,selected,onSelect,cameraFocus,cameraIntent},ref){
 const viewer=useRef(null),shed=useRef(null),exterior=useRef(null),controls=useRef(null);
 const [manualCamera,setManualCamera]=useState(false);
 const d=design,interior=tab==='accessories',wallMode=tab==='openings'||cameraFocus?.kind==='door';
 useLayoutEffect(()=>{setManualCamera(false);},[tab,wall,selected,cameraIntent,d.width,d.length,d.height]);
 useLayoutEffect(()=>{if(cameraFocus)setManualCamera(false);},[cameraFocus]);
 useImperativeHandle(ref,()=>({async captureSubmission(lastRender,source){
  if(!viewer.current||!exterior.current)throw new Error('The model is still loading.');
  const restore=removeEditorObjects(exterior.current);try{return await captureSubmissionImages(viewer.current,exterior.current,lastRender,source);}finally{restore();}
 },capture(auto=true,guide=true,preset){
  const state=viewer.current;if(!state||!exterior.current)throw new Error('The model is still loading.');
  const referenceCamera=state.camera.clone();referenceCamera.aspect=1.5;referenceCamera.updateProjectionMatrix();
  if(auto){if(preset==='front-left')frameFrontLeftCamera(referenceCamera,exterior.current);else frameBackyardCamera(referenceCamera,exterior.current,d.openings);}
  const restore=removeEditorObjects(exterior.current);
  const bounds=new Box3().setFromObject(exterior.current),path=guide?createCapturePath(d.openings,d.width,d.length,d.foundation):null;
  if(path)exterior.current.add(path);
  try{
   return {image:captureBackyardReference(state,referenceCamera),physicalSize:{widthFt:d.width,lengthFt:d.length,overallHeightFt:Number(bounds.getSize(new Vector3()).y.toFixed(2))}};
  }finally{if(path){exterior.current.remove(path);path.userData.dispose();}restore();state.gl.render(state.scene,state.camera);}
 }}),[d]);
 return <div className="canvas-box"><span className="size-chip viewer-size">{d.width}' × {d.length}'</span>
  <PreviewBoundary><Canvas resize={{debounce:{resize:100,scroll:0}}} shadows dpr={[1,1.65]} camera={{position:[20,12,20],fov:39,near:.1,far:500}} gl={{antialias:true,alpha:true}} onCreated={s=>{viewer.current=s;s.gl.setClearColor('#F3F4F1',1)}}>
   <ambientLight intensity={.75}/><hemisphereLight args={['#eef4ff','#a5a18d',1.1]}/>
   <directionalLight position={[9,20,12]} intensity={2.7} castShadow={interior||d.sidingType==='lp-panel'} shadow-mapSize={[1024,1024]} shadow-camera-left={-30} shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30} shadow-normalBias={interior?.005:.035}/><directionalLight position={[-12,8,-6]} intensity={.65}/>
   <group ref={exterior} visible={!interior} rotation={[0,-.2,0]}><Shed w={d.width} l={d.length} wallHeight={d.height} pitch={d.pitch} roofStyle={d.roofStyle} dormer={d.dormer} paint={d.paint} trim={d.trim} roofColor={d.roof} roofMaterial={d.roofMaterial} metalColor={d.metalColor} sidingType={d.sidingType} concreteSlab={d.foundation==='slab'} openings={d.openings} selected={wallMode?selected:null} setSelected={id=>{setManualCamera(false);onSelect(id);}} onMoveOpening={undefined}/></group>
   <group ref={shed} visible={interior} rotation={[0,-.2,0]}>{interior&&<InteriorShed w={d.width} l={d.length} wallHeight={d.height} accessories={d.accessories} placements={d.interiorWalls} openings={d.openings} pitch={d.pitch} roofStyle={d.roofStyle} dowelLengthIn={d.dowel||18} concreteSlab={d.foundation==='slab'}/>}</group>
   <ContactShadows position={[0,d.foundation==='slab'?-.005:-.375]} opacity={d.foundation==='slab'?.12:.45} scale={Math.max(35,d.length*1.3)} blur={2.6} far={14}/>
   <ChoiceCamera active={!manualCamera&&!wallMode&&!interior} focus={cameraFocus?.kind} objectRef={exterior} controlsRef={controls} shapeKey={JSON.stringify(d)}/>
   {interior&&<InteriorCamera shedRef={shed} controlsRef={controls} width={d.width} length={d.length}/>}
   <WallCamera shedRef={exterior} controlsRef={controls} active={wallMode&&!manualCamera} wall={cameraFocus?.kind==='door'?cameraFocus.wall:wall} width={d.width} length={d.length} shapeKey={JSON.stringify(d)}/>
   <OrbitControls ref={controls} enabled={!wallMode} onStart={()=>setManualCamera(true)} makeDefault target={initialOrbitTarget} minDistance={2} maxDistance={500} maxPolarAngle={Math.PI/2.03} enablePan={false}/>
  </Canvas></PreviewBoundary><div className="canvas-label">{interior?'Interior cutaway · rotate and zoom':'Interactive 3D model'}</div>
 </div>;
});
