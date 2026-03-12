import { useEffect, useState } from 'react';
import type { ImportReviewItem } from '../utils/csvImport';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

interface Props {
  items: ImportReviewItem[];
  categories: string[];
  warnings: string[];
  onCancel: () => void;
  onConfirm: (items: ImportReviewItem[]) => void;
}

export default function ImportReviewModal({ items, categories, warnings, onCancel, onConfirm }: Props) {
  const [draftItems, setDraftItems] = useState<ImportReviewItem[]>(items);
  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    setDraftItems(items);
    setPage(1);
  }, [items]);

  const updateItem = (id: string, patch: Partial<ImportReviewItem>) => {
    setDraftItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  return (
    <div
      className="modal-overlay"
      style={{ zIndex: 120 }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="modal modal-wide animated"
        style={{
          width: 'min(1120px, 100%)',
          maxHeight: '88vh',
          overflow: 'auto',
          padding: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div>
            <p className="modal-subtitle">Revisar importação CSV</p>
            <p className="text-display text-2xl font-bold mb-2">
              Pré-visualização dos lançamentos
            </p>
            <p className="text-mono text-sm text-muted">
              Revise categorias e escolha se cada linha entra como extrato, dívida de crédito ou será ignorada.
            </p>
          </div>
          <button onClick={onCancel} className="modal-close">✕</button>
        </div>

        {warnings.length > 0 && (
          <div className="warning-box mb-4">
            <p className="text-mono text-sm text-warning">
              {warnings.length} linha(s) foram ignoradas durante a leitura do CSV.
            </p>
          </div>
        )}

        <div className="grid gap-3">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <div className="text-mono text-sm text-muted">
              Página {page} / {Math.max(1, Math.ceil(draftItems.length / perPage))}
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn btn-sm"
                style={{ cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(draftItems.length / perPage)), p + 1))}
                disabled={page >= Math.max(1, Math.ceil(draftItems.length / perPage))}
                className="btn btn-sm"
                style={{ cursor: page >= Math.max(1, Math.ceil(draftItems.length / perPage)) ? 'not-allowed' : 'pointer' }}
              >
                Próxima →
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-2)' }}>
            <button onClick={() => onConfirm(draftItems)} className="btn btn-accent">
              Confirmar importação
            </button>
          </div>

          {draftItems.slice((page - 1) * perPage, page * perPage).map((item) => {
            const canBeDebt = item.tipo === 'gasto' && Boolean(item.parcelas && item.parcelas > 1);
            return (
              <div key={item.id} className="card-secondary">
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.9fr 1fr 1fr', gap: 'var(--space-3)', alignItems: 'start' }}>
                  <div>
                    <p className="label mb-2">Lançamento</p>
                    <p className="text-mono text-sm">{item.descricao}</p>
                    <p className="text-mono text-xs text-muted mt-1">
                      {item.sourceBank.toUpperCase()} · {item.data}
                    </p>
                  </div>

                  <div>
                    <p className="label mb-2">Valor</p>
                    <p className={`text-display text-lg font-bold ${item.tipo === 'receita' ? 'text-success' : 'text-danger'}`}>
                      {item.tipo === 'receita' ? '+' : '-'}{fmt.format(item.valor)}
                    </p>
                  </div>

                  <div>
                    <label className="label">Destino</label>
                    <select
                      value={item.target}
                      onChange={(event) => updateItem(item.id, { target: event.target.value as ImportReviewItem['target'] })}
                      className="input"
                    >
                      <option value="extrato">Extrato</option>
                      {canBeDebt && <option value="divida-credito">Dívida crédito</option>}
                      <option value="ignorar">Ignorar</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Categoria</label>
                    <input
                      list={`cats-${item.id}`}
                      value={item.categoria}
                      onChange={(event) => updateItem(item.id, { categoria: event.target.value })}
                      className="input"
                    />
                    <datalist id={`cats-${item.id}`}>
                      {categories.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    {item.target === 'divida-credito' ? (
                      <>
                        <label className="label">Dívida crédito</label>
                        <input
                          value={item.debtTitle ?? ''}
                          onChange={(event) => updateItem(item.id, { debtTitle: event.target.value })}
                          placeholder="Título da dívida"
                          className="input mb-2"
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.parcelas ?? 1}
                          onChange={(event) => updateItem(item.id, { parcelas: Number.parseInt(event.target.value, 10) || 1 })}
                          className="input"
                        />
                      </>
                    ) : (
                      <div style={{ paddingTop: 'var(--space-6)' }} className="text-mono text-xs text-muted">
                        {item.parcelas ? `Parcela ${item.parcelaAtual}/${item.parcelas}` : item.tipo === 'receita' ? 'Receita' : 'Gasto'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
          <p className="text-mono text-sm text-muted">
            {draftItems.filter((item) => item.target !== 'ignorar').length} item(ns) selecionado(s) para importação.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button onClick={onCancel} className="btn btn-outline">
              Cancelar
            </button>
            <button onClick={() => onConfirm(draftItems)} className="btn btn-accent">
              Confirmar importação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
