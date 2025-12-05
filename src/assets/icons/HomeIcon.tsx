import { IconProps } from "@/utils/types";
import React from "react";

const HomeIcon: React.FC<IconProps> = ({
  size = 16,
  className,
  color = "black",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={`${className}`}
  >
    <path
      d="M2 8L3.33333 6.66667M3.33333 6.66667L8 2L12.6667 6.66667M3.33333 6.66667V13.3333C3.33333 13.7015 3.63181 14 4 14H6M12.6667 6.66667L14 8M12.6667 6.66667V13.3333C12.6667 13.7015 12.3682 14 12 14H10M6 14C6.36819 14 6.66667 13.7015 6.66667 13.3333V10.6667C6.66667 10.2985 6.96514 10 7.33333 10H8.66667C9.03486 10 9.33333 10.2985 9.33333 10.6667V13.3333C9.33333 13.7015 9.63181 14 10 14M6 14H10"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default HomeIcon;
