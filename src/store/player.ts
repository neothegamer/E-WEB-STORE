import { create } from 'zustand';
import type { Product } from '@/types';

interface PlayerState {
  current: Product | null;
  playing: boolean;
  position: number; // seconds into the 30-second preview
  ended: boolean;
  play: (p: Product) => void;
  toggle: () => void;
  stop: () => void;
  tick: (pos: number) => void;
  finish: () => void;
}

export const usePlayer = create<PlayerState>((set, get) => ({
  current: null,
  playing: false,
  position: 0,
  ended: false,
  play: (p) => {
    const { current, ended } = get();
    if (current?.id === p.id && !ended) return set({ playing: true });
    set({ current: p, playing: true, position: 0, ended: false });
  },
  toggle: () => {
    const { ended, current } = get();
    if (ended && current) return set({ position: 0, ended: false, playing: true });
    set({ playing: !get().playing });
  },
  stop: () => set({ current: null, playing: false, position: 0, ended: false }),
  tick: (position) => set({ position }),
  finish: () => set({ playing: false, ended: true }),
}));
