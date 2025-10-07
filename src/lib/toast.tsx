import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X } from 'lucide-react';
import { cn } from './utils';

interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'default';
}

interface ToastContextType {
  addToast: (message: string, type?: ToastMessage['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'default') => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "relative w-full max-w-sm p-4 pr-8 rounded-md shadow-lg text-white",
              {
                'bg-green-500': toast.type === 'success',
                'bg-red-500': toast.type === 'error',
                'bg-gray-800': toast.type === 'default',
              }
            )}
          >
            {toast.message}
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-1/2 right-2 -translate-y-1/2 p-1 rounded-md text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
