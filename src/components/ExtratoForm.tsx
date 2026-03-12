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

  if (!open) {
    return (
      <div className="extrato-form-container">
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleImportFile}
          className="extrato-form-hidden-input"
        />
        <div className="extrato-form-collapsed">
          <button onClick={() => setOpen(true)} className="btn btn-accent-outline">
            + Adicionar Extrato
          </button>
          <button onClick={handleImportClick} className="btn btn-accent-2-outline">
            Importar CSV
          </button>
        </div>
        {importStatus && (
          <p className="extrato-form-status">
            {importStatus}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="extrato-form-expanded">
      <div className="extrato-form-header">
        <p className="extrato-form-title">Novo Extrato</p>
        <button
          onClick={() => setOpen(false)}
          className="extrato-form-close"
        >
          ✕
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={handleImportFile}
        className="extrato-form-hidden-input"
      />

      <button
        type="button"
        onClick={handleImportClick}
        className="extrato-form-import-btn"
      >
        Importar CSV Inter/Nubank
      </button>

      <form onSubmit={handleSubmit}>
        <div className="extrato-form-tipo-toggle">
          {(['receita', 'gasto'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipo(t)}
              className={`extrato-form-tipo-btn ${t} ${tipo === t ? 'active' : ''}`}
            >
              {t === 'receita' ? 'Receita' : 'Gasto'}
            </button>
          ))}
        </div>

        <div className="extrato-form-grid">
          <div className="extrato-form-field">
            <label className="label">Valor (R$)</label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="extrato-form-field">
            <label className="label">Data</label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="input"
              required
            />
          </div>
        </div>

        <div className="extrato-form-field">
          <label className="label">Descrição</label>
          <input
            type="text"
            placeholder="Ex: Uber para o trabalho"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="input"
            required
          />
        </div>

        {tipo === 'gasto' && (
          <div className="extrato-form-field">
            <div className="extrato-form-categoria-header">
              <label className="label">Categoria</label>
              <button
                type="button"
                onClick={onOpenCategories}
                className="extrato-form-manage-btn"
              >
                + Gerenciar categorias
              </button>
            </div>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="input"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="extrato-form-submit">
          Adicionar
        </button>
      </form>

      {importStatus && (
        <p className="extrato-form-status">
          {importStatus}
        </p>
      )}
    </div>
  );
}
