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
      d="M25.298 16.195a2 2 0 0 1 1.232-.055l.172.055 7 2.625a2 2 0 0 1 1.291 1.708l.007.165v5.363a9 9 0 0 1-4.709 7.91l-.266.14-3.354 1.677a1.5 1.5 0 0 1-1.198.062l-.144-.062-3.354-1.677a9 9 0 0 1-4.97-7.75l-.005-.3v-5.363a2 2 0 0 1 1.145-1.808l.153-.065 7-2.625ZM26 18.068l-7 2.625v5.363a7 7 0 0 0 3.635 6.138l.235.123L26 33.882l3.13-1.565a7 7 0 0 0 3.865-5.997l.005-.264v-5.363l-7-2.625Zm3.433 4.56a1 1 0 0 1 1.497 1.32l-.083.095-5.234 5.235a1.1 1.1 0 0 1-1.46.085l-.096-.085-2.404-2.404a1 1 0 0 1 1.32-1.498l.094.083 1.768 1.768 4.598-4.598Z"
    />
  </svg>
);
const VerifiedSafety = memo(SvgComponent);
export default VerifiedSafety;
