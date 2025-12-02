import { createPortal } from "react-dom";
import type { ReactNode } from "react";

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

const Modal = ({ opened, onClose, children, className = "" }: ModalProps) => {
  if (!opened) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div
        className="absolute inset-0"
        onClick={() => {
          onClose();
        }}
      />
      <div className={`relative z-10 w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ${className}`}>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
