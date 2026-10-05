import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title?: React.ReactNode;
  message?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  backdropClassName?: string;
  maxWidthClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actions,
  children,
  backdropClassName = 'bg-black/50 backdrop-blur-xs',
  maxWidthClassName = 'max-w-md',
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 top-0 left-0 w-screen h-screen min-h-[100dvh] z-[9999] flex items-center justify-center p-4 overflow-y-auto ${backdropClassName}`}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl border border-neutral-200 ${maxWidthClassName} w-full p-6 space-y-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center gap-3 text-neutral-950">
            <h3 className="text-base font-semibold">{title}</h3>
          </div>
        )}

        {(message || children) && (
          <div className="text-sm text-neutral-600 leading-relaxed">
            {message || children}
          </div>
        )}

        {actions && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {actions}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
