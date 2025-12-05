import { IconProps } from "@/utils/types";
import React from "react";

const IconParkIcon: React.FC<IconProps> = ({
  height = 24,
  width = 24,
  className,
  color = "currentcolor",
  ...props
}) => (
  <svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M6 5.5C8.76142 5.5 11 4.38071 11 3C11 1.61929 8.76142 0.5 6 0.5C3.23858 0.5 1 1.61929 1 3C1 4.38071 3.23858 5.5 6 5.5Z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 3V6.5C1 7.8805 3.2385 9 6 9C8.7615 9 11 7.8805 11 6.5V3"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 6.5V10C1 11.3805 3.2385 12.5 6 12.5C8.7615 12.5 11 11.3805 11 10V6.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 10V13.5C1 14.8805 3.2385 16 6 16C8.7615 16 11 14.8805 11 13.5V10"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1 13.5V17C1 18.3805 3.2385 19.5 6 19.5C8.7615 19.5 11 18.3805 11 17V13.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 12.5C18.7614 12.5 21 11.3807 21 10C21 8.61929 18.7614 7.5 16 7.5C13.2386 7.5 11 8.61929 11 10C11 11.3807 13.2386 12.5 16 12.5Z"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 10V13.5C11 14.8805 13.2385 16 16 16C18.7615 16 21 14.8805 21 13.5V10"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 13.5V17C11 18.3805 13.2385 19.5 16 19.5C18.7615 19.5 21 18.3805 21 17V13.5"
      stroke={color}
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconParkIcon;
