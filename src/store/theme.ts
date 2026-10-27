import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark' | 'system';
const KEY = 'theme';

const resolve = (m: ThemeMode) =>
  m === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : m;
const apply = (m: ThemeMode) => document.documentElement.classList.toggle('dark', resolve(m) === 'dark');

export const useTheme = create<{ mode: ThemeMode; setMode: (m: ThemeMode) => void }>((set) => ({
  mode: (localStorage.getItem(KEY) as ThemeMode) || 'system',
  setMode: (mode) => {
    localStorage.setItem(KEY, mode);
    apply(mode);
    set({ mode });
  },
}));

export function initTheme() {
  apply(useTheme.getState().mode);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (useTheme.getState().mode === 'system') apply('system');
  });
}
