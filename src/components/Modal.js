import React, { useEffect, useRef } from 'react';

export default function Modal({ children, onClose, ariaLabel = 'Dialog', className = '' }) {
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') onClose && onClose();
      // Simple focus trap: keep focus inside modal
      if (e.key === 'Tab') {
        const focusable = contentRef.current?.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKey);
    // set initial focus
    const timer = setTimeout(() => {
      (contentRef.current?.querySelector('button, input, [tabindex]') || contentRef.current)?.focus();
    }, 10);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
      clearTimeout(timer);
    };
  }, [onClose]);

  const onOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose && onClose();
  };

  return (
    <div ref={overlayRef} className={`modal-overlay`} onClick={onOverlayClick} role="dialog" aria-label={ariaLabel} aria-modal="true">
      <div ref={contentRef} className={`modal-content ${className}`} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}
