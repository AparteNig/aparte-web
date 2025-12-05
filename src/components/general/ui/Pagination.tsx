/* eslint-disable no-nested-ternary */
import React from "react";

interface PaginationProps {
  total: number;
  page: number;
  onChange: (page: number) => void;
  showControls?: boolean;
  size?: "sm" | "md";
  color?: "primary" | "default";
}

export const Pagination = ({
  total,
  page,
  onChange,
  showControls = true,
  size = "md",
  color = "default",
}: PaginationProps) => {
  const buttonSize = size === "sm" ? "px-2 py-1 text-sm" : "px-3 py-1.5";
  const buttonColor =
    color === "primary"
      ? "border border-primary text-primary hover:bg-primary hover:text-white"
      : "border text-gray-600 hover:bg-gray-100";

  const handlePageClick = (p: number) => {
    if (p >= 1 && p <= total && p !== page) {
      onChange(p);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {showControls && (
        <button
          onClick={() => handlePageClick(page - 1)}
          disabled={page <= 1}
          className={`${buttonSize} ${buttonColor} rounded disabled:opacity-50`}
        >
          Prev
        </button>
      )}

      {Array.from({ length: total }, (_, i) => (
        <button
          key={i}
          onClick={() => handlePageClick(i + 1)}
          className={`${buttonSize} border rounded ${
            page === i + 1
              ? color === "primary"
                ? "bg-primary text-white"
                : "bg-gray-200 text-gray-900"
              : buttonColor
          }`}
        >
          {i + 1}
        </button>
      ))}

      {showControls && (
        <button
          onClick={() => handlePageClick(page + 1)}
          disabled={page >= total}
          className={`${buttonSize} ${buttonColor} rounded disabled:opacity-50`}
        >
          Next
        </button>
      )}
    </div>
  );
};
