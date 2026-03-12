import KpiCard from './KpiCard';
import type { AggregatedData } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  data: AggregatedData;
  hideSaldo?: boolean;
  showComputedSaldo?: boolean;
}

export default function KpiGrid({ data, hideSaldo = false, showComputedSaldo = true }: Props) {
  const kpisBase = [
    {
      label: '💵 Receita',
      value: fmt.format(data.receita),
      sub: `${data.activeMonths.length} mês(es)`,
      color: 'var(--green)',
    },
    {
      label: '💸 Total Gastos',
      value: fmt.format(data.totalGastos),
      sub: `${Object.keys(data.gastos).filter((k) => data.gastos[k] > 0).length} categorias`,
      color: 'var(--red)',
    },
  ];

  const kpis: Array<any> = [...kpisBase];

  if (showComputedSaldo) {
    kpis.push({
      label: '💰 Saldo',
      value: hideSaldo ? '***' : fmt.format(data.saldo),
      sub: data.saldo >= 0 ? 'Positivo' : 'Negativo',
      color: data.saldo >= 0 ? 'var(--accent)' : 'var(--red)',
    });
  }

  kpis.push({
    label: '📈 % Poupança',
    value: data.poupanca.toFixed(1) + '%',
    sub: 'do total recebido',
    color: 'var(--purple)',
  });

  return (
    <div className="kpi-grid">
      {kpis.map((kpi, i) => (
        <KpiCard
          key={kpi.label}
          label={kpi.label}
          value={kpi.value}
          sub={kpi.sub}
          color={kpi.color}
          delay={0.05 + i * 0.05}
          badge={(kpi as any).badge}
        />
      ))}
    </div>
  );
}
