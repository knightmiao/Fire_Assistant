import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type ToastKind = 'success' | 'error';

type ToastItem = { id: number; message: string; kind: ToastKind };

const ToastContext = createContext<(message: string, kind?: ToastKind) => void>(
  () => {}
);

const TOAST_MS = 4200;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now();
    setToast({ id, message, kind });
    window.setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast ? (
        <div
          className={`app-toast app-toast--${toast.kind}`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
