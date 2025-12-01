import { IconProps } from "@/utils/types";
import React from "react";

const DeliveriesIcon: React.FC<IconProps> = ({
  size = 25,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 25 24"
    fill="none"
    className={`${className}`}
  >
    <g clipPath="url(#clip0_14723_5384)">
      <path
        d="M5.5 7C5.5 8.06087 5.92143 9.07828 6.67157 9.82843C7.42172 10.5786 8.43913 11 9.5 11C10.5609 11 11.5783 10.5786 12.3284 9.82843C13.0786 9.07828 13.5 8.06087 13.5 7C13.5 5.93913 13.0786 4.92172 12.3284 4.17157C11.5783 3.42143 10.5609 3 9.5 3C8.43913 3 7.42172 3.42143 6.67157 4.17157C5.92143 4.92172 5.5 5.93913 5.5 7Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.5 21V19C3.5 17.9391 3.92143 16.9217 4.67157 16.1716C5.42172 15.4214 6.43913 15 7.5 15H11.5C12.5609 15 13.5783 15.4214 14.3284 16.1716C15.0786 16.9217 15.5 17.9391 15.5 19V21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.12988C17.3604 3.35018 18.123 3.85058 18.6676 4.55219C19.2122 5.2538 19.5078 6.11671 19.5078 7.00488C19.5078 7.89305 19.2122 8.75596 18.6676 9.45757C18.123 10.1592 17.3604 10.6596 16.5 10.8799"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5 21.0004V19.0004C21.4949 18.1175 21.1979 17.2612 20.6553 16.5648C20.1126 15.8684 19.3548 15.3711 18.5 15.1504"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_14723_5384">
        <rect width="24" height="24" fill="white" transform="translate(0.5)" />
      </clipPath>
    </defs>
  </svg>
);

export default DeliveriesIcon;
