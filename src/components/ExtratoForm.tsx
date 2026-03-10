import { useRef, useState } from 'react';
import { parseExtratosCsv, type ImportReviewItem } from '../utils/csvImport';

interface Props {
  categories: string[];
  onAdd: (extrato: {
    valor: number;
    descricao: string;
    categoria: string;
    tipo: 'receita' | 'gasto';
    data: string;
  }) => void;
  onReviewImport: (items: ImportReviewItem[], warnings: string[], saldoFinal?: number | null) => void;
  importStatus?: string | null;
  onOpenCategories: () => void;
}

export default function ExtratoForm({ categories, onAdd, onReviewImport, importStatus, onOpenCategories }: Props) {
  const [tipo, setTipo] = useState<'receita' | 'gasto'>('gasto');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(categories[0] ?? '');
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || v <= 0 || !descricao.trim() || !data) return;

    onAdd({
      valor: v,
      descricao: descricao.trim(),
      categoria: tipo === 'receita' ? 'Receita' : categoria,
      tipo,
      data,
    });

    setValor('');
    setDescricao('');
    setCategoria(categories[0] ?? '');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const result = parseExtratosCsv(content);
      onReviewImport(result.items, result.warnings, result.saldoFinal ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Falha ao importar o CSV.';
      onReviewImport([], [message], null);
    } finally {
      event.target.value = '';
    }
  };

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
    transition: 'border-color 0.2s',
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

  if (!open) {
    return (
      <div style={{ marginBottom: 24 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            onClick={() => setOpen(true)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '12px 20px',
              borderRadius: 8,
              border: '1px dashed var(--accent)',
              background: 'transparent',
              color: 'var(--accent)',
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s',
            }}
          >
            + Adicionar Extrato
          </button>
          <button
            onClick={handleImportClick}
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
              transition: 'all 0.2s',
            }}
          >
            Importar CSV
          </button>
        </div>
        {importStatus && (
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              color: 'var(--muted)',
              marginTop: 10,
            }}
          >
            {importStatus}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
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
          Novo Extrato
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
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImportFile}
        style={{ display: 'none' }}
      />

      <button
        type="button"
        onClick={handleImportClick}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          color: 'var(--accent2)',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        Importar CSV Inter/Nubank
      </button>

      <form onSubmit={handleSubmit}>
        {/* Tipo toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['receita', 'gasto'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              style={{
                flex: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
                padding: '10px 14px',
                borderRadius: 8,
                border: tipo === t ? 'none' : '1px solid var(--border)',
                background: tipo === t
                  ? t === 'receita' ? 'var(--green)' : 'var(--red)'
                  : 'var(--surface2)',
                color: tipo === t ? '#fff' : 'var(--muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: tipo === t ? 600 : 400,
              }}
            >
              {t === 'receita' ? '💵 Receita' : '💸 Gasto'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Valor (R$)</label>
            <input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={labelStyle}>Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={{ ...inputStyle, colorScheme: 'dark' }}
              required
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Descrição</label>
          <input
            type="text"
            placeholder="Ex: Uber para o trabalho"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        {tipo === 'gasto' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Categoria</label>
              <button
                type="button"
                onClick={onOpenCategories}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  color: 'var(--accent)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                + Gerenciar categorias
              </button>
            </div>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 13,
            fontWeight: 600,
            padding: '12px 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
        >
          Adicionar
        </button>
      </form>

      {importStatus && (
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--muted)',
            marginTop: 12,
          }}
        >
          {importStatus}
        </p>
      )}
    </div>
  );
}
