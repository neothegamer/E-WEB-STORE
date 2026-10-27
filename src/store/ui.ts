import { create } from 'zustand';

interface Toast { id: number; message: string; tone: 'ok' | 'error' }

interface UiState {
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast['tone']) => void;
}

let seq = 0;

export const useUi = create<UiState>((set, get) => ({
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
  toasts: [],
  toast: (message, tone = 'ok') => {
    const id = ++seq;
    set({ toasts: [...get().toasts, { id, message, tone }] });
    setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 3200);
  },
}));
