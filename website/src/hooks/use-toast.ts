import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error" | "destructive";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  dismissToast: (id: string) => void;
  removeToast: (id: string) => void;
}

let counter = 0;

function genId(): string {
  counter = (counter + 1) % Number.MAX_SAFE_INTEGER;
  return counter.toString();
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = genId();
    set((state) => ({
      toasts: [...state.toasts, { id, ...toast }],
    }));
    return id;
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t } : t)),
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function toast(props: Omit<Toast, "id">) {
  return useToastStore.getState().addToast(props);
}

export function useToast() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismissToast);
  const remove = useToastStore((s) => s.removeToast);

  return {
    toasts,
    toast,
    dismiss,
    remove,
  };
}
