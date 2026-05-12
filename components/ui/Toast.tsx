import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message:  string;
  type?:    ToastType;
  onClose:  () => void;
}

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-green-500/20 border-green-500/40 text-green-300',
  error:   'bg-red-500/20 border-red-500/40 text-red-300',
  info:    'bg-blue-500/20 border-blue-500/40 text-blue-300',
};

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-xl
        border backdrop-blur-md shadow-2xl max-w-sm w-full animate-slide-up ${STYLES[type]}`}
    >
      <span className="text-base font-bold mt-0.5 flex-shrink-0">{ICONS[type]}</span>
      <p className="text-sm font-medium flex-1 leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0 text-xs leading-none mt-0.5"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}
