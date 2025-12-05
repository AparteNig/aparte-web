import React, { useEffect } from "react";

interface ErrorMessageProps {
  message: string;
  clearError: () => void;
  duration?: number;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  clearError,
  duration = 6000,
}) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        clearError();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, clearError, duration]);

  return (
    <p className="bg-red-500 text-center py-3 px-8 !max-w-[90vw] md:!max-w-[40vw] truncate rounded-xl text-white">
      {message}
    </p>
  );
};

export default ErrorMessage;
