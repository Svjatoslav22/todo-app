"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X, Undo2 } from "lucide-react";

const ToastContext = createContext(null);

let toastIdCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ title, description, type = "info", duration = 4000, onUndo }) => {
      const id = ++toastIdCounter;
      const toast = { id, title, description, type, duration, onUndo, createdAt: Date.now() };

      setToasts((prev) => [...prev, toast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (title, options) => addToast({ title, type: "success", ...options }),
    error: (title, options) => addToast({ title, type: "error", ...options }),
    info: (title, options) => addToast({ title, type: "info", ...options }),
    warning: (title, options) => addToast({ title, type: "warning", ...options }),
    undoable: (title, { onUndo, duration = 6000, ...options } = {}) =>
      addToast({
        title,
        type: "success",
        duration,
        onUndo,
        ...options,
      }),
    dismiss: removeToast,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
              error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
              warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
              info: <Info className="h-5 w-5 text-indigo-500 shrink-0" />,
            };

            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="pointer-events-auto relative overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-4 shadow-xl backdrop-blur-xl"
              >
                <div className="flex items-start gap-3">
                  {icons[t.type] || icons.info}
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {t.title}
                    </p>
                    {t.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {t.description}
                      </p>
                    )}
                  </div>

                  {t.onUndo && (
                    <button
                      type="button"
                      onClick={() => {
                        t.onUndo();
                        removeToast(t.id);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-100 dark:hover:bg-indigo-900/60"
                    >
                      <Undo2 className="h-3 w-3" />
                      Скасувати
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => removeToast(t.id)}
                    className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                    aria-label="Закрити"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {t.duration > 0 && (
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: t.duration / 1000, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-0.5 bg-indigo-500/40"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
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
