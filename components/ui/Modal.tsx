import { useEffect } from 'react';
import type { ReactNode } from 'react';

interface ModalProps {
  open:      boolean;
  onClose:   () => void;
  title?:    string;
  children:  ReactNode;
  maxWidth?: string;
}

export default function Modal({
  open, onClose, title, children, maxWidth = 'max-w-2xl',
}: ModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${maxWidth} glass rounded-2xl shadow-2xl
          max-h-[90vh] overflow-y-auto`}
      >
        {title ? (
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors w-8 h-8
                flex items-center justify-center rounded-lg hover:bg-white/10"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white
              transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
