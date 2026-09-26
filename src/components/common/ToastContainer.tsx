import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-indigo-400 shrink-0" />,
        };

        const borderColors = {
          success: 'border-emerald-500/30',
          error: 'border-rose-500/30',
          warning: 'border-amber-500/30',
          info: 'border-indigo-500/30',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border bg-light-card dark:bg-dark-card shadow-lg ${borderColors[toast.type]} transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
            role="alert"
          >
            <div className="flex items-center gap-3">
              {icons[toast.type]}
              <div>
                {toast.title && <p className="text-xs font-semibold text-light-text dark:text-dark-text">{toast.title}</p>}
                <p className="text-sm text-light-text dark:text-dark-text">{toast.message}</p>
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-light-muted dark:text-dark-muted transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
