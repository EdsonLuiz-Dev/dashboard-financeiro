import { useState, useCallback, useEffect, useRef } from 'react';
import type { Divida, DividaMovimento, Extrato } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_CAT_COLORS } from '../data/financeiro';
import storage from '../services/storage';

const STORAGE_KEYS = {
  categories: 'dashboard-fin-categories',
  catColors:  'dashboard-fin-cat-colors',
  dividas:    'dashboard-fin-dividas',
  saldoAtual: 'dashboard-fin-saldo-atual',
} as const;

function extratoSignature(extrato: Omit<Extrato, 'id'> | Extrato) {
  return [
    extrato.data,
    extrato.tipo,
    extrato.categoria,
    extrato.valor.toFixed(2),
    extrato.descricao.trim().toLowerCase(),
  ].join('|');
}

export function useStore() {
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // State — starts empty, hydrated from Supabase on mount
  // ---------------------------------------------------------------------------
  const [extratos, setExtratos] = useState<Extrato[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [catColors, setCatColors] = useState<Record<string, string>>(DEFAULT_CAT_COLORS);
  const [dividas, setDividas] = useState<Divida[]>([]);
  const [saldoAtual, setSaldoAtualState] = useState<number | null>(null);
  const [hideSaldo, setHideSaldoState] = useState<boolean>(false);

  // Ref to keep synchronous access to extratos (React 18 batching may defer
  // setState updater callbacks, so reading state inside them is unreliable
  // for code that runs *after* the setState call).
  const extratosRef = useRef<Extrato[]>(extratos);
  extratosRef.current = extratos;

  const saldoAtualRef = useRef<number | null>(saldoAtual);
  saldoAtualRef.current = saldoAtual;

  // ---------------------------------------------------------------------------
  // Hydration from Supabase (runs once on mount)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    async function hydrate() {
      try {
        const [
          remoteExtratos,
          remoteCategories,
          remoteCatColors,
          remoteDividas,
          remoteSaldo,
        ] = await Promise.all([
          storage.loadExtratos(),
          storage.load<string[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
          storage.load<Record<string, string>>(STORAGE_KEYS.catColors, DEFAULT_CAT_COLORS),
          storage.load<Divida[]>(STORAGE_KEYS.dividas, []),
          storage.load<number | null>(STORAGE_KEYS.saldoAtual, null),
        ]);

        extratosRef.current = remoteExtratos;
        setExtratos(remoteExtratos);
        setCategories(remoteCategories);
        setCatColors(remoteCatColors);
        setDividas(remoteDividas);
        setSaldoAtualState(remoteSaldo);
      } catch (err) {
        console.warn('[useStore] hydration error:', err);
      } finally {
        setLoading(false);
      }
    }

    void hydrate();
  }, []);

  // ---------------------------------------------------------------------------
  // Extratos — all reads use extratosRef for synchronous access
  // ---------------------------------------------------------------------------
  const addExtrato = useCallback((extrato: Omit<Extrato, 'id'>) => {
    const newExtrato: Extrato = {
      ...extrato,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
    };

    const next = [...extratosRef.current, newExtrato];
    extratosRef.current = next;
    setExtratos(next);
    void storage.insertExtrato(newExtrato);

    // Atualiza saldoAtual automaticamente ao adicionar extrato manual
    if (saldoAtualRef.current !== null) {
      const delta = extrato.tipo === 'receita' ? extrato.valor : -extrato.valor;
      const newSaldo = saldoAtualRef.current + delta;
      saldoAtualRef.current = newSaldo;
      setSaldoAtualState(newSaldo);
      void storage.save(STORAGE_KEYS.saldoAtual, newSaldo);
    }
  }, []);

  const addExtratos = useCallback((items: Array<Omit<Extrato, 'id'>>) => {
    let imported = 0;
    let skipped = 0;
    let updated = 0;
    const newRows: Extrato[] = [];

    const prev = extratosRef.current;
    const signatureToIndex = new Map<string, number>();
    prev.forEach((extrato, idx) =>
      signatureToIndex.set(extratoSignature(extrato), idx)
    );

    const next = [...prev];

    for (const item of items) {
      const signature = extratoSignature(item);
      if (signatureToIndex.has(signature)) {
        const idx = signatureToIndex.get(signature)!;
        const existing = next[idx];
        let changed = false;

        if (
          (existing as any).saldoConta === undefined &&
          (item as any).saldoConta !== undefined
        ) {
          next[idx] = { ...existing, saldoConta: (item as any).saldoConta };
          changed = true;
        }

        if (changed) updated += 1;
        else skipped += 1;
        continue;
      }

      const newExtrato: Extrato = { ...item, id: crypto.randomUUID() };
      signatureToIndex.set(signature, next.length);
      next.push(newExtrato);
      newRows.push(newExtrato);
      imported += 1;
    }

    extratosRef.current = next;
    setExtratos(next);

    if (newRows.length > 0) {
      void storage.insertExtratos(newRows);
    }

    return { imported, skipped, updated };
  }, []);

  const removeExtrato = useCallback((id: string) => {
    const deleted = extratosRef.current.find((e) => e.id === id);
    const next = extratosRef.current.filter((e) => e.id !== id);
    extratosRef.current = next;
    setExtratos(next);
    void storage.deleteExtrato(id);

    // Ao deletar uma transação, ajusta o saldoAtual inversamente
    if (deleted && saldoAtualRef.current !== null) {
      // Se foi gasto, readiciona o dinheiro; se foi receita, remove
      const delta = deleted.tipo === 'gasto' ? deleted.valor : -deleted.valor;
      const newSaldo = saldoAtualRef.current + delta;
      saldoAtualRef.current = newSaldo;
      setSaldoAtualState(newSaldo);
      void storage.save(STORAGE_KEYS.saldoAtual, newSaldo);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------
  const addCategory = useCallback((name: string, color: string) => {
    setCategories((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      void storage.save(STORAGE_KEYS.categories, next);
      return next;
    });
    setCatColors((prev) => {
      const next = { ...prev, [name]: color };
      void storage.save(STORAGE_KEYS.catColors, next);
      return next;
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c !== name);
      void storage.save(STORAGE_KEYS.categories, next);
      return next;
    });
    setCatColors((prev) => {
      const next = { ...prev };
      delete next[name];
      void storage.save(STORAGE_KEYS.catColors, next);
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Dívidas
  // ---------------------------------------------------------------------------
  const addDivida = useCallback(
    (
      divida: Omit<Divida, 'id' | 'movimentos'> & {
        id?: string;
        movimentos?: DividaMovimento[];
      }
    ) => {
      setDividas((prev) => {
        const next = [
          ...prev,
          {
            ...divida,
            id: divida.id ?? crypto.randomUUID(),
            modalidade: divida.modalidade ?? 'geral',
            movimentos: divida.movimentos ?? [],
          },
        ];
        void storage.save(STORAGE_KEYS.dividas, next);
        return next;
      });
    },
    []
  );

  const removeDivida = useCallback((id: string) => {
    setDividas((prev) => {
      const next = prev.filter((d) => d.id !== id);
      void storage.save(STORAGE_KEYS.dividas, next);
      return next;
    });
  }, []);

  const addMovimentoDivida = useCallback(
    (dividaId: string, movimento: Omit<DividaMovimento, 'id'>) => {
      setDividas((prev) => {
        const next = prev.map((divida) => {
          if (divida.id !== dividaId) return divida;
          return {
            ...divida,
            movimentos: [
              ...divida.movimentos,
              { ...movimento, id: crypto.randomUUID() },
            ],
          };
        });
        void storage.save(STORAGE_KEYS.dividas, next);
        return next;
      });
    },
    []
  );

  const removeMovimentoDivida = useCallback(
    (dividaId: string, movimentoId: string) => {
      setDividas((prev) => {
        const next = prev.map((divida) => {
          if (divida.id !== dividaId) return divida;
          return {
            ...divida,
            movimentos: divida.movimentos.filter((m) => m.id !== movimentoId),
          };
        });
        void storage.save(STORAGE_KEYS.dividas, next);
        return next;
      });
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Misc
  // ---------------------------------------------------------------------------
  const clearAllData = useCallback(() => {
    setExtratos([]);
    setDividas([]);
    setCategories(DEFAULT_CATEGORIES);
    setCatColors(DEFAULT_CAT_COLORS);
    setSaldoAtualState(null);
    setHideSaldoState(false);

    void storage.save(STORAGE_KEYS.dividas, []);
    void storage.save(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
    void storage.save(STORAGE_KEYS.catColors, DEFAULT_CAT_COLORS);
    void storage.save(STORAGE_KEYS.saldoAtual, null);
    void storage.clearExtratos();
  }, []);

  const setSaldoAtual = useCallback((value: number | null) => {
    setSaldoAtualState(value);
    void storage.save(STORAGE_KEYS.saldoAtual, value);
  }, []);

  const setHideSaldo = useCallback((value: boolean) => {
    setHideSaldoState(value);
  }, []);

  return {
    loading,
    extratos,
    categories,
    catColors,
    dividas,
    saldoAtual,
    hideSaldo,
    addExtrato,
    addExtratos,
    removeExtrato,
    addCategory,
    removeCategory,
    addDivida,
    removeDivida,
    addMovimentoDivida,
    removeMovimentoDivida,
    clearAllData,
    setSaldoAtual,
    setHideSaldo,
  };
}