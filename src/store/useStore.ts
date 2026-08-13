import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // product id
  title: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface StoreState {
  cart: CartItem[];
  isCartOpen: boolean;
  compareList: string[];
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  toggleAuthModal: (open?: boolean) => void;
  setUser: (user: UserProfile | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      compareList: ['dji-neo', 'dji-mini-4'],
      user: null,
      isAuthModalOpen: false,
      addToCart: (item) =>
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
              isCartOpen: true,
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }], isCartOpen: true };
        }),
      removeFromCart: (id) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      clearCart: () => set({ cart: [] }),
      addToCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.includes(id) 
            ? state.compareList 
            : [...state.compareList.slice(0, 3), id],
        })),
      removeFromCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.filter((i) => i !== id),
        })),
      clearCompare: () => set({ compareList: [] }),
      toggleAuthModal: (open) => 
        set((state) => ({ isAuthModalOpen: open !== undefined ? open : !state.isAuthModalOpen })),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'veli-cart-storage',
    }
  )
);
