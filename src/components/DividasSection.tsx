import DividaCard from './DividaCard';
import DividaForm from './DividaForm';
import type { Divida, DividaMovimento } from '../types';

interface Props {
  categories: string[];
  catColors: Record<string, string>;
  dividas: Divida[];
  onAddDivida: (divida: {
    titulo: string;
    descricao: string;
    categoria: string;
    modalidade?: 'geral' | 'credito';
    valorInicial: number;
    parcelas: number;
    dataInicio: string;
  }) => void;
  onRemoveDivida: (id: string) => void;
  onAddMovimento: (dividaId: string, movimento: Omit<DividaMovimento, 'id'>) => void;
  onRemoveMovimento: (dividaId: string, movimentoId: string) => void;
}

export default function DividasSection({
  categories,
  catColors,
  dividas,
  onAddDivida,
  onRemoveDivida,
  onAddMovimento,
  onRemoveMovimento,
}: Props) {
  return (
    <section style={{ marginBottom: 24 }}>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: 12,
        }}
      >
        Controle de dívidas
      </p>

      <DividaForm categories={categories} onAdd={onAddDivida} />

      {dividas.length === 0 ? (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 20,
            color: 'var(--muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
          }}
        >
          Nenhuma dívida registrada.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {dividas.map((divida) => (
            <DividaCard
              key={divida.id}
              divida={divida}
              catColors={catColors}
              onRemove={onRemoveDivida}
              onAddMovimento={onAddMovimento}
              onRemoveMovimento={onRemoveMovimento}
            />
          ))}
        </div>
      )}
    </section>
  );
}
