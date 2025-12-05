import { IconProps } from "@/utils/types";
import React from "react";

const LockIcon: React.FC<IconProps> = ({
  size = 20,
  className,
  color = "#667080",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 17 17"
    fill="none"
    className={`${className}`}
  >
    <path
      //  <path
      d="M13.4583 7.79297H3.54167C2.75926 7.79297 2.125 8.42723 2.125 9.20964V14.168C2.125 14.9504 2.75926 15.5846 3.54167 15.5846H13.4583C14.2407 15.5846 14.875 14.9504 14.875 14.168V9.20964C14.875 8.42723 14.2407 7.79297 13.4583 7.79297Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.95898 7.79297V4.95964C4.95898 4.02033 5.33212 3.11949 5.99631 2.4553C6.66051 1.79111 7.56134 1.41797 8.50065 1.41797C9.43996 1.41797 10.3408 1.79111 11.005 2.4553C11.6692 3.11949 12.0423 4.02033 12.0423 4.95964V7.79297"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default LockIcon;
