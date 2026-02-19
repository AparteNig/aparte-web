"use client";

import { useEffect, useState } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type ToastListener = (toast: Toast) => void;

const listeners: ToastListener[] = [];

const notify = (toast: Toast) => {
  listeners.forEach((listener) => listener(toast));
};

const makeToast = (variant: ToastVariant, message: string): Toast => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  message,
  variant,
});

export const showToast = {
  success: (message: string) => notify(makeToast("success", message)),
  error: (message: string) => notify(makeToast("error", message)),
  info: (message: string) => notify(makeToast("info", message)),
  warning: (message: string) => notify(makeToast("warning", message)),
};

const variantStyles: Record<ToastVariant, string> = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900",
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

const CustomToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler: ToastListener = (toast) => {
      setToasts((prev) => [...prev, toast]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== toast.id));
      }, 4000);
    };
    listeners.push(handler);
    return () => {
      const index = listeners.indexOf(handler);
      if (index >= 0) listeners.splice(index, 1);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(360px,90vw)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`rounded-2xl border px-4 py-3 text-sm shadow-lg ${variantStyles[toast.variant]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export default CustomToast;
