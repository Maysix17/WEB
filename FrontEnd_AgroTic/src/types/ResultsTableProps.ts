import type { ResultItem } from "./ResultItem";

export interface ResultsTableProps {
  data: ResultItem[];
  onView: (item: ResultItem) => void;
}
