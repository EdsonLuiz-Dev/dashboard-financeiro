interface Props {
  months: string[];
  activeMonth: string;
  onChange: (m: string) => void;
}

export default function MonthSelector({ months, activeMonth, onChange }: Props) {
  return (
    <div className="month-selector">
      <label className="month-selector-label">Período</label>
      <select
        value={activeMonth}
        onChange={(e) => onChange(e.target.value)}
        className="month-selector-select"
      >
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
