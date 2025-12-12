import type { ResultItem } from "./ResultItem";

export interface TableRowProps {
  item: ResultItem;
  onView: (item: ResultItem) => void;
}
