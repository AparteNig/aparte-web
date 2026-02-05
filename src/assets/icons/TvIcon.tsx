import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} fill="none" {...props}>
    <path
      stroke="#434A48"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M18.666 56h26.667"
    />
    <path
      stroke="#434A48"
      strokeWidth={1.5}
      d="M5.333 43.733V9.6a1.6 1.6 0 0 1 1.6-1.6h50.134a1.6 1.6 0 0 1 1.6 1.6v34.133a1.6 1.6 0 0 1-1.6 1.6H6.933a1.6 1.6 0 0 1-1.6-1.6Z"
    />
  </svg>
);
const TvIcon = memo(SvgComponent);
export default TvIcon;
