import { supabase } from '../lib/supabase';
import type { Extrato } from '../types';

// ---------------------------------------------------------------------------
// kv_store — used for categories, dividas, saldoAtual
// ---------------------------------------------------------------------------

export async function loadRemote<T>(key: string): Promise<T | undefined> {
  try {
    const { data, error } = await supabase
      .from('kv_store')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) {
      console.warn('[storage] loadRemote error:', error.message);
      return undefined;
    }

    return data?.value as T | undefined;
  } catch (err) {
    console.warn('[storage] loadRemote unexpected error:', err);
    return undefined;
  }
}

export async function saveRemote<T>(key: string, value: T): Promise<void> {
  try {
    console.log('[storage] saveRemote →', key);
    const { error } = await supabase
      .from('kv_store')
      .upsert({ key, value, updated_at: new Date().toISOString() });

    if (error) {
      console.error('[storage] saveRemote FAILED:', key, error.code, error.message, error.details, error.hint);
    }
  } catch (err) {
    console.error('[storage] saveRemote unexpected error:', err);
  }
}

export async function load<T>(key: string, fallback: T): Promise<T> {
  const remote = await loadRemote<T>(key);
  return remote !== undefined ? remote : fallback;
}

export async function save<T>(key: string, value: T): Promise<void> {
  await saveRemote(key, value);
}

// ---------------------------------------------------------------------------
// extratos — dedicated table, one row per extrato
// ---------------------------------------------------------------------------

function toDbRow(e: Extrato) {
  return {
    id:          e.id,
    valor:       e.valor,
    descricao:   e.descricao,
    categoria:   e.categoria,
    tipo:        e.tipo,
    data:        e.data,
    criado_em:   e.criadoEm ?? null,
    saldo_conta: e.saldoConta ?? null,
  };
}

function fromDbRow(row: Record<string, any>): Extrato {
  return {
    id:         row.id,
    valor:      Number(row.valor),
    descricao:  row.descricao,
    categoria:  row.categoria,
    tipo:       row.tipo,
    data:       row.data,
    criadoEm:   row.criado_em ?? undefined,
    saldoConta: row.saldo_conta ?? undefined,
  };
}

export async function loadExtratos(): Promise<Extrato[]> {
  try {
    console.log('[storage] loadExtratos → fetching...');
    const { data, error } = await supabase
      .from('extratos')
      .select('*')
      .order('criado_em', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('[storage] loadExtratos FAILED:', error.code, error.message, error.details, error.hint);
      return [];
    }

    console.log('[storage] loadExtratos OK, rows:', data?.length);
    return (data ?? []).map(fromDbRow);
  } catch (err) {
    console.error('[storage] loadExtratos unexpected error:', err);
    return [];
  }
}

export async function insertExtrato(extrato: Extrato): Promise<void> {
  try {
    const row = toDbRow(extrato);
    console.log('[storage] insertExtrato →', row.id, row.descricao);
    const { data, error } = await supabase.from('extratos').insert(row).select();
    if (error) {
      console.error('[storage] insertExtrato FAILED:', error.code, error.message, error.details, error.hint);
    } else {
      console.log('[storage] insertExtrato OK, rows returned:', data?.length);
    }
  } catch (err) {
    console.error('[storage] insertExtrato unexpected error:', err);
  }
}

export async function insertExtratos(extratos: Extrato[]): Promise<void> {
  if (extratos.length === 0) return;

  try {
    const rows = extratos.map(toDbRow);
    console.log('[storage] insertExtratos →', rows.length, 'rows');
    const { data, error } = await supabase
      .from('extratos')
      .upsert(rows, { onConflict: 'id' })
      .select();
    if (error) {
      console.error('[storage] insertExtratos FAILED:', error.code, error.message, error.details, error.hint);
    } else {
      console.log('[storage] insertExtratos OK, rows returned:', data?.length);
    }
  } catch (err) {
    console.error('[storage] insertExtratos unexpected error:', err);
  }
}

export async function deleteExtrato(id: string): Promise<void> {
  try {
    const { error } = await supabase.from('extratos').delete().eq('id', id);
    if (error) console.warn('[storage] deleteExtrato error:', error.message);
  } catch (err) {
    console.warn('[storage] deleteExtrato unexpected error:', err);
  }
}

export async function clearExtratos(): Promise<void> {
  try {
    const { error } = await supabase.from('extratos').delete().neq('id', '');
    if (error) console.warn('[storage] clearExtratos error:', error.message);
  } catch (err) {
    console.warn('[storage] clearExtratos unexpected error:', err);
  }
}

export default {
  load,
  save,
  loadRemote,
  saveRemote,
  loadExtratos,
  insertExtrato,
  insertExtratos,
  deleteExtrato,
  clearExtratos,
};