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
      <div className="flex justify-center items-center" style={{ height: '100vh' }}>
        <span className="text-muted font-mono text-lg">Carregando dados...</span>
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

      <div className="app-controls">
        <button
        onClick={handleClearAll}
        className="btn btn-danger btn-sm"
      >
        Limpar todas as informações
      </button>
        <button
          onClick={() => store.setHideSaldo(!store.hideSaldo)}
          className={`btn btn-sm ${store.hideSaldo ? 'btn-primary' : ''}`}
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
          <div className="app-saldo-section">
            {store.saldoAtual != null ? (
              <div className="app-saldo-display">
                <div className="text-muted font-mono text-base">Saldo Atual</div>
                <div className={`app-saldo-value ${store.saldoAtual >= 0 ? 'positive' : 'negative'}`}>
                  {store.hideSaldo ? '***' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(store.saldoAtual)}
                </div>
                <button
                  onClick={() => store.setSaldoAtual(null)}
                  className="btn btn-sm"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setEditingSaldo(true)}
                  className="btn btn-sm"
                >
                  Editar
                </button>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setEditingSaldo(true)}
                  className="btn"
                >
                  Definir Saldo Atual
                </button>
                <div className="text-muted font-mono text-base"> (valor manual)</div>
              </div>
            )}

            {editingSaldo && (
              <div className="app-saldo-form">
                <input
                  value={tempSaldo}
                  onChange={(e) => setTempSaldo(e.target.value)}
                  placeholder="0,00"
                  className="app-saldo-input"
                />
                <button
                  onClick={() => {
                    const v = tempSaldo.trim() === '' ? null : Number.parseFloat(tempSaldo.replace(',', '.'));
                    store.setSaldoAtual(v === null || Number.isNaN(v) ? null : v);
                    setEditingSaldo(false);
                  }}
                  className="btn btn-primary"
                >
                  Salvar
                </button>
                <button
                  onClick={() => { setEditingSaldo(false); setTempSaldo(''); }}
                  className="btn"
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
        <div className="app-no-data">
          <p className="app-no-data-icon">📊</p>
          <p>Nenhum dado financeiro registrado ainda.</p>
          <p className="app-no-data-subtitle">Adicione um extrato ou uma dívida para começar.</p>
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
