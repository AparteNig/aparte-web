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
      fill="#0F2F2A"
      fillRule="evenodd"
      d="M33.467 24.18c-.31-3.18-2.19-8.18-8-8.18-5.81 0-7.69 5-8 8.18a2.79 2.79 0 0 0-1.8 2.62v1.4a2.8 2.8 0 1 0 5.6 0v-1.4a2.81 2.81 0 0 0-1.75-2.59c.2-1.84 1.18-6.21 5.95-6.21 4.77 0 5.74 4.37 5.94 6.21a2.8 2.8 0 0 0-1.74 2.59v1.4a2.81 2.81 0 0 0 1.59 2.52c-.42.79-1.49 1.86-4.12 2.18a2 2 0 1 0-1.67 3.1 2 2 0 0 0 1.78-1.11c4.29-.49 5.66-2.7 6.09-4a2.79 2.79 0 0 0 1.93-2.69v-1.4a2.79 2.79 0 0 0-1.8-2.62Zm-14.2 4.02a.8.8 0 0 1-1.6 0v-1.4a.8.8 0 1 1 1.6 0v1.4Zm12.4-1.4a.8.8 0 0 1 1.6 0v1.4a.8.8 0 0 1-1.6 0v-1.4Z"
      clipRule="evenodd"
    />
  </svg>
);
const SafetySupport = memo(SvgComponent);
export default SafetySupport;
