import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} fill="none" {...props}>
    <path
      stroke="#434A48"
      strokeWidth={1.5}
      d="M48 54.667v-1.334m0 1.334a8 8 0 0 1-8 8h-6.667V62l.587-.952a32 32 0 0 0 4.747-16.773V44H48m0 10.667a8 8 0 0 0 8 8h6.667V62l-.587-.952a32.001 32.001 0 0 1-4.747-16.773V44H48m0 0V0M9.333 36v-6.667a6.666 6.666 0 1 1 13.334 0V36m-16 26.667V59.92c-.001-7.85-1.735-15.604-5.078-22.707l-.256-.546V36h29.334v.667l-.256.546a53.332 53.332 0 0 0-5.078 22.707v2.747H6.667Z"
    />
  </svg>
);
const CleaningIcon = memo(SvgComponent);
export default CleaningIcon;
