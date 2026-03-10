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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        zIndex: 120,
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        style={{
          width: 'min(1120px, 100%)',
          maxHeight: '88vh',
          overflow: 'auto',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          animation: 'fadeUp 0.3s ease both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
              Revisar importação CSV
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>
              Pré-visualização dos lançamentos
            </p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Revise categorias e escolha se cada linha entra como extrato, dívida de crédito ou será ignorada.
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 16, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {warnings.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, background: 'rgba(249,199,79,0.08)', border: '1px solid rgba(249,199,79,0.25)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--yellow)' }}>
              {warnings.length} linha(s) foram ignoradas durante a leitura do CSV.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
              Página {page} / {Math.max(1, Math.ceil(draftItems.length / perPage))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(draftItems.length / perPage)), p + 1))}
                disabled={page >= Math.max(1, Math.ceil(draftItems.length / perPage))}
                style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: page >= Math.max(1, Math.ceil(draftItems.length / perPage)) ? 'not-allowed' : 'pointer' }}
              >
                Próxima →
              </button>
            </div>
          </div>

          {/* Top confirm duplicate */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
            <button
              onClick={() => onConfirm(draftItems)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '8px 12px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
            >
              Confirmar importação
            </button>
          </div>

          {draftItems.slice((page - 1) * perPage, page * perPage).map((item) => {
            const canBeDebt = item.tipo === 'gasto' && Boolean(item.parcelas && item.parcelas > 1);
            return (
              <div
                key={item.id}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  background: 'var(--surface2)',
                  padding: 14,
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.8fr 0.9fr 1fr 1fr', gap: 12, alignItems: 'start' }}>
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Lançamento
                    </p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>{item.descricao}</p>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>
                      {item.sourceBank.toUpperCase()} · {item.data}
                    </p>
                  </div>

                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                      Valor
                    </p>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: item.tipo === 'receita' ? 'var(--green)' : 'var(--red)' }}>
                      {item.tipo === 'receita' ? '+' : '-'}{fmt.format(item.valor)}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
                      Destino
                    </label>
                    <select
                      value={item.target}
                      onChange={(event) => updateItem(item.id, { target: event.target.value as ImportReviewItem['target'] })}
                      style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%' }}
                    >
                      <option value="extrato">Extrato</option>
                      {canBeDebt && <option value="divida-credito">Dívida crédito</option>}
                      <option value="ignorar">Ignorar</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
                      Categoria
                    </label>
                    <>
                      <input
                        list={`cats-${item.id}`}
                        value={item.categoria}
                        onChange={(event) => updateItem(item.id, { categoria: event.target.value })}
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%' }}
                      />
                      <datalist id={`cats-${item.id}`}>
                        {categories.map((category) => (
                          <option key={category} value={category} />
                        ))}
                      </datalist>
                    </>
                  </div>

                  <div>
                    {item.target === 'divida-credito' ? (
                      <>
                        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
                          Dívida crédito
                        </label>
                        <input
                          value={item.debtTitle ?? ''}
                          onChange={(event) => updateItem(item.id, { debtTitle: event.target.value })}
                          placeholder="Título da dívida"
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%', marginBottom: 8 }}
                        />
                        <input
                          type="number"
                          min="1"
                          value={item.parcelas ?? 1}
                          onChange={(event) => updateItem(item.id, { parcelas: Number.parseInt(event.target.value, 10) || 1 })}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', width: '100%' }}
                        />
                      </>
                    ) : (
                      <div style={{ paddingTop: 24, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)' }}>
                        {item.parcelas ? `Parcela ${item.parcelaAtual}/${item.parcelas}` : item.tipo === 'receita' ? 'Receita' : 'Gasto'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
            {draftItems.filter((item) => item.target !== 'ignorar').length} item(ns) selecionado(s) para importação.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onCancel}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--muted)', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              onClick={() => onConfirm(draftItems)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 14px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer' }}
            >
              Confirmar importação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
