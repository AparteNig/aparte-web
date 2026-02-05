import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={52} height={52} fill="none" {...props}>
    <rect
      width={50.436}
      height={50.436}
      x={0.782}
      y={0.782}
      stroke="#0F2F2A"
      strokeWidth={1.564}
      rx={25.218}
    />
    <path
      stroke="#0F2F2A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.758 26.258v-7c0-.55.45-1 1-1h14c.55 0 1 .45 1 1v14c0 .55-.45 1-1 1h-14c-.55 0-1-.45-1-1v-7Z"
    />
    <path
      stroke="#0F2F2A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="m21.758 26.258 3 3 5-5"
    />
  </svg>
);
const InstantConfirm = memo(SvgComponent);
export default InstantConfirm;
