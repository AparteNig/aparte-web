import { IconProps } from "@/utils/types";
import React from "react";

const ChevronDownIcon: React.FC<IconProps> = ({
  width = 21,
  height = 20,
  color = "currentColor",
  ...props
}) => (
  <svg width={width} height={height} viewBox="0 0 21 20" fill="none" {...props}>
    <path
      d="M5.0293 7.50049L10.0293 12.5005L15.0293 7.50049"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default ChevronDownIcon;
