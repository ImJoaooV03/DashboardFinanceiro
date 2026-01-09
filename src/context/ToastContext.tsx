import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  addToast: (message: string, type: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((state) => state.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = crypto.randomUUID();
    const newToast = { id, message, type };

    setToasts((state) => [...state, newToast]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Container - Fixed Position */}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              "pointer-events-auto flex items-center gap-3 rounded-xl p-4 shadow-lg transition-all animate-in slide-in-from-right-full duration-300 border",
              toast.type === 'success' && "bg-white border-emerald-100 text-emerald-800 shadow-emerald-100",
              toast.type === 'error' && "bg-white border-red-100 text-red-800 shadow-red-100",
              toast.type === 'warning' && "bg-white border-orange-100 text-orange-800 shadow-orange-100",
              toast.type === 'info' && "bg-white border-blue-100 text-blue-800 shadow-blue-100",
            )}
          >
            <div className={clsx(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
              toast.type === 'success' && "bg-emerald-100 text-emerald-600",
              toast.type === 'error' && "bg-red-100 text-red-600",
              toast.type === 'warning' && "bg-orange-100 text-orange-600",
              toast.type === 'info' && "bg-blue-100 text-blue-600",
            )}>
              {toast.type === 'success' && <CheckCircle size={18} />}
              {toast.type === 'error' && <AlertCircle size={18} />}
              {toast.type === 'warning' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
