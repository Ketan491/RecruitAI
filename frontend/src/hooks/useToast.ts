// src/hooks/useToast.ts
import { useUiStore } from '../store/uiStore';

export const useToast = () => {
  const addToast = useUiStore((s) => s.addToast);

  return {
    success: (message: string) => addToast({ type: 'success', message }),
    error: (message: string) => addToast({ type: 'error', message }),
    info: (message: string) => addToast({ type: 'info', message }),
    warning: (message: string) => addToast({ type: 'warning', message }),
  };
};
