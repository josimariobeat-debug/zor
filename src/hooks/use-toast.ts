import { useState, useCallback, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

let toastListeners: ((toast: Toast) => void)[] = [];
let toastId = 0;

export function toast({ title, description, variant = 'default' }: Omit<Toast, 'id'>) {
  const id = String(++toastId);
  const newToast: Toast = { id, title, description, variant };
  toastListeners.forEach(listener => listener(newToast));
  setTimeout(() => {
    dismissToast(id);
  }, 4000);
  return id;
}

let dismissListeners: ((id: string) => void)[] = [];

export function dismissToast(id: string) {
  dismissListeners.forEach(listener => listener(id));
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((newToast: Toast) => {
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    toastListeners.push(addToast);
    dismissListeners.push(removeToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== addToast);
      dismissListeners = dismissListeners.filter(l => l !== removeToast);
    };
  }, [addToast, removeToast]);

  return { toasts, toast, dismissToast: removeToast };
}
