import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} fill="none" {...props}>
    <path
      stroke="#434A48"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M49.89 9.32C44.846 6.81 38.668 5.333 32 5.333S19.157 6.811 14.11 9.32c-2.475 1.232-3.713 1.848-4.91 3.784C8.003 15.04 8 16.912 8 20.661v9.307c0 15.155 12.112 23.579 19.128 27.19 1.957 1.005 2.933 1.509 4.872 1.509s2.915-.504 4.872-1.51C43.885 53.547 56 45.12 56 29.965v-9.304c0-3.749 0-5.621-1.2-7.557s-2.435-2.552-4.91-3.784Z"
    />
    <path
      stroke="#434A48"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M26.667 26.667v-4a5.334 5.334 0 0 1 10.666 0v4m-10.666 0h10.666m-10.666 0a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4h10.666a4 4 0 0 0 4-4v-4a4 4 0 0 0-4-4"
    />
  </svg>
);
const SecurityIcon = memo(SvgComponent);
export default SecurityIcon;
