import { IconProps } from "@/utils/types";
import React from "react";

const NavigationIcon: React.FC<IconProps> = ({
  size = 15,
  color = "black",
  ...props
}) => {
  return (
    <svg
      {...props}
      fill="none"
      height={size}
      viewBox="0 0 16 17"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 7.83301L14.6667 1.83301L8.66667 14.4997L7.33333 9.16634L2 7.83301Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default NavigationIcon;
