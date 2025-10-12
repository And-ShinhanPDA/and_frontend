import { useState } from "react";

export interface RowBase {
  id: number;
  filled: boolean;
}

interface UseConditionRowsOptions<T extends RowBase, U> {
  initial: Omit<T, "id">;
  updateFn: (prev: T, data: U) => T;
}

export default function useConditionRows<T extends RowBase, U>({
  initial,
  updateFn,
}: UseConditionRowsOptions<T, U>) {
  const [rows, setRows] = useState<T[]>([
    { id: Date.now(), ...(initial as any) },
  ]);

  const addRow = () =>
    setRows((prev) => [...prev, { id: Date.now(), ...(initial as any) }]);

  const removeRow = (id: number) =>
    setRows((prev) => prev.filter((r) => r.id !== id));

  const updateRow = (id: number, data: U) =>
    setRows((prev) => prev.map((r) => (r.id === id ? updateFn(r, data) : r)));

  const resetRow = (id?: number) => {
    if (id)
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? ({ id: r.id, ...(initial as any) } as T) : r
        )
      );
    else setRows([{ id: Date.now(), ...(initial as any) }]);
  };

  const hasFilled = rows.some((r) => r.filled);

  return { rows, addRow, removeRow, updateRow, resetRow, hasFilled, setRows };
}
