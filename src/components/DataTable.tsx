import React, { forwardRef, useMemo } from 'react';

interface Column<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  sortable?: boolean;
}

function DataTableInner<T extends Record<string, any>>(
  { data, columns, onRowClick, sortable = false }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLTableElement>
) {
  const sortedData = useMemo(() => {
    if (!sortable) return data;
    return [...data].sort((a, b) => {
      const key = columns[0]?.key;
      if (!key) return 0;
      return String(a[key]).localeCompare(String(b[key]));
    });
  }, [data, columns, sortable]);

  return (
    <table ref={ref} className="data-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedData.map((row, idx) => (
          <tr key={idx} onClick={() => onRowClick?.(row)}>
            {columns.map((col) => (
              <td key={String(col.key)}>
                {col.render ? col.render(row[col.key], row) : String(row[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DataTable = forwardRef(DataTableInner) as <T extends Record<string, any>>(
  props: DataTableProps<T> & { ref?: React.ForwardedRef<HTMLTableElement> }
) => React.ReactElement | null;

export default DataTable;
