import { create } from "zustand";

export type CsvRow = Record<string, string | number | null>;

interface CsvState {
  headers: string[];
  rows: CsvRow[];
  setData: (headers: string[], rows: CsvRow[]) => void;
  reset: () => void;
}

export const useCsvStore = create<CsvState>((set) => ({
  headers: [],
  rows: [],
  setData: (headers, rows) => set({ headers, rows }),
  reset: () => set({ headers: [], rows: [] }),
}));


