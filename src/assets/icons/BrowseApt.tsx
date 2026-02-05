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
      strokeWidth={1.069}
      d="M31.941 19.46c3.042 6.06-1.21 9.557-4.761 10.343m-7 3.695c-3.576-6.376.779-10.057 4.429-10.887m-1.402-5.18c10.184.884 7.048 12.1 3.941 12.403m1.472 5.14c-6.516-.566-7.578-5.364-6.683-8.824m-5.246-1.343c3.733-6.29 9.302-4.101 11.74-1.287m6.432 3.95c-3.466 5.945-8.55 4.478-11.221 1.975m5.942-3.187a3.824 3.824 0 0 1-6.53 2.705 3.825 3.825 0 1 1 6.53-2.705Zm5.364 0a9.19 9.19 0 1 1-18.38 0 9.19 9.19 0 0 1 18.38 0Z"
    />
  </svg>
);
const BrowseApt = memo(SvgComponent);
export default BrowseApt;
