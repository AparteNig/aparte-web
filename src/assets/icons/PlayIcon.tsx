import { IconProps } from "@/utils/types";
import React from "react";

const PlayIcon: React.FC<IconProps> = ({
  size = 433,
  className,
  color = "#667080",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 433 433"
    fill="none"
    className={`${className}`}
  >
    {/* <svg width="433" height="433" viewBox="0 0 433 433" fill="none" xmlns="http://www.w3.org/2000/svg"> */}
    <g filter="url(#filter0_f_6967_94722)">
      <circle cx="216.571" cy="216.571" r="56.0109" fill="white" />
    </g>
    <g filter="url(#filter1_bd_6967_94722)">
      <circle cx="216.571" cy="216.572" r="30.2762" fill="white" />
    </g>
    <path
      d="M210.007 226.855V203.298L226.125 215.076L210.007 226.855Z"
      fill="#00AC35"
    />
    <defs>
      <filter
        id="filter0_f_6967_94722"
        x="0.560547"
        y="0.560547"
        width="432.021"
        height="432.021"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="80"
          result="effect1_foregroundBlur_6967_94722"
        />
      </filter>
      <filter
        id="filter1_bd_6967_94722"
        x="32.2949"
        y="56.2959"
        width="368.553"
        height="368.553"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feGaussianBlur in="BackgroundImageFix" stdDeviation="7" />
        <feComposite
          in2="SourceAlpha"
          operator="in"
          result="effect1_backgroundBlur_6967_94722"
        />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="24" />
        <feGaussianBlur stdDeviation="77" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="effect1_backgroundBlur_6967_94722"
          result="effect2_dropShadow_6967_94722"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect2_dropShadow_6967_94722"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export default PlayIcon;
