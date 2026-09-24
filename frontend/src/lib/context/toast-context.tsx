"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, description?: string) => void;
    warning: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, description, duration = 4000 }: Omit<ToastMessage, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastMessage = { id, type, title, description, duration };

      setToasts((prev) => [...prev.slice(-3), newToast]); // Keep maximum 4 toasts visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: useCallback((title: string, description?: string) => showToast({ type: "success", title, description }), [showToast]),
    warning: useCallback((title: string, description?: string) => showToast({ type: "warning", title, description }), [showToast]),
    error: useCallback((title: string, description?: string) => showToast({ type: "error", title, description, duration: 6000 }), [showToast]),
    info: useCallback((title: string, description?: string) => showToast({ type: "info", title, description }), [showToast]),
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const iconMap = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />,
          error: <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />,
          info: <Info className="h-4 w-4 text-indigo-400 shrink-0" />,
        };

        const borderMap = {
          success: "border-emerald-500/30 bg-slate-900/95 text-emerald-300",
          warning: "border-amber-500/30 bg-slate-900/95 text-amber-300",
          error: "border-rose-500/30 bg-slate-900/95 text-rose-300",
          info: "border-indigo-500/30 bg-slate-900/95 text-indigo-300",
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3.5 shadow-2xl backdrop-blur-md transition-all duration-300 ${borderMap[t.type]}`}
            role="alert"
          >
            {iconMap[t.type]}
            <div className="flex-1 space-y-0.5 text-xs">
              <div className="font-semibold text-white">{t.title}</div>
              {t.description && <p className="text-slate-400 leading-snug">{t.description}</p>}
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Close notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
