import * as React from "react";
import { SVGProps, memo } from "react";
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={64} height={64} fill="none" {...props}>
    <path
      fill="#434A48"
      d="M30.053 50.667h3.894V45.12l8.72-8.72V25.643c0-.411-.171-.788-.512-1.131-.342-.343-.718-.514-1.128-.512H22.973c-.409 0-.785.17-1.128.512-.343.341-.514.718-.512 1.13V36.4l8.72 8.72v5.547Zm-2.666 2.666v-7.077l-8.72-8.717V25.643c0-1.195.42-2.212 1.258-3.051.84-.84 1.856-1.259 3.051-1.259h3.28l-1.333 1.334v-12h2.666v10.666h8.822V10.667h2.666v12l-1.333-1.334h3.28c1.195 0 2.212.42 3.05 1.259.84.84 1.26 1.856 1.26 3.05V37.54l-8.72 8.72v7.074h-9.227Z"
    />
  </svg>
);
const PlugIcon = memo(SvgComponent);
export default PlugIcon;
