export interface DateRangeInputProps {
  label?: string;
  onChange: (dates: [Date | null, Date | null]) => void;
}
