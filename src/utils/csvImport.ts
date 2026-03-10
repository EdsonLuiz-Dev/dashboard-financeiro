export interface ImportReviewItem {
  id: string;
  sourceBank: 'inter' | 'nubank';
  valor: number;
  descricao: string;
  categoria: string;
  tipo: 'receita' | 'gasto';
  data: string;
  target: 'extrato' | 'divida-credito' | 'ignorar';
  debtTitle?: string;
  parcelas?: number;
  parcelaAtual?: number;
  saldoConta?: number;
}

export interface ImportParseResult {
  bank: 'inter' | 'nubank';
  items: ImportReviewItem[];
  warnings: string[];
  saldoFinal?: number;
}

function parseCsvLine(line: string, delimiter = ','): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === delimiter && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
}

function normalizeDate(raw: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return raw;
  }

  const [day, month, year] = raw.split('/');
  return `${year}-${month}-${day}`;
}

function parseInterAmount(raw: string): number {
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  return Number.parseFloat(normalized);
}

function inferCategory(description: string): string {
  const normalized = description.toLowerCase();

  if (normalized.includes('uber') || normalized.includes('99* pop') || normalized.includes('transporte')) {
    return 'Transporte';
  }

  if (
    normalized.includes('ifood') ||
    normalized.includes('padaria') ||
    normalized.includes('damiaodoces') ||
    normalized.includes('cheiroverde') ||
    normalized.includes('aliment')
  ) {
    return 'Alimentação';
  }

  if (
    normalized.includes('netflix') ||
    normalized.includes('spotify') ||
    normalized.includes('youtube') ||
    normalized.includes('prime') ||
    normalized.includes('assinatura')
  ) {
    return 'Assinaturas';
  }

  if (normalized.includes('pagseguro')) {
    return 'PagSeguro';
  }

  if (normalized.includes('seguro') || normalized.includes('cartão protegido')) {
    return 'Seguro';
  }

  if (
    normalized.includes('game') ||
    normalized.includes('games') ||
    normalized.includes('deckmaster') ||
    normalized.includes('steam')
  ) {
    return 'Lazer/Games';
  }

  if (
    normalized.includes('mercadolivre') ||
    normalized.includes('mercado livre') ||
    normalized.includes('compra') ||
    normalized.includes('presente')
  ) {
    return 'Compras/Outros';
  }

  if (normalized.includes('nubank') || normalized.includes('nu pagamentos')) {
    return 'Nubank (fatura)';
  }

  return 'Outros gastos';
}

function parseInstallmentInfo(description: string) {
  const match = description.match(/(.+?)\s*-\s*parcela\s*(\d+)\/(\d+)$/i);
  if (!match) {
    return null;
  }

  return {
    title: match[1].trim(),
    atual: Number.parseInt(match[2], 10),
    total: Number.parseInt(match[3], 10),
  };
}

function parseInterCsv(content: string): ImportParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headerIndex = lines.findIndex((line) => line.startsWith('Data Lançamento,') || line.startsWith('Data Lançamento;'));
  const warnings: string[] = [];
  let saldoFinal: number | undefined = undefined;

  if (headerIndex === -1) {
    throw new Error('Cabecalho do CSV Inter nao encontrado.');
  }
  // detect delimiter from header (comma or semicolon)
  const headerLine = lines[headerIndex];
  const delimiter = headerLine.includes(';') ? ';' : ',';

  // try to parse saldo from lines above header (e.g., 'Saldo ;696,10')
  for (let i = 0; i < headerIndex; i++) {
    const l = lines[i].trim();
    const m = l.match(/^Saldo\s*[;:]?\s*(.+)$/i);
    if (m) {
      try {
        const cleaned = m[1].replace(/[^0-9,\-\.]/g, '').replace(/\s/g, '');
        saldoFinal = parseInterAmount(cleaned);
      } catch {
        // ignore parse errors
      }
      break;
    }
  }

  const headerFields = parseCsvLine(headerLine, delimiter).map((h) => h.toLowerCase());
  const idxDate = headerFields.findIndex((h) => h.includes('data')) >= 0 ? headerFields.findIndex((h) => h.includes('data')) : 0;
  const idxValor = headerFields.findIndex((h) => h.includes('valor')) >= 0 ? headerFields.findIndex((h) => h.includes('valor')) : headerFields.length - 1;
  const idxSaldo = headerFields.findIndex((h) => h.includes('saldo')) >= 0 ? headerFields.findIndex((h) => h.includes('saldo')) : -1;
  const idxDescricao = headerFields.findIndex((h) => h.includes('descri')) >= 0 ? headerFields.findIndex((h) => h.includes('descri')) : 1;

  const items = lines.slice(headerIndex + 1).flatMap((line, index) => {
    const row = parseCsvLine(line, delimiter);
    if (row.length <= idxValor) {
      warnings.push(`Linha Inter ignorada ${index + headerIndex + 2}: estrutura invalida.`);
      return [];
    }

    const date = row[idxDate];
    const descricao = row[idxDescricao] ?? '';
    const amountRaw = row[idxValor] ?? '0';
    const saldoRaw = idxSaldo >= 0 && row.length > idxSaldo ? row[idxSaldo] : '';

    const amount = parseInterAmount(amountRaw);
    const saldo = saldoRaw ? parseInterAmount(saldoRaw) : undefined;

    if (!date || Number.isNaN(amount)) {
      warnings.push(`Linha Inter ignorada ${index + headerIndex + 2}: data ou valor invalido.`);
      return [];
    }

    const fullDescription = descricao;
    const tipo: 'gasto' | 'receita' = amount < 0 ? 'gasto' : 'receita';

    return [
      {
        id: crypto.randomUUID(),
        sourceBank: 'inter' as const,
        valor: Math.abs(amount),
        descricao: fullDescription,
        categoria: tipo === 'gasto' ? inferCategory(fullDescription) : 'Receita',
        tipo,
        data: normalizeDate(date),
        target: 'extrato' as const,
        saldoConta: saldo,
      },
    ];
  });

  return { bank: 'inter', items, warnings, saldoFinal };
}

function parseNubankCsv(content: string): ImportParseResult {
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const warnings: string[] = [];

  if (lines.length === 0 || !lines[0].startsWith('date,title,amount')) {
    throw new Error('Cabecalho do CSV Nubank nao encontrado.');
  }

  const items = lines.slice(1).flatMap((line, index) => {
    const row = parseCsvLine(line);
    if (row.length < 3) {
      warnings.push(`Linha Nubank ignorada ${index + 2}: estrutura invalida.`);
      return [];
    }

    const date = row[0];
    const title = row[1] ?? '';
    const amount = Number.parseFloat(row[2] ?? '0');

    if (!date || !title || Number.isNaN(amount)) {
      warnings.push(`Linha Nubank ignorada ${index + 2}: data, titulo ou valor invalido.`);
      return [];
    }

    const normalized = title.toLowerCase();
    const isCardPayment = normalized.includes('pagamento recebido');
    const installment = parseInstallmentInfo(title);

    const tipo: 'gasto' | 'receita' = amount > 0 || isCardPayment ? 'gasto' : 'receita';

    return [
      {
        id: crypto.randomUUID(),
        sourceBank: 'nubank' as const,
        valor: Math.abs(amount),
        descricao: title,
        categoria:
          amount > 0 || isCardPayment
            ? inferCategory(isCardPayment ? 'nubank pagamento' : title)
            : 'Receita',
        tipo,
        data: normalizeDate(date),
        target: installment && tipo === 'gasto' ? 'divida-credito' as const : 'extrato' as const,
        debtTitle: installment?.title,
        parcelas: installment?.total,
        parcelaAtual: installment?.atual,
      },
    ];
  });

  return { bank: 'nubank', items, warnings };
}

export function parseExtratosCsv(content: string): ImportParseResult {
  const trimmed = content.trim();

  if (trimmed.startsWith('Extrato Conta Corrente')) {
    return parseInterCsv(trimmed);
  }

  if (trimmed.startsWith('date,title,amount')) {
    return parseNubankCsv(trimmed);
  }

  throw new Error('Formato de CSV nao suportado. Use um arquivo de extrato Inter ou Nubank.');
}
