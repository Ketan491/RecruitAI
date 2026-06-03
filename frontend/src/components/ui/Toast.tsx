// src/components/ui/Toast.tsx
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import React from 'react';

import { useUiStore, type ToastItem } from '../../store/uiStore';

const iconMap = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  info: <Info size={16} className="text-blue-400" />,
  warning: <AlertTriangle size={16} className="text-amber-400" />,
};

const colorMap: Record<ToastItem['type'], string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-red-500/30 bg-red-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
};

const ToastCard: React.FC<{ toast: ToastItem }> = ({ toast }) => {
  const removeToast = useUiStore((s) => s.removeToast);
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border backdrop-blur-md shadow-lg animate-fade-in ${colorMap[toast.type]}`}
      style={{ minWidth: 280, maxWidth: 380 }}
    >
      <span className="shrink-0 mt-0.5">{iconMap[toast.type]}</span>
      <p className="flex-1 text-sm text-text-primary">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const toasts = useUiStore((s) => s.toasts);
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
};
