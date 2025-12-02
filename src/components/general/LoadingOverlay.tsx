"use client";

import { createPortal } from "react-dom";

type LoadingOverlayProps = {
  isOpen: boolean;
  title?: string;
  message?: string;
};

const LoadingOverlay = ({ isOpen, title = "Saving changes…", message }: LoadingOverlayProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-3xl bg-white/95 px-10 py-8 text-center shadow-2xl">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-base font-semibold text-slate-900">{title}</p>
        {message ? <p className="max-w-xs text-sm text-slate-600">{message}</p> : null}
      </div>
    </div>,
    document.body,
  );
};

export default LoadingOverlay;
