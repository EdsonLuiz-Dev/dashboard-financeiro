export function loadLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function save<T>(key: string, value: T) {
  // persist locally only (no remote)
  saveLocal(key, value);
}

export async function loadRemote<T>(_key: string): Promise<T | undefined> {
  // remote persistence removed — always return undefined
  return undefined;
}

export default {
  loadLocal,
  saveLocal,
  save,
  loadRemote,
};
