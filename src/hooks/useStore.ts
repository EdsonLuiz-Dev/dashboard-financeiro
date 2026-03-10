import { useState, useCallback, useEffect } from 'react';
import type { Divida, DividaMovimento, Extrato } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_CAT_COLORS } from '../data/financeiro';
import storage from '../services/storage';

const STORAGE_KEYS = {
  extratos: 'dashboard-fin-extratos',
  categories: 'dashboard-fin-categories',
  catColors: 'dashboard-fin-cat-colors',
  dividas: 'dashboard-fin-dividas',
  saldoAtual: 'dashboard-fin-saldo-atual',
  hideSaldo: 'dashboard-fin-hide-saldo',
} as const;

function load<T>(key: string, fallback: T): T {
  return storage.loadLocal(key, fallback);
}

function save<T>(key: string, value: T) {
  void storage.save(key, value);
}

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
  // ---------------------------------------------------------------------------
  // Storage mode flag — exposed so the UI can show a banner
  // ---------------------------------------------------------------------------
  const isUsingLocalStorage = !storage.isSupabaseConfigured;

  // ---------------------------------------------------------------------------
  // State — seeded from localStorage synchronously (fast first render)
  // ---------------------------------------------------------------------------
  const [extratos, setExtratos] = useState<Extrato[]>(() =>
    load(STORAGE_KEYS.extratos, [])
  );
  const [categories, setCategories] = useState<string[]>(() =>
    load(STORAGE_KEYS.categories, DEFAULT_CATEGORIES)
  );
  const [catColors, setCatColors] = useState<Record<string, string>>(() =>
    load(STORAGE_KEYS.catColors, DEFAULT_CAT_COLORS)
  );
  const [dividas, setDividas] = useState<Divida[]>(() =>
    load(STORAGE_KEYS.dividas, [])
  );
  const [saldoAtual, setSaldoAtualState] = useState<number | null>(() =>
    load(STORAGE_KEYS.saldoAtual, null)
  );
  const [hideSaldo, setHideSaldoState] = useState<boolean>(() =>
    load(STORAGE_KEYS.hideSaldo, false)
  );

  // ---------------------------------------------------------------------------
  // Hydration from Supabase (runs once on mount when Supabase is configured)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!storage.isSupabaseConfigured) return;

async function hydrate() {
    const [
        remoteExtratos,
        remoteCategories,
        remoteCatColors,
        remoteDividas,
        remoteSaldo,
    ] = await Promise.all([
        storage.loadWithFallback<Extrato[]>(STORAGE_KEYS.extratos, []),
        storage.loadWithFallback<string[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES),
        storage.loadWithFallback<Record<string, string>>(STORAGE_KEYS.catColors, DEFAULT_CAT_COLORS),
        storage.loadWithFallback<Divida[]>(STORAGE_KEYS.dividas, []),
        storage.loadWithFallback<number | null>(STORAGE_KEYS.saldoAtual, null),
    ]);

    setExtratos(remoteExtratos);
    setCategories(remoteCategories);
    setCatColors(remoteCatColors);
    setDividas(remoteDividas);
    setSaldoAtualState(remoteSaldo);
    }

    void hydrate();
  }, []);

  // ---------------------------------------------------------------------------
  // Extratos
  // ---------------------------------------------------------------------------
    const addExtrato = useCallback((extrato: Omit<Extrato, 'id'>) => {
    setExtratos((prev) => {
        const next = [
        ...prev,
        {
            ...extrato,
            id: crypto.randomUUID(),
            criadoEm: new Date().toISOString(), // ← adicionar aqui
        },
        ];
        save(STORAGE_KEYS.extratos, next);
        return next;
    });
    }, []);

  const addExtratos = useCallback((items: Array<Omit<Extrato, 'id'>>) => {
    let imported = 0;
    let skipped = 0;
    let updated = 0;

    setExtratos((prev) => {
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

          if (changed) {
            updated += 1;
          } else {
            skipped += 1;
          }
          continue;
        }

        signatureToIndex.set(signature, next.length);
        next.push({ ...item, id: crypto.randomUUID() });
        imported += 1;
      }

      save(STORAGE_KEYS.extratos, next);
      return next;
    });

    return { imported, skipped, updated };
  }, []);

  const removeExtrato = useCallback((id: string) => {
    setExtratos((prev) => {
      const next = prev.filter((e) => e.id !== id);
      save(STORAGE_KEYS.extratos, next);
      return next;
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Categorias
  // ---------------------------------------------------------------------------
  const addCategory = useCallback((name: string, color: string) => {
    setCategories((prev) => {
      if (prev.includes(name)) return prev;
      const next = [...prev, name];
      save(STORAGE_KEYS.categories, next);
      return next;
    });
    setCatColors((prev) => {
      const next = { ...prev, [name]: color };
      save(STORAGE_KEYS.catColors, next);
      return next;
    });
  }, []);

  const removeCategory = useCallback((name: string) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c !== name);
      save(STORAGE_KEYS.categories, next);
      return next;
    });
    setCatColors((prev) => {
      const next = { ...prev };
      delete next[name];
      save(STORAGE_KEYS.catColors, next);
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
        save(STORAGE_KEYS.dividas, next);
        return next;
      });
    },
    []
  );

  const removeDivida = useCallback((id: string) => {
    setDividas((prev) => {
      const next = prev.filter((d) => d.id !== id);
      save(STORAGE_KEYS.dividas, next);
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
        save(STORAGE_KEYS.dividas, next);
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
        save(STORAGE_KEYS.dividas, next);
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

    save(STORAGE_KEYS.extratos, []);
    save(STORAGE_KEYS.dividas, []);
    save(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
    save(STORAGE_KEYS.catColors, DEFAULT_CAT_COLORS);
    save(STORAGE_KEYS.saldoAtual, null);
    storage.saveLocal(STORAGE_KEYS.hideSaldo, false);
  }, []);

  const setSaldoAtual = useCallback((value: number | null) => {
    setSaldoAtualState(value);
    save(STORAGE_KEYS.saldoAtual, value);
  }, []);

  const setHideSaldo = useCallback((value: boolean) => {
    setHideSaldoState(value);
    save(STORAGE_KEYS.hideSaldo, value);
  }, []);

  return {
    // data
    extratos,
    categories,
    catColors,
    dividas,
    saldoAtual,
    hideSaldo,
    // storage mode — use this to show/hide the banner
    isUsingLocalStorage,
    // actions
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