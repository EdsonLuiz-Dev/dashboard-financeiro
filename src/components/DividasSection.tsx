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
    <section className="dividas-section">
      <h2 className="dividas-section-header">
        Controle de dívidas
      </h2>

      <DividaForm categories={categories} onAdd={onAddDivida} />

      {dividas.length === 0 ? (
        <div className="card text-mono text-sm text-muted">
          Nenhuma dívida registrada.
        </div>
      ) : (
        <div className="grid gap-4">
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
