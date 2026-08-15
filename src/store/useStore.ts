import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToastMessage, ToastType, OrderStatus } from '@/types';

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
  status: OrderStatus;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  address: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  idNumber?: string;
  isGeorgianCitizen?: boolean;
  address?: string;
  smsNotify?: boolean;
  emailNotify?: boolean;
  role?: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: WishlistItem[];
  orders: OrderRecord[];
  isCartOpen: boolean;
  compareList: string[];
  highlightDifferencesOnly: boolean;
  user: UserProfile | null;
  adminUser: { id: string; name: string; email: string; role: string } | null;
  adminToken: string | null;
  isAuthModalOpen: boolean;
  toasts: ToastMessage[];
  recentlyViewed: WishlistItem[];
  recentSearches: string[];

  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Admin Auth Actions
  setAdminSession: (admin: { id: string; name: string; email: string; role: string } | null, token: string | null) => void;
  updateUserRole: (email: string, role: string) => void;
  logoutAdmin: () => void;

  // Cart Actions
  addToCart: (item: Omit<CartItem, 'quantity'>, openCart?: boolean) => void;
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
  setOrders: (orders: OrderRecord[]) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => void;

  // Compare & Auth Actions
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  toggleHighlightDifferences: () => void;
  toggleAuthModal: (open?: boolean) => void;
  setUser: (user: UserProfile | null) => void;

  // Toast Actions
  addToast: (toast: { title: string; message?: string; type?: ToastType; duration?: number }) => void;
  removeToast: (id: string) => void;

  // Recently Viewed & Search Actions
  addRecentlyViewed: (item: WishlistItem) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      orders: [],
      isCartOpen: false,
      compareList: [],
      highlightDifferencesOnly: false,
      user: null,
      adminUser: null,
      adminToken: null,
      isAuthModalOpen: false,
      toasts: [],
      recentlyViewed: [],
      recentSearches: ["DJI Neo", "iPhone 16", "MacBook Pro"],

      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      setAdminSession: (adminUser, adminToken) => set({ adminUser, adminToken }),
      updateUserRole: (email, role) =>
        set((state) => {
          const targetEmail = email.trim().toLowerCase();
          const updatedAdmin =
            state.adminUser && state.adminUser.email.trim().toLowerCase() === targetEmail
              ? { ...state.adminUser, role }
              : state.adminUser;

          const updatedUser =
            state.user && state.user.email.trim().toLowerCase() === targetEmail
              ? { ...state.user, role }
              : state.user;

          return {
            adminUser: updatedAdmin,
            user: updatedUser,
          };
        }),
      logoutAdmin: () => set({ adminUser: null, adminToken: null }),

      // Cart
      addToCart: (item, openCart = false) => {
        set((state) => {
          const existing = state.cart.find((i) => i.id === item.id);
          const newCart = existing
            ? state.cart.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
            : [...state.cart, { ...item, quantity: 1 }];

          get().addToast({
            title: "დაემატა კალათაში",
            message: item.title,
            type: "success",
          });

          return {
            cart: newCart,
            isCartOpen: openCart ? true : state.isCartOpen,
          };
        });

        // Async sync with SQL backend API
        fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: get().user?.id,
            productId: item.id,
            quantity: 1,
          }),
        }).catch(() => {});
      },

      removeFromCart: (id) => {
        set((state) => ({ cart: state.cart.filter((i) => i.id !== id) }));
        fetch(`/api/cart?productId=${encodeURIComponent(id)}&userId=${encodeURIComponent(get().user?.id || "")}`, {
          method: "DELETE",
        }).catch(() => {});
      },

      updateQuantity: (id, quantity) =>
        set((state) => ({
          cart: state.cart.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      clearCart: () => set({ cart: [] }),

      // Wishlist
      toggleWishlist: (item) => {
        set((state) => {
          const exists = state.wishlist.some((i) => i.id === item.id);
          if (exists) {
            get().addToast({
              title: "ამოიშალა სურვილების სიიდან",
              message: item.title,
              type: "info",
            });
            return { wishlist: state.wishlist.filter((i) => i.id !== item.id) };
          }
          get().addToast({
            title: "დაემატა სურვილების სიაში",
            message: item.title,
            type: "success",
          });
          return { wishlist: [...state.wishlist, item] };
        });

        // Async sync with SQL backend API
        fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: get().user?.id,
            productId: item.id,
          }),
        }).catch(() => {});
      },

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
        get().addToast({
          title: "შეკვეთა მიღებულია!",
          message: `შეკვეთის N ${newId}`,
          type: "success",
        });
        return newId;
      },
      setOrders: (orders) => set({ orders }),
      updateOrderStatus: (id, status) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        })),

      // Compare & Auth
      addToCompare: (id) =>
        set((state) => {
          if (state.compareList.includes(id)) return state;
          if (state.compareList.length >= 3) {
            get().addToast({
              title: "შედარების ლიმიტი",
              message: "შეგიძლიათ შეადაროთ მაქსიმუმ 3 პროდუქტი",
              type: "warning",
            });
            return state;
          }
          get().addToast({
            title: "დაემატა შედარების სიაში",
            type: "success",
          });

          // Async sync with SQL backend API
          fetch("/api/compare", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: get().user?.id,
              productId: id,
            }),
          }).catch(() => {});

          return { compareList: [...state.compareList, id] };
        }),

      removeFromCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.filter((i) => i !== id),
        })),

      toggleCompare: (id) => {
        set((state) => {
          const exists = state.compareList.includes(id);
          if (exists) {
            get().addToast({
              title: "ამოიშალა შედარების სიიდან",
              type: "info",
            });
            return { compareList: state.compareList.filter((i) => i !== id) };
          }
          if (state.compareList.length >= 3) {
            get().addToast({
              title: "შედარების ლიმიტი",
              message: "შეგიძლიათ შეადაროთ მაქსიმუმ 3 პროდუქტი",
              type: "warning",
            });
            return state;
          }
          get().addToast({
            title: "დაემატა შედარების სიაში",
            type: "success",
          });
          return { compareList: [...state.compareList, id] };
        });

        // Async sync with SQL backend API
        fetch("/api/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: get().user?.id,
            productId: id,
          }),
        }).catch(() => {});
      },

      clearCompare: () => set({ compareList: [] }),
      toggleHighlightDifferences: () =>
        set((state) => ({ highlightDifferencesOnly: !state.highlightDifferencesOnly })),
      toggleAuthModal: (open) => 
        set((state) => ({ isAuthModalOpen: open !== undefined ? open : !state.isAuthModalOpen })),
      setUser: (user) => set({ user, isAuthModalOpen: false, ...(user === null ? { adminUser: null, adminToken: null } : {}) }),

      // Toasts
      addToast: ({ title, message, type = "success", duration = 4000 }) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { id, title, message, type, duration }],
        }));
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

      // Recently Viewed & Search
      addRecentlyViewed: (item) => {
        set((state) => {
          const filtered = state.recentlyViewed.filter((i) => i.id !== item.id);
          return { recentlyViewed: [item, ...filtered].slice(0, 10) };
        });

        // Async sync with SQL backend API
        fetch("/api/recently-viewed", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: get().user?.id,
            productId: item.id,
          }),
        }).catch(() => {});
      },

      addRecentSearch: (query) =>
        set((state) => {
          const clean = query.trim();
          if (!clean) return state;
          const filtered = state.recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase());
          return { recentSearches: [clean, ...filtered].slice(0, 5) };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'spilo-store-storage',
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        orders: state.orders,
        compareList: state.compareList,
        highlightDifferencesOnly: state.highlightDifferencesOnly,
        user: state.user,
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        recentlyViewed: state.recentlyViewed,
        recentSearches: state.recentSearches,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);
