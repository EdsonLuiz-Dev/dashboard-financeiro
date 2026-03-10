const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  name: string;
  value: number;
  maxValue: number;
  total: number;
  catColors: Record<string, string>;
  onClick?: () => void;
  isActive?: boolean;
}

export default function BreakdownCard({ name, value, maxValue, total, catColors, onClick, isActive = false }: Props) {
  const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
  const barWidth = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const color = catColors[name] ?? '#888';

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: isActive ? '2px solid var(--accent)' : '1px solid var(--border)',
        borderRadius: 12,
        padding: '14px 16px',
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; if (!isActive) e.currentTarget.style.borderColor = 'var(--accent)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; if (!isActive) e.currentTarget.style.borderColor = isActive ? 'var(--accent)' : 'var(--border)'; }}
      onClick={() => onClick && onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
            {name}
          </span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
          {pct}%
        </span>
      </div>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 8,
        }}
      >
        {fmt.format(value)}
      </p>
      <div
        style={{
          height: 3,
          background: 'var(--border)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
