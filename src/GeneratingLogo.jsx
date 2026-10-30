import React from 'react';
// Reuse the exact logo pixels: stationary illustration, independently rotating lettering.
const CENTER='M244 88 C332 88 402 159 402 246 L402 278 L415 309 L423 347 L410 375 L377 401 L327 424 L270 440 L212 437 L156 420 L108 397 L69 365 L69 334 L86 320 L88 243 C88 156 158 88 244 88 Z';
export default function GeneratingLogo(){
 return <div className="generation-progress" role="status" aria-live="polite">
  <svg className="generation-logo" viewBox="0 0 489 491" aria-hidden="true">
   <defs><clipPath id="generation-center"><path d={CENTER}/></clipPath><clipPath id="generation-letters"><path d={'M0 0V491H489V0Z '+CENTER} clipRule="evenodd"/></clipPath></defs>
   <g className="generation-logo-ring"><image href="/brand/logo-transparent.png" width="489" height="491" clipPath="url(#generation-letters)"/></g>
   <image href="/brand/logo-transparent.png" width="489" height="491" clipPath="url(#generation-center)"/>
  </svg>
  <strong>Bringing your shed to life…</strong><p>We’re creating your backyard photo. This may take a couple of minutes. Keep this page open.</p>
 </div>;
}
