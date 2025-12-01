import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
}

export const Badge = ({ className = "", ...props }: BadgeProps) => {
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${className}`}
      {...props}
    />
  );
};
