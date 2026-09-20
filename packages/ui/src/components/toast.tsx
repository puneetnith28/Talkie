'use client';

import * as React from 'react';
import { cn } from '../utils';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
}

interface ToastContextValue {
  toast: (options: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const toast = React.useCallback(
    ({ title, description, type = 'info' }: Omit<ToastMessage, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5',
              t.type === 'success' && 'bg-[#111215]/95 border-emerald-500/30 text-white',
              t.type === 'error' && 'bg-[#111215]/95 border-red-500/30 text-white',
              t.type === 'info' && 'bg-[#111215]/95 border-white/[0.12] text-white'
            )}
          >
            {t.type === 'success' && <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertCircle className="size-5 text-red-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="size-5 text-blue-400 shrink-0 mt-0.5" />}

            <div className="flex-1">
              <h4 className="text-sm font-semibold">{t.title}</h4>
              {t.description && <p className="text-xs text-white/70 mt-0.5">{t.description}</p>}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="text-white/40 hover:text-white transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      toast: (opts: Omit<ToastMessage, 'id'>) => {
        console.log(`[Toast ${opts.type || 'info'}]: ${opts.title}`, opts.description);
      },
    };
  }
  return context;
}
