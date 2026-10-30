import React from 'react';
export default function GeneratingLogo(){
 return <div className="generation-overlay" role="status" aria-live="polite"><div className="generation-overlay-card">
  <strong>Hang tight…</strong>
  <img className="generation-thinking-icon" src="/brand/thinking-circle.png" alt=""/>
  <p>Our build crew is putting the finishing touches on your custom shed.</p><p className="generation-wait-note">Your rendering may take a couple of minutes. Keep this window open.</p>
 </div></div>;
}
