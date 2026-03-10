import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { Extrato } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function monthKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[d.getMonth()]}/${d.getFullYear()}`;
}

interface Props {
  entries: Extrato[];
  months: string[];
}

export default function ChartOverview({ entries, months }: Props) {
  const receitaPorMes: Record<string, number> = {};
  const gastosPorMes: Record<string, number> = {};

  for (const e of entries) {
    const mk = monthKey(e.data);
    if (e.tipo === 'receita') {
      receitaPorMes[mk] = (receitaPorMes[mk] ?? 0) + e.valor;
    } else {
      gastosPorMes[mk] = (gastosPorMes[mk] ?? 0) + e.valor;
    }
  }

  const data = {
    labels: months,
    datasets: [
      {
        label: 'Receita',
        data: months.map((m) => receitaPorMes[m] ?? 0),
        backgroundColor: '#4fbe96',
        borderRadius: 4,
      },
      {
        label: 'Gastos',
        data: months.map((m) => gastosPorMes[m] ?? 0),
        backgroundColor: '#f9604f',
        borderRadius: 4,
      },
    ],
  };

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        animation: 'fadeUp 0.4s ease both',
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
        Receita vs Gastos — visão mensal
      </p>
      <Bar
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              labels: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 11 },
                boxWidth: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.parsed.y ?? 0;
                  return (
                    ctx.dataset.label +
                    ': ' +
                    new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(val)
                  );
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 11 },
              },
              grid: { color: '#252a3a' },
            },
            y: {
              ticks: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 11 },
                callback: (v) => 'R$' + (Number(v) / 1000).toFixed(1) + 'k',
              },
              grid: { color: '#252a3a' },
            },
          },
        }}
      />
    </div>
  );
}
