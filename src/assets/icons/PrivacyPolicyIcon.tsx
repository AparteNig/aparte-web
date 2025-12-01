import { IconProps } from "@/utils/types";
import React from "react";

const PrivacyPolicyIcon: React.FC<IconProps> = ({
  size = 26,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 24 25"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M14 2.3999H6C5.46957 2.3999 4.96086 2.61062 4.58579 2.98569C4.21071 3.36076 4 3.86947 4 4.3999V20.3999C4 20.9303 4.21071 21.439 4.58579 21.8141C4.96086 22.1892 5.46957 22.3999 6 22.3999H18C18.5304 22.3999 19.0391 22.1892 19.4142 21.8141C19.7893 21.439 20 20.9303 20 20.3999V8.3999L14 2.3999Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 2.3999V8.3999H20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 13.3999H8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 17.3999H8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10 9.3999H9H8"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PrivacyPolicyIcon;
