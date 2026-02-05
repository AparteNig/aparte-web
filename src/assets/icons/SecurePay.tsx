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
      d="M14.333 17h8.109a3.599 3.599 0 0 1 2.546 1.055l3.745 3.745m-10.8 6h-3.6m7.8-7.2 2.4 2.4a1.696 1.696 0 0 1-.55 2.768 1.697 1.697 0 0 1-1.85-.368l-1.8-1.8a2.936 2.936 0 0 1-3.836.272l-.364-.272"
    />
    <path
      stroke="#0F2F2A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17.933 24.8v5.4c0 2.263 0 3.394.704 4.097.703.703 1.833.703 4.096.703h10.8c2.264 0 3.394 0 4.097-.703.703-.703.703-1.834.703-4.097v-3.6c0-2.263 0-3.394-.703-4.097-.703-.703-1.834-.703-4.097-.703h-10.2"
    />
    <path
      stroke="#0F2F2A"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M30.233 28.4a2.1 2.1 0 1 1-4.2 0 2.1 2.1 0 0 1 4.2 0Z"
    />
  </svg>
);
const SecurePay = memo(SvgComponent);
export default SecurePay;
