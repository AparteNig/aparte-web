import { IconProps } from "@/utils/types";
import React from "react";

const SideBarIcon: React.FC<IconProps> = ({
  size = 24,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M9.5 3V21M5 7H6M5 10H6M2 12C2 8.31 2 6.466 2.814 5.159C3.1072 4.68353 3.48114 4.26288 3.919 3.916C5.08 3 6.72 3 10 3H14C17.28 3 18.919 3 20.081 3.916C20.511 4.254 20.885 4.675 21.186 5.159C22 6.466 22 8.31 22 12C22 15.69 22 17.534 21.186 18.841C20.8928 19.3165 20.5189 19.7371 20.081 20.084C18.92 21 17.28 21 14 21H10C6.72 21 5.081 21 3.919 20.084C3.48114 19.7371 3.1072 19.3165 2.814 18.841C2 17.534 2 15.69 2 12Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SideBarIcon;
