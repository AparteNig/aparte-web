import { IconProps } from "@/utils/types";
import React from "react";

const BackArrow: React.FC<IconProps> = ({
  width = 25,
  height = 24,
  className,
  color = "currentColor",
  ...props
}) => (
  <svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 25 24"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M15.5 18L9.5 12L15.5 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default BackArrow;
