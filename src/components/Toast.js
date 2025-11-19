import React, { useEffect, useState } from 'react';
import '../App.css';

export default function Toast({ message, type = 'success', duration = 3500, onClose }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    // trigger enter animation
    const enter = setTimeout(() => setVisible(true), 10);
    const timeout = setTimeout(() => {
      setVisible(false);
      // give exit animation a moment before calling onClose
      setTimeout(() => onClose && onClose(), 250);
    }, duration);
    return () => {
      clearTimeout(enter);
      clearTimeout(timeout);
    };
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast ${type === 'error' ? 'toast-error' : 'toast-success'} ${visible ? 'toast-enter' : 'toast-exit'}`} role="status" aria-live="polite">
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={() => { setVisible(false); setTimeout(() => onClose && onClose(), 220); }} aria-label="Close">×</button>
    </div>
  );
}
