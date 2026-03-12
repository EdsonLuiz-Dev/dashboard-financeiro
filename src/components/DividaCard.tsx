import { useState } from 'react';
import type { Divida, DividaMovimento } from '../types';

const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

interface Props {
  divida: Divida;
  catColors: Record<string, string>;
  onRemove: (id: string) => void;
  onAddMovimento: (dividaId: string, movimento: Omit<DividaMovimento, 'id'>) => void;
  onRemoveMovimento: (dividaId: string, movimentoId: string) => void;
}

export default function DividaCard({
  divida,
  catColors,
  onRemove,
  onAddMovimento,
  onRemoveMovimento,
}: Props) {
  const [tipo, setTipo] = useState<'pagamento' | 'acrescimo'>('pagamento');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  const totalPago = divida.movimentos
    .filter((movimento) => movimento.tipo === 'pagamento')
    .reduce((acc, movimento) => acc + movimento.valor, 0);
  const totalAcrescimos = divida.movimentos
    .filter((movimento) => movimento.tipo === 'acrescimo')
    .reduce((acc, movimento) => acc + movimento.valor, 0);
  const totalAtual = divida.valorInicial + totalAcrescimos;
  const falta = Math.max(totalAtual - totalPago, 0);
  const percentualPago = totalAtual > 0 ? Math.min((totalPago / totalAtual) * 100, 100) : 100;
  const quitada = falta <= 0;
  const parcelaMedia = divida.parcelas > 0 ? totalAtual / divida.parcelas : totalAtual;
  const parcelasLiquidadas = parcelaMedia > 0 ? Math.min(Math.floor(totalPago / parcelaMedia), divida.parcelas) : 0;
  const color = catColors[divida.categoria] ?? 'var(--color-accent-2)';
  const modalidade = divida.modalidade ?? 'geral';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valorNumerico = parseFloat(valor.replace(',', '.'));

    if (!valorNumerico || valorNumerico <= 0 || !data) {
      return;
    }

    onAddMovimento(divida.id, {
      tipo,
      valor: valorNumerico,
      descricao: descricao.trim() || (tipo === 'pagamento' ? 'Pagamento registrado' : 'Acréscimo registrado'),
      data,
    });

    setValor('');
    setDescricao('');
    setTipo('pagamento');
  };

  const sortedMovimentos = [...divida.movimentos].sort((a, b) => b.data.localeCompare(a.data));

  return (
    <div className="divida-card">
      <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 'var(--space-4)',
          flexWrap: 'wrap',
          marginBottom: 'var(--space-4)',
        }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <span
              className="w-3 h-3"
              style={{
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <p className="text-display text-xl font-bold">
                {divida.titulo}
              </p>
              <span className={`divida-card-modalidade ${modalidade}`}>
                {modalidade === 'credito' ? 'CRÉDITO' : 'GERAL'}
              </span>
            </div>
          </div>
          <p className="text-mono text-xs text-muted uppercase tracking-wider mb-2">
            {divida.categoria} · {divida.parcelas} parcelas · início em {formatDate(divida.dataInicio)}
          </p>
          {divida.descricao && (
            <p className="text-mono text-sm text-muted">
              {divida.descricao}
            </p>
          )}
        </div>

        <div className="divida-card-actions">
          {quitada ? (
            <span className="badge badge-success">
              ✅ Quitada
            </span>
          ) : (
            <span className="badge badge-danger">
              🔴 Falta {fmt.format(falta)}
            </span>
          )}
          <button onClick={() => onRemove(divida.id)} className="divida-card-remove">
            Excluir dívida
          </button>
        </div>
      </div>

      <div className="progress-bar mb-3">
        <div
          className="progress-bar-fill"
          style={{
            height: '100%',
            width: `${percentualPago}%`,
            background: 'var(--color-success)',
          }}
        />
      </div>

      <div className="divida-card-stats">
        <div className="divida-card-stat">
          <p className="divida-card-stat-label">Total atual</p>
          <p className="divida-card-stat-value">
            {fmt.format(totalAtual)}
          </p>
        </div>
        <div className="divida-card-stat">
          <p className="divida-card-stat-label">Pago</p>
          <p className="divida-card-stat-value positive">
            {fmt.format(totalPago)}
          </p>
        </div>
        <div className="divida-card-stat">
          <p className="divida-card-stat-label">Parcelas liquidadas</p>
          <p className="divida-card-stat-value">
            {parcelasLiquidadas}/{divida.parcelas}
          </p>
        </div>
        <div className="divida-card-stat">
          <p className="divida-card-stat-label">Parcela média atual</p>
          <p className="divida-card-stat-value">
            {fmt.format(parcelaMedia)}
          </p>
        </div>
      </div>

      <p className="text-mono text-sm text-muted mb-4">
        Inicial: {fmt.format(divida.valorInicial)} | Acréscimos: {fmt.format(totalAcrescimos)} | Falta: {fmt.format(falta)}
      </p>

      <form onSubmit={handleSubmit} className="divida-card-form">
        <div className="divida-card-form-grid">
          <div>
            <label className="label mb-2">Movimento</label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as 'pagamento' | 'acrescimo')}
              className="input"
            >
              <option value="pagamento">Pagamento</option>
              <option value="acrescimo">Acréscimo</option>
            </select>
          </div>
          <div>
            <label className="label mb-2">Valor</label>
            <input
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label mb-2">Descrição</label>
            <input
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: parcela 3/12"
              className="input"
            />
          </div>
          <div>
            <label className="label mb-2">Data</label>
            <input
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
              className="input"
              required
            />
          </div>
          <button
            type="submit"
            className="btn"
            style={{
              background: tipo === 'pagamento' ? 'var(--color-success)' : 'var(--color-accent-2)',
              color: 'black',
              minWidth: 120,
              width: '100%',
            }}
          >
            Registrar
          </button>
        </div>
      </form>

      <div className="divida-card-movimentos">
        <p className="text-mono text-xs text-muted uppercase tracking-wider mb-3">
          Histórico da dívida
        </p>
        {sortedMovimentos.length === 0 ? (
          <div className="text-mono text-sm text-muted">
            Nenhum movimento registrado.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sortedMovimentos.map((movimento) => (
              <div
                key={movimento.id}
                className="card-sm"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                }}
              >
                <div>
                  <p className="text-mono text-sm">
                    {movimento.descricao}
                  </p>
                  <p className="text-mono text-xs text-muted mt-1">
                    {movimento.tipo === 'pagamento' ? 'Pagamento' : 'Acréscimo'} · {formatDate(movimento.data)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 }}>
                  <span
                    className={`text-display text-lg font-bold ${
                      movimento.tipo === 'pagamento' ? 'text-success' : 'text-accent-2'
                    }`}
                  >
                    {movimento.tipo === 'pagamento' ? '-' : '+'}{fmt.format(movimento.valor)}
                  </span>
                  <button
                    onClick={() => onRemoveMovimento(divida.id, movimento.id)}
                    className="extrato-item-remove btn-sm text-muted"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
