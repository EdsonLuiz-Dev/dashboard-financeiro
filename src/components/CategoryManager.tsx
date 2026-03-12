import { useState } from 'react';
import { getColorForCategory } from '../data/financeiro';

interface Props {
  categories: string[];
  catColors: Record<string, string>;
  onAdd: (name: string, color: string) => void;
  onRemove: (name: string) => void;
  onClose: () => void;
}

export default function CategoryManager({ categories, catColors, onAdd, onRemove, onClose }: Props) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#4f9cf9');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    onAdd(trimmed, color);
    setName('');
    setColor(getColorForCategory('', catColors));
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal animated">
        <div className="modal-header">
          <p className="modal-title">Gerenciar Categorias</p>
          <button onClick={onClose} className="modal-close">✕</button>
        </div>

        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-5)' }}>
          <input
            type="text"
            placeholder="Nova categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            style={{ flex: 1 }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
          />
          <button type="submit" className="btn btn-accent">
            Adicionar
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div key={cat} className="category-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{
                    background: catColors[cat] ?? '#888',
                    flexShrink: 0,
                  }}
                />
                <span className="text-mono text-sm">
                  {cat}
                </span>
              </div>
              <button
                onClick={() => onRemove(cat)}
                className="btn btn-danger btn-sm"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
