import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = (title, message) => addToast('success', title, message);
  const warning = (title, message) => addToast('warning', title, message);
  const error = (title, message) => addToast('error', title, message);
  const info = (title, message) => addToast('info', title, message);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, warning, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bgClass = 'bg-white border-slate-200 text-slate-900';
          let Icon = Info;
          let iconColor = 'text-[#007f87]';

          if (toast.type === 'success') {
            bgClass = 'bg-emerald-50 border-emerald-200 text-emerald-950';
            Icon = CheckCircle2;
            iconColor = 'text-emerald-600';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-amber-50 border-amber-200 text-amber-950';
            Icon = AlertTriangle;
            iconColor = 'text-amber-600';
          } else if (toast.type === 'error') {
            bgClass = 'bg-rose-50 border-rose-200 text-rose-950';
            Icon = XCircle;
            iconColor = 'text-rose-600';
          } else if (toast.type === 'info') {
            bgClass = 'bg-teal-50 border-teal-200 text-[#003d40]';
            Icon = Info;
            iconColor = 'text-[#007f87]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm">
                <div className="font-semibold">{toast.title}</div>
                {toast.message && <div className="text-xs opacity-80 mt-0.5">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="opacity-50 hover:opacity-100 p-0.5 rounded transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
export default ToastContext;
