import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';

export type CartItem = Pick<Product, 'id' | 'slug' | 'title' | 'creator' | 'price' | 'type' | 'currency'>;

interface CartState {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p) => {
        if (get().items.some((i) => i.id === p.id)) return;
        const { id, slug, title, creator, price, type, currency } = p;
        set({ items: [...get().items, { id, slug, title, creator, price, type, currency }] });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart' }
  )
);
