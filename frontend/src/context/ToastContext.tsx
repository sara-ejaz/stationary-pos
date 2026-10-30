import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const success = (title: string, message?: string) => addToast('success', title, message);
  const warning = (title: string, message?: string) => addToast('warning', title, message);
  const error = (title: string, message?: string) => addToast('error', title, message);
  const info = (title: string, message?: string) => addToast('info', title, message);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, warning, error, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((toast) => {
          let bgClass = 'bg-[#0a2224] border-[#143d41] text-[#f2fbfa]';
          let Icon = Info;
          let iconColor = 'text-[#007f87]';

          if (toast.type === 'success') {
            bgClass = 'bg-[#07241e] border-[#10b981]/40 text-[#f2fbfa]';
            Icon = CheckCircle2;
            iconColor = 'text-[#10b981]';
          } else if (toast.type === 'warning') {
            bgClass = 'bg-[#291e0a] border-[#f59e0b]/40 text-[#f2fbfa]';
            Icon = AlertTriangle;
            iconColor = 'text-[#f59e0b]';
          } else if (toast.type === 'error') {
            bgClass = 'bg-[#280d14] border-[#f43f5e]/40 text-[#f2fbfa]';
            Icon = XCircle;
            iconColor = 'text-[#f43f5e]';
          } else if (toast.type === 'info') {
            bgClass = 'bg-[#0a2224] border-[#007f87]/50 text-[#f2fbfa]';
            Icon = Info;
            iconColor = 'text-[#d4f1f4]';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-xl shadow-black/50 transition-all transform translate-y-0 opacity-100 ${bgClass}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 text-sm">
                <div className="font-semibold">{toast.title}</div>
                {toast.message && <div className="text-xs text-[#8da5a7] mt-0.5">{toast.message}</div>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#8da5a7] hover:text-[#f2fbfa] p-0.5 rounded transition"
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
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
};
