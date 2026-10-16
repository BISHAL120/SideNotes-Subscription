'use client';

import React, { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { CheckCircle2, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast, dismissToast } = useCart();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      dismissToast();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div
        key={toast.id}
        className="bg-neutral-900 text-white px-4 py-3 rounded-md shadow-2xl flex items-center gap-3 border border-neutral-700 max-w-sm"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-xs sm:text-sm font-medium flex-1">{toast.message}</span>
        <button
          onClick={dismissToast}
          className="text-neutral-400 hover:text-white p-1 rounded-full transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
