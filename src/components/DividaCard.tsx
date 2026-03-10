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
  const color = catColors[divida.categoria] ?? 'var(--accent2)';
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
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        animation: 'fadeUp 0.4s ease both',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: color,
                flexShrink: 0,
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--text)',
                }}
              >
                {divida.titulo}
              </p>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  padding: '4px 8px',
                  borderRadius: 999,
                  background: modalidade === 'credito' ? 'rgba(249,123,79,0.12)' : 'rgba(79,156,249,0.12)',
                  color: modalidade === 'credito' ? 'var(--accent2)' : 'var(--accent)',
                  border: modalidade === 'credito' ? '1px solid rgba(249,123,79,0.25)' : '1px solid rgba(79,156,249,0.25)',
                }}
              >
                {modalidade === 'credito' ? 'CRÉDITO' : 'GERAL'}
              </span>
            </div>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            {divida.categoria} · {divida.parcelas} parcelas · início em {formatDate(divida.dataInicio)}
          </p>
          {divida.descricao && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                color: 'var(--muted)',
              }}
            >
              {divida.descricao}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {quitada ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'rgba(79,190,150,0.15)',
                color: 'var(--green)',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid rgba(79,190,150,0.3)',
              }}
            >
              ✅ Quitada
            </span>
          ) : (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                background: 'rgba(249,96,79,0.15)',
                color: 'var(--red)',
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid rgba(249,96,79,0.3)',
              }}
            >
              🔴 Falta {fmt.format(falta)}
            </span>
          )}
          <button
            onClick={() => onRemove(divida.id)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid rgba(249,96,79,0.3)',
              background: 'rgba(249,96,79,0.1)',
              color: 'var(--red)',
              cursor: 'pointer',
            }}
          >
            Excluir dívida
          </button>
        </div>
      </div>

      <div
        style={{
          height: 8,
          background: 'var(--border)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${percentualPago}%`,
            background: 'linear-gradient(90deg, var(--green), #7fffd4)',
            borderRadius: 4,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Total atual
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            {fmt.format(totalAtual)}
          </p>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Pago
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--green)' }}>
            {fmt.format(totalPago)}
          </p>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Parcelas liquidadas
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            {parcelasLiquidadas}/{divida.parcelas}
          </p>
        </div>
        <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 12, border: '1px solid var(--border)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Parcela média atual
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
            {fmt.format(parcelaMedia)}
          </p>
        </div>
      </div>

      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--muted)',
          marginBottom: 16,
        }}
      >
        Inicial: {fmt.format(divida.valorInicial)} | Acréscimos: {fmt.format(totalAcrescimos)} | Falta: {fmt.format(falta)}
      </p>

      <form onSubmit={handleSubmit} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, alignItems: 'end' }}>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Movimento
            </label>
            <select
              value={tipo}
              onChange={(event) => setTipo(event.target.value as 'pagamento' | 'acrescimo')}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', width: '100%' }}
            >
              <option value="pagamento">Pagamento</option>
              <option value="acrescimo">Acréscimo</option>
            </select>
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Valor
            </label>
            <input
              value={valor}
              onChange={(event) => setValor(event.target.value)}
              placeholder="0,00"
              inputMode="decimal"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', width: '100%' }}
              required
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Descrição
            </label>
            <input
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex: parcela 3/12"
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, display: 'block' }}>
              Data
            </label>
            <input
              type="date"
              value={data}
              onChange={(event) => setData(event.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)', width: '100%', colorScheme: 'dark' }}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              fontWeight: 600,
              padding: '11px 14px',
              borderRadius: 8,
              border: 'none',
              background: tipo === 'pagamento' ? 'var(--green)' : 'var(--accent2)',
              color: '#fff',
              cursor: 'pointer',
              minWidth: 120,
              width: '100%',
            }}
          >
            Registrar
          </button>
        </div>
      </form>

      <div>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 10,
          }}
        >
          Histórico da dívida
        </p>
        {sortedMovimentos.length === 0 ? (
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)' }}>
            Nenhum movimento registrado.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sortedMovimentos.map((movimento) => (
              <div
                key={movimento.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--surface2)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
                    {movimento.descricao}
                  </p>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
                    {movimento.tipo === 'pagamento' ? 'Pagamento' : 'Acréscimo'} · {formatDate(movimento.data)}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: movimento.tipo === 'pagamento' ? 'var(--green)' : 'var(--accent2)',
                    }}
                  >
                    {movimento.tipo === 'pagamento' ? '-' : '+'}{fmt.format(movimento.valor)}
                  </span>
                  <button
                    onClick={() => onRemoveMovimento(divida.id, movimento.id)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 12,
                      background: 'none',
                      border: 'none',
                      color: 'var(--muted)',
                      cursor: 'pointer',
                    }}
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
