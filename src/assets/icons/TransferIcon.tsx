import { IconProps } from "@/utils/types";
import React from "react";

const TransferIcon: React.FC<IconProps> = ({
  height = 23,
  width = 23,
  className,
  color = "#00AC35",
  ...props
}) => (
  <svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 14 12"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M9 4.66699L6.33333 7.33366L10.3333 11.3337L13 0.666992L1 5.33366L3.66667 6.66699L5 10.667L7 8.00033"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default TransferIcon;
