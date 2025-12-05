const logMessage = (level: string, message: string) => {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console[level as "log" | "warn" | "error"]?.(message);
  }
};

const CustomToast = () => null;

export const showToast = {
  success: (message: string) => logMessage("log", `SUCCESS: ${message}`),
  error: (message: string) => logMessage("error", `ERROR: ${message}`),
  info: (message: string) => logMessage("log", `INFO: ${message}`),
  warning: (message: string) => logMessage("warn", `WARNING: ${message}`),
};

export default CustomToast;
