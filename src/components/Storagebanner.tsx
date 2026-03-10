import { useState } from 'react';

interface StorageBannerProps {
  /** Pass `isUsingLocalStorage` from useStore() */
  show: boolean;
}

export function StorageBanner({ show }: StorageBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!show || dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: '#fefce8',
        borderBottom: '1px solid #fde047',
        fontSize: '13px',
        color: '#713f12',
        fontFamily: 'inherit',
      }}
    >
      {/* Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0, color: '#ca8a04' }}
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>

      {/* Message */}
      <span style={{ flex: 1 }}>
        <strong>Modo offline:</strong> os dados estão sendo salvos apenas neste
        navegador (localStorage).{' '}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#92400e', textDecoration: 'underline', fontWeight: 600 }}
        >
          Configure o Supabase
        </a>{' '}
        para sincronizar seus dados na nuvem.
      </span>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Fechar aviso"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          color: '#92400e',
          fontSize: '16px',
          lineHeight: 1,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  );
}