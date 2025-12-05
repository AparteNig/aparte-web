import { IconProps } from "@/utils/types";
import React from "react";

const UserIcon: React.FC<IconProps> = ({
  size = 20,
  className,
  color = "#667080",
  ...props
}) => (
  <svg
    {...props}
    width={size}
    height={size}
    viewBox="0 0 19 19"
    fill="none"
    className={`${className}`}
  >
    <path
      id="Vector"
      d="M15.8327 16.625V15.0417C15.8327 14.2018 15.4991 13.3964 14.9052 12.8025C14.3113 12.2086 13.5059 11.875 12.666 11.875H6.33268C5.49283 11.875 4.68738 12.2086 4.09351 12.8025C3.49965 13.3964 3.16602 14.2018 3.16602 15.0417V16.625"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      id="Vector_2"
      d="M9.50065 8.70833C11.2496 8.70833 12.6673 7.29057 12.6673 5.54167C12.6673 3.79276 11.2496 2.375 9.50065 2.375C7.75175 2.375 6.33398 3.79276 6.33398 5.54167C6.33398 7.29057 7.75175 8.70833 9.50065 8.70833Z"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default UserIcon;
