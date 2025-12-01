import { IconProps } from "@/utils/types";
import React from "react";

const EmailIcon: React.FC<IconProps> = ({
  size = 20,
  className,
  color = "#667080",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 17 17"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M2.375 5.54232C2.375 5.12239 2.54181 4.71966 2.83875 4.42273C3.13568 4.1258 3.53841 3.95898 3.95833 3.95898H15.0417C15.4616 3.95898 15.8643 4.1258 16.1613 4.42273C16.4582 4.71966 16.625 5.12239 16.625 5.54232V13.459C16.625 13.8789 16.4582 14.2816 16.1613 14.5786C15.8643 14.8755 15.4616 15.0423 15.0417 15.0423H3.95833C3.53841 15.0423 3.13568 14.8755 2.83875 14.5786C2.54181 14.2816 2.375 13.8789 2.375 13.459V5.54232Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2.375 5.54102L9.5 10.291L16.625 5.54102"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default EmailIcon;
