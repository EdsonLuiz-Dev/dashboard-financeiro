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
      className={`breakdown-card interactive ${isActive ? 'active' : ''}`}
      onClick={() => onClick && onClick()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            className="w-2 h-2"
            style={{
              borderRadius: '50%',
              background: color,
              flexShrink: 0,
              height: '8px',
              width: '8px',
            }}
          />
          <span className="text-mono text-sm">
            {name}
          </span>
        </div>
        <span className="text-mono text-xs text-muted">
          {pct}%
        </span>
      </div>
      <p className="text-display font-bold text-lg mb-2">
        {fmt.format(value)}
      </p>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{
            height: '100%',
            width: `${barWidth}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
