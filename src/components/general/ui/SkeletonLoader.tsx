import React from "react";

const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`skeleton-box bg-gray-200 ${className}`}></div>;
};

export default SkeletonLoader;
