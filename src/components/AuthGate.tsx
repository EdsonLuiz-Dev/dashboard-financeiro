import { useState, useEffect, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { generateSalt, hashPassword } from '../lib/hash';

interface PasswordRecord {
  hash: string;
  salt: string;
}

const KV_KEY = 'dashboard-fin-password';
const SESSION_KEY = 'dashboard-fin-authed';

async function loadPassword(): Promise<PasswordRecord | null> {
  const { data, error } = await supabase
    .from('kv_store')
    .select('value')
    .eq('key', KV_KEY)
    .maybeSingle();

  if (error || !data?.value) return null;
  const record = data.value as PasswordRecord;
  if (!record.hash || !record.salt) return null;
  return record;
}

async function savePassword(record: PasswordRecord): Promise<boolean> {
  const { error } = await supabase
    .from('kv_store')
    .upsert({ key: KV_KEY, value: record, updated_at: new Date().toISOString() });
  return !error;
}

export default function AuthGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'create' | 'login' | 'authed'>('loading');
  const [storedRecord, setStoredRecord] = useState<PasswordRecord | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const alreadyAuthed = sessionStorage.getItem(SESSION_KEY) === 'true';

    loadPassword().then((record) => {
      if (alreadyAuthed && record) {
        setState('authed');
      } else if (record) {
        setStoredRecord(record);
        setState('login');
      } else {
        setState('create');
      }
    });
  }, []);

  const handleCreate = async () => {
    setError('');
    if (password.length < 4) {
      setError('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const salt = await generateSalt();
    const hash = await hashPassword(password, salt);
    const ok = await savePassword({ hash, salt });

    if (!ok) {
      setError('Erro ao salvar senha. Tente novamente.');
      return;
    }

    sessionStorage.setItem(SESSION_KEY, 'true');
    setState('authed');
  };

  const handleLogin = async () => {
    setError('');
    if (!storedRecord) return;

    const hash = await hashPassword(password, storedRecord.salt);
    if (hash === storedRecord.hash) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setState('authed');
    } else {
      setError('Senha incorreta.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, handler: () => void) => {
    if (e.key === 'Enter') handler();
  };

  if (state === 'loading') {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Verificando acesso...</p>
      </div>
    );
  }

  if (state === 'authed') {
    return <>{children}</>;
  }

  const isCreate = state === 'create';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.lockIcon}>🔒</div>
        <h1 style={styles.title}>Dashboard Financeiro</h1>
        <p style={styles.subtitle}>
          {isCreate ? 'Crie uma senha para proteger seus dados' : 'Insira sua senha para continuar'}
        </p>

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, isCreate ? handleCreate : handleLogin)}
          autoFocus
          style={styles.input}
        />

        {isCreate && (
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => handleKeyDown(e, handleCreate)}
            style={styles.input}
          />
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button
          onClick={isCreate ? handleCreate : handleLogin}
          style={styles.button}
        >
          {isCreate ? 'Criar Senha' : 'Entrar'}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'var(--font-mono)',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 16,
    padding: '48px 36px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center' as const,
    animation: 'fadeUp 0.4s ease',
  },
  lockIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: 22,
    background: 'linear-gradient(135deg, var(--text), var(--accent))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: 'var(--muted)',
    marginBottom: 24,
  },
  input: {
    display: 'block',
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--surface2)',
    color: 'var(--text)',
    marginBottom: 12,
    outline: 'none',
  },
  error: {
    fontSize: 12,
    color: 'var(--red)',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    fontWeight: 600,
    padding: '12px 0',
    borderRadius: 10,
    border: 'none',
    background: 'var(--accent)',
    color: '#fff',
    cursor: 'pointer',
    marginTop: 4,
  },
  loadingText: {
    color: 'var(--muted)',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
  },
};
