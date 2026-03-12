import { useState } from 'react';
import { getColorForCategory } from './data/financeiro';
import { useStore } from './hooks/useStore';
import { getAvailableMonths, getDashboardEntries, useFinanceiro } from './hooks/useFinanceiro';
import Header from './components/Header';
import KpiGrid from './components/KpiGrid';
import ChartOverview from './components/ChartOverview';
import ChartPie from './components/ChartPie';
import ChartBar from './components/ChartBar';
import Breakdown from './components/Breakdown';
import DividasSection from './components/DividasSection';
import ExtratoForm from './components/ExtratoForm';
import ExtratoList from './components/ExtratoList';
import CategoryManager from './components/CategoryManager';
import ImportReviewModal from './components/ImportReviewModal';
import type { ImportReviewItem } from './utils/csvImport';

function subtractMonths(dateString: string, amount: number) {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setMonth(date.getMonth() - amount);
  return date.toISOString().slice(0, 10);
}

export default function App() {
  const store = useStore();
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [importPreview, setImportPreview] = useState<ImportReviewItem[] | null>(null);
  const [importWarnings, setImportWarnings] = useState<string[]>([]);
  const [importStatus, setImportStatus] = useState<string | null>(null);    
  const [importSaldo, setImportSaldo] = useState<number | null>(null);
  const [editingSaldo, setEditingSaldo] = useState(false);
  const [tempSaldo, setTempSaldo] = useState('');

  const months = getAvailableMonths(store.extratos, store.dividas);
  const effectiveMonth = activeMonth && months.includes(activeMonth) ? activeMonth : (months.length > 0 ? months[months.length - 1] : '');
  const data = useFinanceiro(store.extratos, store.dividas, effectiveMonth);
  const dashboardEntries = getDashboardEntries(store.extratos, store.dividas);

  const hasData = dashboardEntries.length > 0;

  // Sync activeMonth when months change after hydration
  if (effectiveMonth !== activeMonth) {
    setActiveMonth(effectiveMonth);
  }

  if (store.loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 14 }}>
        Carregando dados...
      </div>
    );
  }

  const handleReviewImport = (items: ImportReviewItem[], warnings: string[], saldoFinal?: number | null) => {
    if (items.length === 0) {
      setImportPreview(null);
      setImportWarnings([]);
      setImportStatus(warnings[0] ?? 'Nenhum lançamento válido encontrado no CSV.');
      return;
    }

    setImportPreview(items);
    setImportWarnings(warnings);
    setImportStatus(null);
    setImportSaldo(saldoFinal ?? null);
  };

  const handleConfirmImport = (items: ImportReviewItem[]) => {
    const knownCategories = new Set(store.categories);
    const colorMap = { ...store.catColors };

    for (const item of items) {
      if (item.target === 'ignorar') {
        continue;
      }

      const category = item.categoria.trim();
      if (!category || category === 'Receita' || knownCategories.has(category)) {
        continue;
      }

      const color = getColorForCategory(category, colorMap);
      colorMap[category] = color;
      knownCategories.add(category);
      store.addCategory(category, color);
    }

    const extratoItems = items
      .filter((item) => item.target === 'extrato')
      .map((item) => ({
        valor: item.valor,
        descricao: item.descricao,
        categoria: item.categoria,
        tipo: item.tipo,
        data: item.data,
        saldoConta: (item as any).saldoConta ?? undefined,
      }));

    const extratoSummary = store.addExtratos(extratoItems);

    const existingDebtSignatures = new Set(
      store.dividas.map((divida) =>
        [
          divida.modalidade ?? 'geral',
          divida.titulo.trim().toLowerCase(),
          divida.categoria.trim().toLowerCase(),
          divida.valorInicial.toFixed(2),
          divida.parcelas,
          divida.dataInicio,
        ].join('|')
      )
    );

    const debtGroups = new Map<string, ImportReviewItem[]>();
    for (const item of items.filter((item) => item.target === 'divida-credito')) {
      const key = [item.debtTitle?.trim().toLowerCase() || item.descricao.trim().toLowerCase(), item.categoria.trim().toLowerCase(), item.parcelas ?? 1].join('|');
      const current = debtGroups.get(key) ?? [];
      current.push(item);
      debtGroups.set(key, current);
    }

    let importedDebts = 0;
    let skippedDebts = 0;

    for (const group of debtGroups.values()) {
      const latestItem = [...group].sort((left, right) => right.data.localeCompare(left.data))[0];
      const parcelas = latestItem.parcelas ?? 1;
      const parcelaAtual = latestItem.parcelaAtual ?? 1;
      const valorTotal = latestItem.valor * parcelas;
      const dataInicio = subtractMonths(latestItem.data, Math.max(parcelaAtual - 1, 0));
      const signature = [
        'credito',
        (latestItem.debtTitle ?? latestItem.descricao).trim().toLowerCase(),
        latestItem.categoria.trim().toLowerCase(),
        valorTotal.toFixed(2),
        parcelas,
        dataInicio,
      ].join('|');

      if (existingDebtSignatures.has(signature)) {
        skippedDebts += 1;
        continue;
      }

      existingDebtSignatures.add(signature);
      importedDebts += 1;

      store.addDivida({
        titulo: latestItem.debtTitle?.trim() || latestItem.descricao,
        descricao: `Importada do CSV ${latestItem.sourceBank.toUpperCase()} · ${latestItem.descricao}`,
        categoria: latestItem.categoria,
        modalidade: 'credito',
        valorInicial: valorTotal,
        parcelas,
        dataInicio,
        movimentos:
          parcelaAtual > 1
            ? [
                {
                  id: crypto.randomUUID(),
                  tipo: 'pagamento',
                  valor: latestItem.valor * (parcelaAtual - 1),
                  descricao: 'Parcelas anteriores já compensadas na importação',
                  data: latestItem.data,
                },
              ]
            : [],
      });
    }

    setImportPreview(null);
    setImportWarnings([]);
    if (importSaldo !== null && importSaldo !== undefined) {
      store.setSaldoAtual(importSaldo);
    }
    setImportStatus(
      `${extratoSummary.imported} extrato(s) importado(s), ${extratoSummary.skipped} duplicado(s), ${importedDebts} dívida(s) de crédito criada(s) e ${skippedDebts} dívida(s) duplicada(s) ignorada(s).`
    );
  };

  const handleClearAll = () => {
    const confirmed = window.confirm('Tem certeza que deseja limpar todas as informações? Esta ação não pode ser desfeita.');
    if (!confirmed) {
      return;
    }

    store.clearAllData();
    setActiveMonth(months.length > 0 ? months[months.length - 1] : '');
    setImportPreview(null);
    setImportWarnings([]);
    setImportStatus('Todas as informações foram removidas com sucesso.');
  };

  return (
    <>
      <Header months={months} activeMonth={activeMonth} onChange={setActiveMonth} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button
        onClick={handleClearAll}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid rgba(249,96,79,0.35)',
          background: 'rgba(249,96,79,0.12)',
          color: 'var(--red)',
          cursor: 'pointer',
          marginBottom: 0,
        }}
      >
        Limpar todas as informações
      </button>
        <button
          onClick={() => store.setHideSaldo(!store.hideSaldo)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            padding: '8px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: store.hideSaldo ? 'var(--surface2)' : 'transparent',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          {store.hideSaldo ? 'Mostrar Saldo' : 'Esconder Saldo'}
        </button>
      </div>

      <ExtratoForm
        categories={store.categories}
        onAdd={store.addExtrato}
        onReviewImport={handleReviewImport}
        importStatus={importStatus}
        onOpenCategories={() => setShowCategories(true)}
      />

      {hasData && (
        <>
          <div style={{ marginBottom: 12 }}>
            {store.saldoAtual != null ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>Saldo Atual</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: store.saldoAtual >= 0 ? 'var(--accent)' : 'var(--red)' }}>
                  {store.hideSaldo ? '***' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(store.saldoAtual)}
                </div>
                <button
                  onClick={() => store.setSaldoAtual(null)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                >
                  Limpar
                </button>
                <button
                  onClick={() => setEditingSaldo(true)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer' }}
                >
                  Editar
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => setEditingSaldo(true)}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                >
                  Definir Saldo Atual
                </button>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}> (valor manual)</div>
              </div>
            )}

            {editingSaldo && (
              <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={tempSaldo}
                  onChange={(e) => setTempSaldo(e.target.value)}
                  placeholder="0,00"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 14, padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', width: 160 }}
                />
                <button
                  onClick={() => {
                    const v = tempSaldo.trim() === '' ? null : Number.parseFloat(tempSaldo.replace(',', '.'));
                    store.setSaldoAtual(v === null || Number.isNaN(v) ? null : v);
                    setEditingSaldo(false);
                  }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
                >
                  Salvar
                </button>
                <button
                  onClick={() => { setEditingSaldo(false); setTempSaldo(''); }}
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <KpiGrid data={data} hideSaldo={store.hideSaldo} showComputedSaldo={true} />

          {months.length > 1 && (
            <ChartOverview entries={dashboardEntries} months={months} />
          )}

          <div className="charts-grid">
            <ChartPie gastos={data.gastos} catColors={store.catColors} />
            <ChartBar gastos={data.gastos} catColors={store.catColors} />
          </div>

          <Breakdown
            gastos={data.gastos}
            totalGastos={data.totalGastos}
            activeMonth={activeMonth}
            catColors={store.catColors}
            activeCategory={activeCategory}
            onSelectCategory={(c) => setActiveCategory(c)}
          />
        </>
      )}

      {!hasData && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
        }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>📊</p>
          <p>Nenhum dado financeiro registrado ainda.</p>
          <p style={{ fontSize: 11, marginTop: 6 }}>Adicione um extrato ou uma dívida para começar.</p>
        </div>
      )}

      <DividasSection
        categories={store.categories}
        catColors={store.catColors}
        dividas={store.dividas}
        onAddDivida={store.addDivida}
        onRemoveDivida={store.removeDivida}
        onAddMovimento={store.addMovimentoDivida}
        onRemoveMovimento={store.removeMovimentoDivida}
      />

      <ExtratoList
        extratos={store.extratos}
        catColors={store.catColors}
        onRemove={store.removeExtrato}
        activeCategory={activeCategory}
      />

      {showCategories && (
        <CategoryManager
          categories={store.categories}
          catColors={store.catColors}
          onAdd={store.addCategory}
          onRemove={store.removeCategory}
          onClose={() => setShowCategories(false)}
        />
      )}

      {importPreview && (
        <ImportReviewModal
          items={importPreview}
          categories={store.categories}
          warnings={importWarnings}
          onCancel={() => {
            setImportPreview(null);
            setImportWarnings([]);
          }}
          onConfirm={handleConfirmImport}
        />
      )}

      <style>{`
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .charts-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
}
