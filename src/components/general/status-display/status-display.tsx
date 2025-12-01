import React, { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ImSpinner2 } from "react-icons/im";

interface StatusDisplayProps {
  loading: boolean;
  success: boolean;
  error: boolean;
  successMessage: string | null;
  errorMessage: string | null;
}

const StatusDisplay: React.FC<StatusDisplayProps> = ({
  loading,
  success,
  error,
  successMessage,
  errorMessage,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || success || error) {
      // setVisible(true);
    }
  }, [loading, success, error]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[60]">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 flex flex-col items-center relative">
        {loading && (
          <ImSpinner2 className="animate-spin text-primary text-4xl" />
        )}
        {!loading && success && (
          <div className="flex flex-col items-center text-center">
            <CheckCircleIcon className="text-green-500 w-12 h-12" />
            <p className="text-green-700 font-medium mt-2">
              {successMessage || "Action completed successfully"}
            </p>
          </div>
        )}
        {!loading && error && (
          <div className="flex flex-col items-center text-center">
            <XCircleIcon className="text-red-500 w-12 h-12" />
            <p className="text-red-700 font-medium mt-2">
              {errorMessage || "Something went wrong"}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default StatusDisplay;
