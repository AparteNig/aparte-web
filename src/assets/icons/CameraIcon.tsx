import { IconProps } from "@/utils/types";
import React from "react";

const CameraIcon: React.FC<IconProps> = ({
  width = 30,
  height = 30,
  className,
  color = "white",
  ...props
}) => (
  <svg
    {...props}
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    className={`${className}`}
  >
    {/* <svg id="Camera" width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"> */}
    <g
      stroke="none"
      strokeWidth="1.5"
      fill="none"
      fillRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g transform="translate(2.000000, 3.000000)" stroke={color}>
        <path
          d="M13.0402,1.0513 C14.0502,1.4533 14.3592,2.8533 14.7722,3.3033 C15.1852,3.7533 15.7762,3.9063 16.1032,3.9063 C17.8412,3.9063 19.2502,5.3153 19.2502,7.0523 L19.2502,12.8473 C19.2502,15.1773 17.3602,17.0673 15.0302,17.0673 L4.9702,17.0673 C2.6392,17.0673 0.7502,15.1773 0.7502,12.8473 L0.7502,7.0523 C0.7502,5.3153 2.1592,3.9063 3.8972,3.9063 C4.2232,3.9063 4.8142,3.7533 5.2282,3.3033 C5.6412,2.8533 5.9492,1.4533 6.9592,1.0513 C7.9702,0.6493 12.0302,0.6493 13.0402,1.0513 Z"
          id="Stroke-1"
          strokeWidth="1.5"
        ></path>
        <g transform="translate(6.820900, 6.200000)" opacity="1">
          <line
            x1="8.6746"
            y1="0.5"
            x2="8.6836"
            y2="0.5"
            id="Stroke-13"
            strokeWidth="1.5"
          ></line>
          <path
            d="M6.358,4.128 C6.358,2.372 4.935,0.949 3.179,0.949 C1.423,0.949 -2.70894418e-14,2.372 -2.70894418e-14,4.128 C-2.70894418e-14,5.884 1.423,7.307 3.179,7.307 C4.935,7.307 6.358,5.884 6.358,4.128 Z"
            id="Stroke-5"
            strokeWidth="1.5"
          ></path>
        </g>
      </g>
    </g>
  </svg>
);

export default CameraIcon;
