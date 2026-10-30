import React from 'react';
export default function GeneratingLogo(){
 return <div className="generation-overlay" role="status" aria-live="polite"><div className="generation-overlay-card">
  <img className="generation-thinking-icon" src="/brand/thinking-circle.png" alt=""/>
  <strong>Bringing your shed to life…</strong>
  <p>Please be patient while our build crew finishes constructing your custom shed.</p><p className="generation-wait-note">Your rendering may take a couple of minutes. Keep this window open.</p>
 </div></div>;
}
