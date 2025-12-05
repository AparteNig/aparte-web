import { IconProps } from "@/utils/types";
import React from "react";

const TransactionEyeIcon: React.FC<IconProps> = ({
  size = 28,
  className,
  color = "white",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 18 17"
    fill="none"
    className={`${className}`}
  >
    <g clipPath="url(#clip0_4326_38624)">
      <path
        d="M1.20898 8.50016C1.20898 8.50016 4.04232 2.8335 9.00065 2.8335C13.959 2.8335 16.7923 8.50016 16.7923 8.50016C16.7923 8.50016 13.959 14.1668 9.00065 14.1668C4.04232 14.1668 1.20898 8.50016 1.20898 8.50016Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 10.625C10.1736 10.625 11.125 9.6736 11.125 8.5C11.125 7.32639 10.1736 6.375 9 6.375C7.82639 6.375 6.875 7.32639 6.875 8.5C6.875 9.6736 7.82639 10.625 9 10.625Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_4326_38624">
        <rect width="17" height="17" fill={color} transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);

export default TransactionEyeIcon;
