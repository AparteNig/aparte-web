import React from "react";
import { ToastContainer, toast, cssTransition } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const slideFromBottom = cssTransition({
  enter: "slideInFromBottom",
  exit: "slideOutToBottom",
});

const customToastStyles = {
  success: {
    borderBottom: "3px solid #4CAF50",
  },
  error: {
    borderBottom: "3px solid #F44336",
  },
  info: {
    borderBottom: "3px solid #2196F3",
  },
  warning: {
    borderBottom: "3px solid #FF9800",
  },
};

const CustomToast = () => {
  return (
    <ToastContainer
      position="bottom-center"
      autoClose={3000}
      closeButton={false}
      closeOnClick
      pauseOnFocusLoss
      draggable
      hideProgressBar
      transition={slideFromBottom}
      pauseOnHover
      style={{
        zIndex: 9999,
      }}
      toastStyle={{
        textAlign: "center",
        backgroundColor: "white",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
      }}
    />
  );
};

export const showToast = {
  success: (message: string) =>
    toast.success(message, {
      style: customToastStyles.success,
    }),
  error: (message: string) =>
    toast.error(message, {
      style: customToastStyles.error,
    }),
  info: (message: string) =>
    toast.info(message, {
      style: customToastStyles.info,
    }),
  warning: (message: string) =>
    toast.warning(message, {
      style: customToastStyles.warning,
    }),
};

export default CustomToast;
