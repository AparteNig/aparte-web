import { IconProps } from "@/utils/types";
import React from "react";

const NotificationIcon: React.FC<IconProps> = ({
  size = 22,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 22 22"
    fill="none"
    className={`${className}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M3.80832 12.5123V12.327C3.8355 11.7788 4.0112 11.2476 4.3173 10.7882C4.82681 10.2364 5.1756 9.56022 5.32707 8.83056C5.32707 8.26661 5.32707 7.69462 5.37632 7.13067C5.63082 4.4157 8.31531 2.53857 10.967 2.53857H11.0326C13.6843 2.53857 16.3688 4.4157 16.6315 7.13067C16.6808 7.69462 16.6315 8.26661 16.6726 8.83056C16.8261 9.56191 17.1745 10.2402 17.6823 10.7963C17.9907 11.2516 18.1667 11.7808 18.1913 12.327V12.5042C18.2096 13.2408 17.956 13.959 17.4771 14.5264C16.8443 15.1898 15.9856 15.6026 15.0635 15.6865C12.3597 15.9765 9.63172 15.9765 6.92791 15.6865C6.00689 15.599 5.14941 15.1868 4.51433 14.5264C4.04285 13.9585 3.79259 13.2446 3.80832 12.5123Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.93066 18.49C9.35313 19.0203 9.97352 19.3634 10.6545 19.4436C11.3355 19.5237 12.021 19.3342 12.5592 18.917C12.7248 18.7936 12.8737 18.6501 13.0026 18.49"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16.076" cy="5.077" r="3.38462" fill="#00AC35" />
  </svg>
);

export default NotificationIcon;
