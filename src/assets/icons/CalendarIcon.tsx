"use client";

import React from "react";
import type { IconProps } from "@/utils/types";

const CalendarIcon: React.FC<IconProps> = ({
  size = 24,
  color = "#1F2937",
  className,
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke={color}
      strokeWidth="1.5"
    />
    <path d="M3 9H21" stroke={color} strokeWidth="1.5" />
    <path
      d="M8 3V7M16 3V7"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="8.5" cy="13.5" r="1" fill={color} />
    <circle cx="12" cy="13.5" r="1" fill={color} />
    <circle cx="15.5" cy="13.5" r="1" fill={color} />
    <circle cx="8.5" cy="17" r="1" fill={color} />
    <circle cx="12" cy="17" r="1" fill={color} />
  </svg>
);

export default CalendarIcon;
