import { useEffect, useState } from 'react';
import type { Extrato } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

interface Props {
  extratos: Extrato[];
  catColors: Record<string, string>;
  onRemove: (id: string) => void;
  activeCategory?: string | null;
}

export default function ExtratoList({ extratos, catColors, onRemove, activeCategory }: Props) {
  if (extratos.length === 0) return null;

  const sorted = [...extratos].sort((a, b) => b.data.localeCompare(a.data));

  const [page, setPage] = useState(1);
  const perPage = 20;

  const filtered = activeCategory
    ? sorted.filter((e) => e.categoria === activeCategory)
    : sorted;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  useEffect(() => {
    setPage(1);
  }, [activeCategory, extratos]);

  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  function weekdayFor(dateStr: string) {
    try {
      const d = new Date(dateStr + 'T00:00:00');
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    } catch (err) {
      return '';
    }
  }

  return (
    <div
      style={{
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
          marginBottom: 14,
        }}
      >
        Extratos registrados ({extratos.length})
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pageItems.length === 0 && <div style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>Nenhum registro nesta página.</div>}
        {(() => {
          let lastDate = '';
          return pageItems.map((e) => {
            const showSeparator = e.data !== lastDate;
            lastDate = e.data;
            return (
              <div key={e.id}>
                {showSeparator && (
                  <div style={{ margin: '8px 0', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
                    {formatDate(e.data)} · {weekdayFor(e.data)}
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--surface2)',
                    borderRadius: 8,
                    border: '1px solid var(--border)',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background:
                          e.tipo === 'receita'
                            ? 'var(--green)'
                            : catColors[e.categoria] ?? 'var(--muted)',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                        color: 'var(--text)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {e.descricao}
                      </p>
                      <p style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 10,
                        color: 'var(--muted)',
                        marginTop: 2,
                      }}>
                        {e.tipo === 'receita' ? 'Receita' : e.categoria}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 14,
                        color: e.tipo === 'receita' ? 'var(--green)' : 'var(--red)',
                      }}
                    >
                      {e.tipo === 'receita' ? '+' : '-'}{fmt.format(e.valor)}
                    </span>
                    <button
                      onClick={() => onRemove(e.id)}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 13,
                        background: 'none',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        padding: '2px 6px',
                        borderRadius: 4,
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(ev) => { ev.currentTarget.style.color = 'var(--red)'; }}
                      onMouseLeave={(ev) => { ev.currentTarget.style.color = 'var(--muted)'; }}
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--muted)', fontSize: 12 }}>
          Mostrando {pageItems.length} de {filtered.length} lançamentos
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Anterior
          </button>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>{page} / {totalPages}</div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface2)', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Próxima
          </button>
        </div>
      </div>
    </div>
  );
}
