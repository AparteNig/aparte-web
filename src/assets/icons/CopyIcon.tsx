import { IconProps } from "@/utils/types";
import React from "react";

const CopyIcon: React.FC<IconProps> = ({
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
    <path
      d="M14.6667 6.375H8.29167C7.50926 6.375 6.875 7.00926 6.875 7.79167V14.1667C6.875 14.9491 7.50926 15.5833 8.29167 15.5833H14.6667C15.4491 15.5833 16.0833 14.9491 16.0833 14.1667V7.79167C16.0833 7.00926 15.4491 6.375 14.6667 6.375Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.04102 10.6248H3.33268C2.95696 10.6248 2.59662 10.4756 2.33095 10.2099C2.06527 9.94423 1.91602 9.58389 1.91602 9.20817V2.83317C1.91602 2.45745 2.06527 2.09711 2.33095 1.83144C2.59662 1.56576 2.95696 1.4165 3.33268 1.4165H9.70768C10.0834 1.4165 10.4437 1.56576 10.7094 1.83144C10.9751 2.09711 11.1243 2.45745 11.1243 2.83317V3.5415"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default CopyIcon;
