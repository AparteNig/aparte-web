import { IconProps } from "@/utils/types";
import React from "react";

const MessageCenterIocn: React.FC<IconProps> = ({
  size = 25,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 25 24"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M9 19H8.5C4.5 19 2.5 18 2.5 13V8C2.5 4 4.5 2 8.5 2H16.5C20.5 2 22.5 4 22.5 8V13C22.5 17 20.5 19 16.5 19H16C15.69 19 15.39 19.15 15.2 19.4L13.7 21.4C13.04 22.28 11.96 22.28 11.3 21.4L9.8 19.4C9.64 19.18 9.27 19 9 19Z"
      stroke={color}
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16.4965 11H16.5054"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.4945 11H12.5035"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.49451 11H8.50349"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default MessageCenterIocn;
