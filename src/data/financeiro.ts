export const DEFAULT_CATEGORIES = [
  'Transporte',
  'Alimentação',
  'Assinaturas',
  'Compras/Outros',
  'Nubank (fatura)',
  'PagSeguro',
  'Seguro',
  'Lazer/Games',
  'Outros gastos',
];

export const DEFAULT_CAT_COLORS: Record<string, string> = {
  Transporte: '#4f9cf9',
  Alimentação: '#f97b4f',
  Assinaturas: '#9b7ff9',
  'Compras/Outros': '#f9c74f',
  'Nubank (fatura)': '#f9604f',
  PagSeguro: '#4fbe96',
  Seguro: '#6b7394',
  'Lazer/Games': '#ff85a1',
  'Outros gastos': '#a0c4ff',
};

const PALETTE = [
  '#4f9cf9', '#f97b4f', '#9b7ff9', '#f9c74f', '#f9604f',
  '#4fbe96', '#6b7394', '#ff85a1', '#a0c4ff', '#ffd6a5',
  '#caffbf', '#bdb2ff', '#ffc6ff', '#fdffb6', '#9bf6ff',
];

export function getColorForCategory(cat: string, allColors: Record<string, string>): string {
  if (allColors[cat]) return allColors[cat];
  const usedColors = new Set(Object.values(allColors));
  const available = PALETTE.find((c) => !usedColors.has(c));
  return available ?? PALETTE[Object.keys(allColors).length % PALETTE.length];
}

export const DIVIDA = { total: 2000, pago: 1600 };
