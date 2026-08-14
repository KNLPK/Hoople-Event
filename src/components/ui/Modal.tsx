import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** Announced as the dialog's name. */
  label: string;
  width?: number;
  children: React.ReactNode;
}

/** Backdrop + card that pops in with a small overshoot. Escape and backdrop close. */
export function Modal({ open, onClose, label, width = 560, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
