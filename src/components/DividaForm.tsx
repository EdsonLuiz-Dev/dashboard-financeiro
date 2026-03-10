import { useState } from 'react';

interface Props {
  categories: string[];
  onAdd: (divida: {
    titulo: string;
    descricao: string;
    categoria: string;
    modalidade?: 'geral' | 'credito';
    valorInicial: number;
    parcelas: number;
    dataInicio: string;
  }) => void;
}

export default function DividaForm({ categories, onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [modalidade, setModalidade] = useState<'geral' | 'credito'>('geral');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(categories[0] ?? '');
  const [valorInicial, setValorInicial] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10));

  const inputStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 13,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface2)',
    color: 'var(--text)',
    outline: 'none',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: 6,
    display: 'block',
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const valor = parseFloat(valorInicial.replace(',', '.'));
    const quantidadeParcelas = parseInt(parcelas, 10);

    if (!titulo.trim() || !categoria || !valor || valor <= 0 || !quantidadeParcelas || quantidadeParcelas <= 0) {
      return;
    }

    onAdd({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      categoria,
      modalidade,
      valorInicial: valor,
      parcelas: quantidadeParcelas,
      dataInicio,
    });

    setTitulo('');
    setDescricao('');
    setCategoria(categories[0] ?? '');
    setModalidade('geral');
    setValorInicial('');
    setParcelas('1');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          padding: '12px 20px',
          borderRadius: 8,
          border: '1px dashed var(--accent2)',
          background: 'transparent',
          color: 'var(--accent2)',
          cursor: 'pointer',
          width: '100%',
          marginBottom: 16,
        }}
      >
        + Nova dívida
      </button>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        animation: 'fadeUp 0.3s ease both',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Cadastrar dívida
        </p>
        <button
          onClick={() => setOpen(false)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 16,
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {([
            { value: 'geral', label: 'Dívida geral' },
            { value: 'credito', label: 'Dívida de crédito' },
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setModalidade(item.value)}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                padding: '10px 14px',
                borderRadius: 8,
                border: modalidade === item.value ? 'none' : '1px solid var(--border)',
                background: modalidade === item.value ? 'var(--accent2)' : 'var(--surface2)',
                color: modalidade === item.value ? '#fff' : 'var(--muted)',
                cursor: 'pointer',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input value={titulo} onChange={(event) => setTitulo(event.target.value)} placeholder="Ex: Cartão Nubank" style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Parcelas</label>
            <input type="number" min="1" value={parcelas} onChange={(event) => setParcelas(event.target.value)} style={inputStyle} required />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Descrição</label>
          <input value={descricao} onChange={(event) => setDescricao(event.target.value)} placeholder="Ex: Notebook parcelado" style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Valor inicial</label>
            <input value={valorInicial} onChange={(event) => setValorInicial(event.target.value)} placeholder="0,00" inputMode="decimal" style={inputStyle} required />
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <select value={categoria} onChange={(event) => setCategoria(event.target.value)} style={inputStyle} required>
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Data inicial</label>
            <input type="date" value={dataInicio} onChange={(event) => setDataInicio(event.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} required />
          </div>
        </div>

        <button
          type="submit"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent2)',
            color: '#fff',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Salvar dívida
        </button>
      </form>
    </div>
  );
}
