import { LabelProps } from "@/utils/types";
import React from "react";

const Label: React.FC<LabelProps> = ({ children, className, ...props }) => {
  return (
    <label className={`${className}`} {...props}>
      {children}
    </label>
  );
};

export default Label;
