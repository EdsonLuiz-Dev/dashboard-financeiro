import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

interface Props {
  gastos: Record<string, number>;
  catColors: Record<string, string>;
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

export default function ChartBar({ gastos, catColors }: Props) {
  const entries = Object.entries(gastos)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const data = {
    labels: entries.map(([k]) => truncate(k, 12)),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => (catColors[k] ?? '#888') + 'bb'),
        borderRadius: 4,
      },
    ],
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        animation: 'fadeUp 0.4s ease both',
        transition: 'transform 0.2s, border-color 0.2s',
      }}
    >
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 16,
        }}
      >
        Gastos por Categoria
      </p>
      <Bar
        data={data}
        options={{
          indexAxis: 'y',
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(ctx.parsed.x ?? 0),
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 11 },
                callback: (v) => 'R$' + (Number(v) / 1000).toFixed(1) + 'k',
              },
              grid: { color: '#252a3a' },
            },
            y: {
              ticks: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 11 },
              },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  );
}
