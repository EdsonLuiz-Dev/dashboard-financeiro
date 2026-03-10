export interface Extrato {
  id: string;
  valor: number;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'gasto';
  data: string; // YYYY-MM-DD
  saldoConta?: number; // saldo informado no extrato (opcional)
}

export interface DividaMovimento {
  id: string;
  tipo: 'pagamento' | 'acrescimo';
  valor: number;
  descricao: string;
  data: string; // YYYY-MM-DD
}

export interface Divida {
  id: string;
  titulo: string;
  descricao: string;
  categoria: string;
  modalidade?: 'geral' | 'credito';
  valorInicial: number;
  parcelas: number;
  dataInicio: string; // YYYY-MM-DD
  movimentos: DividaMovimento[];
}

export interface AggregatedData {
  receita: number;
  gastos: Record<string, number>;
  totalGastos: number;
  saldo: number;
  poupanca: number;
  activeMonths: string[];
}
