import React from 'react';
export default function GeneratingLogo(){
 return <div className="generation-overlay" role="status" aria-live="polite"><div className="generation-overlay-card">
  <img className="generation-thinking-icon" src="/brand/thinking-circle.png" alt=""/>
  <strong>Bringing your shed to life…</strong>
  <p>We’re creating your backyard photo. This may take a couple of minutes. Keep this page open.</p>
 </div></div>;
}
