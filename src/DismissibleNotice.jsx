import React from 'react';
import {X} from 'lucide-react';
export default function DismissibleNotice({message,onDismiss,role='status'}){
 return <div className="notice" role={role} onClick={onDismiss}>
  <button type="button" className="notice-close" aria-label="Dismiss notification" onClick={event=>{event.stopPropagation();onDismiss();}}><X size={18} aria-hidden="true"/></button>
  <span className="notice-message">{message}</span>
 </div>;
}
