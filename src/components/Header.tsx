import MonthSelector from './MonthSelector';

interface Props {
  months: string[];
  activeMonth: string;
  onChange: (m: string) => void;
}

export default function Header({ months, activeMonth, onChange }: Props) {
  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        gap: 20,
        marginBottom: 32,
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 28,
            background: 'linear-gradient(135deg, var(--text), var(--accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}
        >
          Dashboard Financeiro
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--muted)',
            marginTop: 6,
          }}
        >
          NOV/2025 — MAR/2026 · CONTA CORRENTE + CARTÃO
        </p>
      </div>
      <MonthSelector months={months} activeMonth={activeMonth} onChange={onChange} />
    </header>
  );
}
