import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={24} fill="none" {...props}>
    <path
      fill="#0F2F2A"
      d="m2.452 6.58 1.061-1.06 5.779 5.777a.996.996 0 0 1 0 1.413l-5.779 5.78-1.06-1.06 5.424-5.425L2.452 6.58Z"
    />
  </svg>
);
const CaretRight = memo(SvgComponent);
export default CaretRight;
