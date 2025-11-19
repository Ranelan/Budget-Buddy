import React, { useEffect, useState } from 'react';
import Toast from './Toast';
import { subscribe, removeToast } from '../services/toastService';
import '../App.css';

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribe((msg) => {
      if (msg.action === 'push') {
        setToasts((prev) => [msg.toast, ...prev]);
      } else if (msg.action === 'remove') {
        setToasts((prev) => prev.filter((t) => t.id !== msg.id));
      }
    });
    return unsub;
  }, []);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {toasts.map((t) => (
        <div key={t.id} className="toast-wrapper" data-id={t.id}>
          <Toast
            message={t.message}
            type={t.type}
            duration={t.duration}
            onClose={() => removeToast(t.id)}
          />
        </div>
      ))}
    </div>
  );
}
