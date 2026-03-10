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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: 24,
          width: '100%',
          maxWidth: 440,
          maxHeight: '80vh',
          overflowY: 'auto',
          animation: 'fadeUp 0.3s ease both',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            color: 'var(--muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Gerenciar Categorias
          </p>
          <button
            onClick={onClose}
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

        {/* Add form */}
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Nova categoria"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: 42,
              height: 42,
              border: '1px solid var(--border)',
              borderRadius: 8,
              background: 'var(--surface2)',
              cursor: 'pointer',
              padding: 2,
            }}
          />
          <button
            type="submit"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              padding: '10px 16px',
              borderRadius: 8,
              border: 'none',
              background: 'var(--accent)',
              color: '#fff',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Adicionar
          </button>
        </form>

        {/* Category list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {categories.map((cat) => (
            <div
              key={cat}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--surface2)',
                borderRadius: 8,
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: catColors[cat] ?? '#888',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text)' }}>
                  {cat}
                </span>
              </div>
              <button
                onClick={() => onRemove(cat)}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid rgba(249,96,79,0.3)',
                  background: 'rgba(249,96,79,0.1)',
                  color: 'var(--red)',
                  cursor: 'pointer',
                }}
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
