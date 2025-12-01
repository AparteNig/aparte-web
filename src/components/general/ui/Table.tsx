import React from "react";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  error?: boolean;
  emptyContent?: React.ReactNode;
}

export function Table<T>({
  columns,
  data,
  loading = false,
  error = false,
  emptyContent = "No data found.",
}: TableProps<T>) {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading data.</div>;
  }

  if (!data || data.length === 0) {
    return <div>{emptyContent}</div>;
  }

  return (
    <div className="overflow-auto">
      <table className="min-w-full table-auto text-left">
        <thead className="text-muted-foreground">
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={`px-4 py-3 ${col.className || ""}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t hover:bg-slate-50">
              {columns.map((col, colIndex) => {
                const cellContent =
                  typeof col.accessor === "function"
                    ? col.accessor(row)
                    : row[col.accessor];
                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 ${col.className || ""}`}
                  >
                    {cellContent as React.ReactNode}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
