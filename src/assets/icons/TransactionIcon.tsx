import { IconProps } from "@/utils/types";
import React from "react";

const TransactionIcon: React.FC<IconProps> = ({
  size = 25,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 25 25"
    fill="none"
    className={`${className}`}
  >
    {/* <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> */}
    <path
      d="M12 20V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 20V4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 20V16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TransactionIcon;
