import { IconProps } from "@/utils/types";
import React from "react";

const TickIcon: React.FC<IconProps> = ({
  size = 17,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 14 17"
    fill="none"
    className={`${className}`}
  >
    {/* <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg"> */}
    <path
      d="M11.6673 3.5L5.25065 9.91667L2.33398 7"
      stroke="#00AC35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.6673 6.5L5.25065 12.9167L2.33398 10"
      stroke="#00AC35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TickIcon;
