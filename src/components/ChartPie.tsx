import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  gastos: Record<string, number>;
  catColors: Record<string, string>;
}

export default function ChartPie({ gastos, catColors }: Props) {
  const entries = Object.entries(gastos)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const data = {
    labels: entries.map(([k]) => k),
    datasets: [
      {
        data: entries.map(([, v]) => v),
        backgroundColor: entries.map(([k]) => (catColors[k] ?? '#888') + 'cc'),
        borderColor: entries.map(([k]) => catColors[k] ?? '#888'),
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <p className="chart-title">
        Distribuição de Gastos
      </p>
      <Doughnut
        data={data}
        options={{
          cutout: '60%',
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#6b7394',
                font: { family: "'DM Mono', monospace", size: 10 },
                boxWidth: 10,
                padding: 10,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.parsed;
                  return (
                    ctx.label +
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
        }}
      />
    </div>
  );
}
