import { useMemo } from 'react';
import type { AggregatedData, Divida, Extrato } from '../types';

function monthKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[d.getMonth()]}/${d.getFullYear()}`;
}

export function getDashboardEntries(extratos: Extrato[], dividas: Divida[]): Extrato[] {
  const debtEntries = dividas.flatMap((divida) => {
    const abertura: Extrato = {
      id: `divida-${divida.id}-abertura`,
      valor: divida.valorInicial,
      descricao: `Dívida aberta: ${divida.titulo}`,
      categoria: divida.categoria,
      tipo: 'gasto',
      data: divida.dataInicio,
    };

    const movimentos = divida.movimentos.map<Extrato>((movimento) => ({
      id: `divida-${divida.id}-${movimento.id}`,
      valor: movimento.valor,
      descricao: `${movimento.tipo === 'pagamento' ? 'Pagamento' : 'Acréscimo'} dívida: ${divida.titulo}`,
      categoria: divida.categoria,
      tipo: 'gasto',
      data: movimento.data,
    }));

    return [abertura, ...movimentos];
  });

  return [...extratos, ...debtEntries];
}

export function getAvailableMonths(extratos: Extrato[], dividas: Divida[]): string[] {
  const entries = getDashboardEntries(extratos, dividas);
  const set = new Set<string>();
  for (const e of entries) {
    set.add(monthKey(e.data));
  }
  return Array.from(set).sort((a, b) => {
    const parse = (s: string) => {
      const [m, y] = s.split('/');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return Number(y) * 12 + months.indexOf(m);
    };
    return parse(a) - parse(b);
  });
}

export function useFinanceiro(
  extratos: Extrato[],
  dividas: Divida[],
  activeMonth: string
): AggregatedData {
  return useMemo(() => {
    const entries = getDashboardEntries(extratos, dividas);
    const filtered = entries.filter((e) => monthKey(e.data) === activeMonth);

    let receita = 0;
    const gastos: Record<string, number> = {};
    let totalGastos = 0;

    for (const e of filtered) {
      // ignore debt "abertura" entries (they represent the debt open amount, not an actual spend)
      if (e.id && String(e.id).includes('-abertura')) continue;

      if (e.tipo === 'receita') {
        receita += e.valor;
      } else {
        gastos[e.categoria] = (gastos[e.categoria] ?? 0) + e.valor;
        totalGastos += e.valor;
      }
    }

    const computedSaldo = receita - totalGastos;

    // try to use final reported saldo from extratos within the filtered period
    const entriesWithSaldo = filtered.filter((e) => (e as any).saldoConta !== undefined && (e as any).saldoConta !== null);
    let finalSaldoFromEntries: number | null = null;
    if (entriesWithSaldo.length > 0) {
      const latest = entriesWithSaldo.reduce((a, b) => (a.data >= b.data ? a : b));
      finalSaldoFromEntries = (latest as any).saldoConta as number;
    }

    // Use the month-end reported saldo from imported entries when available, otherwise use computed
    const saldo = finalSaldoFromEntries !== null ? finalSaldoFromEntries : computedSaldo;
    const poupanca = receita > 0 ? (saldo / receita) * 100 : 0;

    const activeMonths = [activeMonth];

    return {
      receita,
      gastos,
      totalGastos,
      saldo,
      poupanca,
      activeMonths,
    };
  }, [extratos, dividas, activeMonth]); // saldoAtual is shown separately in the UI and does not affect the computed saldo
}
