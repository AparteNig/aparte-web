import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} fill="none" {...props}>
    <rect width={32} height={32} fill="#0F2F2A" rx={16} />
    <path
      fill="#FAFAFA"
      stroke="#FAFAFA"
      strokeWidth={0.656}
      d="m12.918 10.328 3.398 3.728.225.247.243-.23 3.947-3.745h1.5l-4.762 4.518-.234.22.217.238 5.806 6.368h-4.052l-3.768-4.089-.226-.245-.241.228-4.33 4.106H9.139l5.135-4.871.235-.222-.219-.238-5.542-6.013h4.17Zm-2.295 1.049 8.876 9.627.098.105h2.246l-.501-.549-8.777-9.626-.097-.107h-2.352l.507.55Z"
    />
  </svg>
);
const XIcon = memo(SvgComponent);
export default XIcon;
