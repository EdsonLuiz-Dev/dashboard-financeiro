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
      <button onClick={() => setOpen(true)} className="btn btn-accent-2-outline w-full mb-4">
        + Nova dívida
      </button>
    );
  }

  return (
    <div className="card mb-4 animated">
      <div className="flex justify-between items-center mb-4">
        <p className="text-mono text-xs text-muted uppercase tracking-wider">
          Cadastrar dívida
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-mono text-lg text-muted cursor-pointer bg-none border-none"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          {([
            { value: 'geral', label: 'Dívida geral' },
            { value: 'credito', label: 'Dívida de crédito' },
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setModalidade(item.value)}
              className={`btn ${modalidade === item.value ? 'btn-accent-2' : 'btn-outline'} flex-1`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="grid grid-2 gap-3 mb-3">
          <div>
            <label className="label">Título</label>
            <input 
              value={titulo} 
              onChange={(event) => setTitulo(event.target.value)} 
              placeholder="Ex: Cartão Nubank" 
              className="input" 
              required 
            />
          </div>
          <div>
            <label className="label">Parcelas</label>
            <input 
              type="number" 
              min="1" 
              value={parcelas} 
              onChange={(event) => setParcelas(event.target.value)} 
              className="input" 
              required 
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="label">Descrição</label>
          <input 
            value={descricao} 
            onChange={(event) => setDescricao(event.target.value)} 
            placeholder="Ex: Notebook parcelado" 
            className="input"
          />
        </div>

        <div className="grid grid-3 gap-3 mb-4">
          <div>
            <label className="label">Valor inicial</label>
            <input 
              value={valorInicial} 
              onChange={(event) => setValorInicial(event.target.value)} 
              placeholder="0,00" 
              inputMode="decimal" 
              className="input" 
              required 
            />
          </div>
          <div>
            <label className="label">Categoria</label>
            <select 
              value={categoria} 
              onChange={(event) => setCategoria(event.target.value)} 
              className="input" 
              required
            >
              {categories.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Data inicial</label>
            <input 
              type="date" 
              value={dataInicio} 
              onChange={(event) => setDataInicio(event.target.value)} 
              className="input" 
              required 
            />
          </div>
        </div>

        <button type="submit" className="btn btn-accent-2 w-full">
          Salvar dívida
        </button>
      </form>
    </div>
  );
}
