import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Check } from './icons';

/**
 * A minimal toast channel. Actions that would hit a backend in production
 * (subscribe, download, share, copy) confirm here instead of silently
 * doing nothing.
 */

type ShowToast = (message: string) => void;

const ToastContext = createContext<ShowToast>(() => {});

export function useToast(): ShowToast {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback<ShowToast>((next) => {
    setMessage(next);
    window.setTimeout(() => setMessage((current) => (current === next ? null : current)), 2600);
  }, []);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message ? (
        <div className="toast" role="status">
          <Check size={15} color="#7CE0A2" />
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}
