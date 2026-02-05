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
      fill="#000"
      d="M19 34v-2h1.6l1.975-6.575c.133-.433.38-.779.738-1.037A1.993 1.993 0 0 1 24.5 24h3c.433 0 .83.13 1.188.388.359.259.604.604.737 1.037L31.4 32H33v2H19Zm3.7-2h6.6l-1.8-6h-3l-1.8 6ZM25 22v-5h2v5h-2Zm5.95 2.475-1.425-1.425 3.55-3.525 1.4 1.4-3.525 3.55ZM32 29v-2h5v2h-5Zm-10.95-4.525-3.525-3.55 1.4-1.4 3.55 3.525-1.425 1.425ZM15 29v-2h5v2h-5Z"
    />
  </svg>
);
const EmmergencyAss = memo(SvgComponent);
export default EmmergencyAss;
