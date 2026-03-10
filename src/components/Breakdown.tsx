import BreakdownCard from './BreakdownCard';

interface Props {
  gastos: Record<string, number>;
  totalGastos: number;
  activeMonth: string;
  activeCategory?: string | null;
  onSelectCategory?: (category: string | null) => void;
  catColors: Record<string, string>;
}

export default function Breakdown({ gastos, totalGastos, activeMonth, catColors, activeCategory = null, onSelectCategory, }: Props) {
  const entries = Object.entries(gastos)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const maxValue = entries.length > 0 ? entries[0][1] : 0;

  const label = `Detalhamento — ${activeMonth}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 12,
        }}
      >
        {label}
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 12,
        }}
      >
        {entries.map(([name, value]) => (
          <BreakdownCard
            key={name}
            name={name}
            value={value}
            maxValue={maxValue}
            total={totalGastos}
            catColors={catColors}
            isActive={activeCategory === name}
            onClick={() => onSelectCategory && onSelectCategory(activeCategory === name ? null : name)}
          />
        ))}
      </div>
    </div>
  );
}
