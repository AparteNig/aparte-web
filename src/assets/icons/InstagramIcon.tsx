import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" {...props}>
    <rect width={32} height={32} fill="#0F2F2A" rx={16} />
    <path
      stroke="#FAFAFA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.093}
      d="M8 16c0-3.77 0-5.657 1.171-6.829C10.343 8 12.228 8 16 8c3.77 0 5.657 0 6.829 1.171C24 10.343 24 12.228 24 16c0 3.77 0 5.657-1.171 6.829C21.657 24 19.772 24 16 24c-3.77 0-5.657 0-6.829-1.171C8 21.657 8 19.772 8 16Z"
    />
    <path
      stroke="#FAFAFA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.093}
      d="M20.639 11.368h-.009m-.84 4.631a3.79 3.79 0 1 1-7.58 0 3.79 3.79 0 0 1 7.58 0Z"
    />
  </svg>
);
const InstragramIcon = memo(SvgComponent);
export default InstragramIcon;
