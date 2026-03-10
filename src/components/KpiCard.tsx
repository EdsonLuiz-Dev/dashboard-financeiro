import { useState } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  label: string;
  value: string;
  sub?: string;
  color: string;
  delay: number;
  badge?: string | null;
}

function getTooltipForLabel(label: string) {
  if (label.toLowerCase().includes('receita')) {
    return 'Total de dinheiro recebido no período (salários, rendimentos, reembolsos, etc.).';
  }
  if (label.toLowerCase().includes('gastos')) {
    return 'Soma de todas as despesas e pagamentos no período.';
  }
  if (label.toLowerCase().includes('saldo')) {
    return 'Diferença entre receitas e gastos; indica se você está no positivo ou negativo.';
  }
  if (label.toLowerCase().includes('poupança') || label.toLowerCase().includes('%')) {
    return 'Percentual da receita que foi poupado ou reservado.';
  }
  return '';
}

export default function KpiCard({ label, value, sub, color, delay, badge }: Props) {
  const [hover, setHover] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const tooltip = getTooltipForLabel(label);

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '20px 18px 16px',
        position: 'relative',
        overflow: 'visible',
        animation: `fadeUp 0.4s ease both`,
        animationDelay: `${delay}s`,
        transition: 'transform 0.2s, border-color 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={(e) => {
        setHover(true);
        setMousePos({ x: e.clientX, y: e.clientY });
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--accent)';
      }}
      onMouseLeave={(e) => {
        setHover(false);
        setMousePos(null);
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border)';
      }}
      onMouseMove={(e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Top color line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color,
        }}
      />

      {hover && tooltip && mousePos &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              left: mousePos.x + 12,
              top: mousePos.y + 12,
              width: 260,
              height: 56,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '8px 10px',
              borderRadius: 8,
              boxShadow: '0 6px 18px rgba(2,6,23,0.12)',
              fontSize: 12,
              color: 'var(--muted)',
              zIndex: 9999,
              pointerEvents: 'none',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              wordBreak: 'break-word',
            }}
          >
            {tooltip}
          </div>,
          document.body
        )}

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 8,
        }}
      >
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          {label}
          {badge && (
            <span
              style={{
                fontSize: 10,
                background: 'var(--accent2)',
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 6,
                fontWeight: 700,
                marginLeft: 6,
              }}
            >
              {badge}
            </span>
          )}
        </span>
      </p>
      <p
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 800,
          fontSize: 24,
          letterSpacing: -1,
          color: 'var(--text)',
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            marginTop: 6,
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}
