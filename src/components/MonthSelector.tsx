interface Props {
  months: string[];
  activeMonth: string;
  onChange: (m: string) => void;
}

export default function MonthSelector({ months, activeMonth, onChange }: Props) {
  return (
    <div>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginRight: 8, marginBottom: 6, display: 'inline-block' }}>Período</label>
      <select
        value={activeMonth}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
      >
        {months.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  );
}
