import { useEffect, useState } from 'react';
import type { Extrato } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatTime(criadoEm?: string) {
  if (!criadoEm) return null;
  const d = new Date(criadoEm);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  extratos: Extrato[];
  catColors: Record<string, string>;
  onRemove: (id: string) => void;
  activeCategory?: string | null;
}

export default function ExtratoList({ extratos, catColors, onRemove, activeCategory }: Props) {
  const [page, setPage] = useState(1);

  const sorted = [...extratos].sort((a, b) => {
    const tA = a.criadoEm ?? a.data;
    const tB = b.criadoEm ?? b.data;
    return tB.localeCompare(tA);
  });

  const perPage = 20;

  const filtered = activeCategory
    ? sorted.filter((e) => e.categoria === activeCategory)
    : sorted;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  useEffect(() => {
    setPage(1);
  }, [activeCategory, extratos]);

  if (extratos.length === 0) return null;

  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function weekdayFor(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    } catch {
      return '';
    }
  }

  return (
    <div>
      <h2 className="extrato-list-header">
        Extratos registrados ({extratos.length})
      </h2>
      <div className="extrato-list">
        <div className="extrato-list-grid">
          {pageItems.length === 0 && (
            <div className="text-mono text-sm text-muted">
              Nenhum registro nesta página.
            </div>
          )}
          {(() => {
            let lastDate = '';
            return pageItems.map((e) => {
              const showSeparator = e.data !== lastDate;
              lastDate = e.data;
              const hora = formatTime(e.criadoEm);
              return (
                <div key={e.id}>
                  {showSeparator && (
                    <div className="text-mono text-sm text-muted" style={{ margin: '8px 0' }}>
                      {formatDate(e.data)} · {weekdayFor(e.data)}
                    </div>
                  )}
                  <div className="extrato-item">
                    <div className="extrato-item-left">
                      <span
                        className="w-2 h-2"
                        style={{
                          borderRadius: '50%',
                          background:
                            e.tipo === 'receita'
                              ? 'var(--color-success)'
                              : catColors[e.categoria] ?? 'var(--color-text-muted)',
                          flexShrink: 0,
                        }}
                      />
                      <div className="extrato-item-info">
                        <p className="extrato-item-descricao">
                          {e.descricao}
                        </p>
                        <p className="extrato-item-details">
                          <span className="extrato-item-categoria">
                            {e.tipo === 'receita' ? 'Receita' : e.categoria}
                            {hora && (
                              <span style={{ marginLeft: 6, opacity: 0.6 }}>· {hora}</span>
                            )}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                      <span className={`extrato-item-valor ${e.tipo}`}>
                        {e.tipo === 'receita' ? '+' : '-'}{fmt.format(e.valor)}
                      </span>
                      <button
                        onClick={() => onRemove(e.id)}
                        className="extrato-item-remove"
                        title="Remover extrato"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            });
          })()}
        </div>

        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'var(--space-3)',
          }}>
          <div className="text-mono text-sm text-muted">
            Mostrando {pageItems.length} de {filtered.length} lançamentos
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn btn-sm"
              style={{
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Anterior
            </button>
            <div className="text-mono text-sm text-muted">
              {page} / {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-sm"
              style={{
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Próxima
            </button>
          </div>
        </div>
      </div>
    </div>
    
  );
}