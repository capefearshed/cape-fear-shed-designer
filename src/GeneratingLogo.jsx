import React from 'react';
export default function GeneratingLogo(){
 return <div className="generation-overlay" role="status" aria-live="polite"><div className="generation-overlay-card">
  <strong>Hang tight…</strong>
  <img className="generation-thinking-icon" src={import.meta.env.BASE_URL+'brand/thinking-circle.png'} alt=""/>
  <p>Our build crew is putting the finishing touches on your custom shed.</p>
 </div></div>;
}
