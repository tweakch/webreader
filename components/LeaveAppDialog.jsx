import { useEffect, useRef } from 'react';
import { useTheme } from '../ui/ThemeContext';

export default function LeaveAppDialog({ open, onConfirm, onCancel }) {
  const { dark: darkMode, hc: highContrast } = useTheme();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return (
    <div
      data-testid="leave-app-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-app-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm rounded-2xl shadow-xl p-6 ${
          highContrast
            ? (darkMode ? 'bg-black text-white border border-white/60' : 'bg-white text-black border border-black/60')
            : darkMode
              ? 'bg-slate-900 text-amber-100 border border-amber-700/40'
              : 'bg-white text-amber-900 border border-amber-200'
        }`}
      >
        <h2 id="leave-app-title" className="text-lg font-serif font-bold mb-2">
          App verlassen?
        </h2>
        <p className={`text-sm mb-5 ${
          highContrast ? '' : darkMode ? 'text-amber-300' : 'text-amber-800'
        }`}>
          Du bist an der Startseite der App angekommen. Möchtest du die App verlassen und zur Landing Page zurückkehren?
        </p>
        <div className="flex justify-end gap-2">
          <button
            data-testid="leave-app-cancel"
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'text-amber-200 hover:bg-slate-800'
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            Bleiben
          </button>
          <button
            ref={confirmRef}
            data-testid="leave-app-confirm"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-amber-700 text-white hover:bg-amber-600'
                : 'bg-amber-900 text-white hover:bg-amber-800'
            }`}
          >
            Verlassen
          </button>
        </div>
      </div>
    </div>
  );
}
