import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" {...props}>
    <rect width={32} height={32} fill="#0F2F2A" rx={16} />
    <g clipPath="url(#a)">
      <path
        stroke="#FAFAFA"
        strokeLinejoin="round"
        d="M18.667 9h-2.334v9.667c0 1-1 2-2 2s-2-.334-2-2c0-1.334 1.266-2.226 2.334-2v-2.334c-4.08 0-4.667 3.334-4.667 4.334 0 1 .651 4.333 4.333 4.333 3.015 0 4.334-2.333 4.334-4v-5.333c.764.678 1.948.904 3.333 1v-2.334c-2.011 0-3.333-1.769-3.333-3.333Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M8 8h16v16H8z" />
      </clipPath>
    </defs>
  </svg>
);
const TikIcon = memo(SvgComponent);
export default TikIcon;
