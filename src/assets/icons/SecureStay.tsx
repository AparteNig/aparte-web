import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} fill="none" {...props}>
    <rect width={35} height={35} x={0.5} y={0.5} stroke="#fff" rx={17.5} />
    <path
      stroke="#fff"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m14 18 3 3 5-7m-12 3.252c0 7.687 6.918 10.387 7.887 10.728.075.027.15.027.226 0C19.084 27.65 26 25.018 26 17.253v-6.949a.4.4 0 0 0-.303-.389l-7.6-1.903a.4.4 0 0 0-.194 0l-7.6 1.903a.4.4 0 0 0-.303.389v6.948Z"
    />
  </svg>
);
const SecureStay = memo(SvgComponent);
export default SecureStay;
