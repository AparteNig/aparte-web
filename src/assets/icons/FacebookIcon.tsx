import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" {...props}>
    <rect width={32} height={32} fill="#0F2F2A" rx={16} />
    <path
      stroke="#FAFAFA"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M11.417 14.333v3.334h2.5V23.5h3.333v-5.833h2.5l.833-3.334H17.25v-1.666c0-.454.38-.834.833-.834h2.5V8.5h-2.5c-2.269 0-4.166 1.898-4.166 4.167v1.666h-2.5Z"
    />
  </svg>
);
const FacebookIcon = memo(SvgComponent);
export default FacebookIcon;
