import React from 'react';
import { cn } from '../../lib/utils';

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | string;
  className?: string;
}

interface ReusableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderRow: (row: T, idx: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

function ReusableTable<T>({ columns, data, renderRow, emptyMessage = 'No data found.', className = '' }: ReusableTableProps<T>) {
  return (
    <div className={cn("w-full overflow-auto", className)}>
      <div className="rounded-md border shadow-sm">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b bg-gray-50/50">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0 bg-white">
            {data.length > 0 ? (
              data.map((row, idx) => renderRow(row, idx))
            ) : (
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <td 
                  colSpan={columns.length} 
                  className="h-24 text-center align-middle text-muted-foreground"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ReusableTable; 