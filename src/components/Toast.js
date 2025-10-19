import React, { useEffect } from 'react';
import '../App.css';

export default function Toast({ message, type = 'success', duration = 3500, onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => {
      onClose && onClose();
    }, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'}`} role="status" aria-live="polite">
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => onClose && onClose()} aria-label="Close">×</button>
    </div>
  );
}
