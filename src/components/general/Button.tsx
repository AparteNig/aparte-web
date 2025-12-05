import React, { ReactNode } from "react";

type ButtonType =
  | "primary"
  | "secondary"
  | "secondary-lighter"
  | "secondary-light"
  | "default"
  | "transparent";

interface ButtonProps {
  type?: ButtonType;
  className?: string;
  children: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  id?: string;
  name?: string;
  title?: string;
  ariaLabel?: string;
  buttonType?: "button" | "submit" | "reset";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  type = "default",
  className = "",
  children,
  disabled = false,
  loading = false,
  buttonType = "button",
  title,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
  ...props
}) => {
  let typeClassName = "bg-slate-200";
  switch (type) {
    case "primary":
      typeClassName = "bg-primary text-white";
      break;
    case "secondary":
      typeClassName = "bg-transparent border-2 border-gray-200";
      break;
    case "secondary-lighter":
      typeClassName = "bg-secondary-lighter";
      break;
    case "secondary-light":
      typeClassName = "bg-secondary-light";
      break;
    case "transparent":
      typeClassName = "bg-transparent";
      break;
    default:
      break;
  }
  const eventHandlers = {
    onClick,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
  };

  return (
    <button
      type={buttonType}
      aria-label={title ?? "ISDS"}
      {...props}
      {...eventHandlers}
      disabled={disabled || loading}
      className={`disabled:bg-slate-300 ${className} ${typeClassName} py-3 px-6 rounded-xl`}
    >
      {children}
    </button>
  );
};

export default Button;
