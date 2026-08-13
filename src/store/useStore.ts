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

export interface WishlistItem {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  monthlyInstallment?: number;
  image: string;
  discountPercentage?: number;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: "მუშავდება" | "გზაშია" | "ჩაბარებულია";
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  address: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: OrderRecord[];
  isCartOpen: boolean;
  compareList: string[];
  user: UserProfile | null;
  isAuthModalOpen: boolean;
  
  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;

  // Wishlist Actions
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;

  // Order Actions
  addOrder: (order: Omit<OrderRecord, 'id' | 'date' | 'status'>) => string;

  // Compare & Auth Actions
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  toggleAuthModal: (open?: boolean) => void;
  setUser: (user: UserProfile | null) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      orders: [
        {
          id: "SPL-92841",
          date: "12 აგვისტო, 2026",
          status: "ჩაბარებულია",
          items: [
            {
              id: "dji-neo",
              title: "დრონი DJI Neo Drone Gray",
              price: 799,
              discountPrice: 699,
              image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
              quantity: 1,
            }
          ],
          totalAmount: 699,
          paymentMethod: "0% ონლაინ განვადება (TBC)",
          address: "თბილისი, ჭავჭავაძის გამზ. 34, ბინა 12",
        }
      ],
      isCartOpen: false,
      compareList: ['dji-neo', 'dji-mini-4'],
      user: null,
      isAuthModalOpen: false,

      // Cart
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

      // Wishlist
      toggleWishlist: (item) =>
        set((state) => {
          const exists = state.wishlist.some((i) => i.id === item.id);
          if (exists) {
            return { wishlist: state.wishlist.filter((i) => i.id !== item.id) };
          }
          return { wishlist: [...state.wishlist, item] };
        }),
      isInWishlist: (id) => get().wishlist.some((i) => i.id === id),
      clearWishlist: () => set({ wishlist: [] }),

      // Orders
      addOrder: (orderData) => {
        const newId = `SPL-${Math.floor(10000 + Math.random() * 90000)}`;
        const newOrder: OrderRecord = {
          ...orderData,
          id: newId,
          date: new Date().toLocaleDateString('ka-GE', { day: 'numeric', month: 'long', year: 'numeric' }),
          status: "მუშავდება",
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
        return newId;
      },

      // Compare & Auth
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
