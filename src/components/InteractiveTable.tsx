import { useMemo, useState, type ReactNode } from "react";

export type TableColumn<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  sortValue: (row: T) => string | number;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  rows: T[];
  columns: TableColumn<T>[];
  rowKey: (row: T) => string;
};

export function InteractiveTable<T>({ rows, columns, rowKey }: Props<T>) {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? "");
  const [direction, setDirection] = useState<"asc" | "desc">("asc");
  const [picked, setPicked] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const column = columns.find((item) => item.key === sortKey) ?? columns[0];
    if (!column) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = column.sortValue(a);
      const vb = column.sortValue(b);
      const base = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb), "pt-BR");
      return direction === "asc" ? base : -base;
    });
    return copy;
  }, [rows, columns, sortKey, direction]);

  function onSort(key: string) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  }

  return (
    <div className="table-scroll table-interactive">
      <table>
        <thead>
          <tr>
            {columns.map((column) => {
              const on = sortKey === column.key;
              return (
                <th key={column.key} aria-sort={on ? (direction === "asc" ? "ascending" : "descending") : "none"}>
                  <button type="button" className="th-sort" onClick={() => onSort(column.key)}>
                    {column.label}
                    <span aria-hidden="true">{on ? (direction === "asc" ? " ↑" : " ↓") : ""}</span>
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="muted">
                Sem linhas neste recorte.
              </td>
            </tr>
          ) : (
            sorted.map((row) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  className={picked === key ? "is-picked" : ""}
                  onClick={() => setPicked((current) => (current === key ? null : key))}
                >
                  {columns.map((column) => (
                    <td key={column.key} style={{ textAlign: column.align ?? undefined }}>
                      {column.render ? column.render(row) : String(column.sortValue(row))}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
