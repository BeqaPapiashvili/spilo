import { Product, Category, Brand, OrderRecord, Review, OrderStatus } from "@/types";
import { CATEGORIES_DATA } from "@/data/categories";
import { PRODUCTS_DATA } from "@/data/products";
import { BRANDS_DATA } from "@/data/brands";

export interface Promotion {
  id: string;
  name: string;
  slug: string;
  description?: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "SCHEDULED" | "EXPIRED";
  bannerImage?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  usedCount: number;
  status: "ACTIVE" | "EXPIRED" | "DISABLED";
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  imageDesktop: string;
  position: "HERO" | "MID_PAGE" | "CATEGORY" | "SIDEBAR";
  isActive: boolean;
  priority: number;
}

export interface CMSPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  lastUpdated: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  url: string;
  order: number;
}

export interface ChatAttachment {
  type: "image" | "video" | "file";
  url: string;
  name: string;
  size?: string;
}

export interface ChatMessage {
  id?: string;
  sender: "user" | "bot" | "admin";
  text: string;
  time: string;
  adminName?: string;
  adminAvatar?: string;
  read?: boolean;
  liked?: boolean | null;
  attachment?: ChatAttachment;
}

export interface SupportTicket {
  id: string;
  customerId?: string; // Unique client session ID for private chat isolation
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  topic: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  isUserTyping?: boolean;
  isAdminTyping?: boolean;
  typingAdminName?: string; // Name of operator currently typing in admin
  assignedToName?: string;  // Name of operator assigned/handling this chat
  time: string;
  messages: ChatMessage[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: string;
  entity: string;
  details: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
}

const STORAGE_KEYS = {
  PRODUCTS: "spilo_admin_products",
  CATEGORIES: "spilo_admin_categories",
  BRANDS: "spilo_admin_brands",
  PROMOTIONS: "spilo_admin_promotions",
  COUPONS: "spilo_admin_coupons",
  BANNERS: "spilo_admin_banners",
  CMS_PAGES: "spilo_admin_cms",
  NAVIGATION: "spilo_admin_navigation",
  SUPPORT: "spilo_admin_support_tickets",
  AUDIT_LOGS: "spilo_admin_audit_logs",
  ROLES: "spilo_admin_roles",
  ADMIN_USERS: "spilo_admin_users",
};

class DataService {
  private products: Product[] = [];
  private categories: Category[] = [];
  private brands: Brand[] = [];
  private promotions: Promotion[] = [];
  private coupons: Coupon[] = [];
  private banners: Banner[] = [];
  private cmsPages: CMSPage[] = [];
  private navItems: NavigationItem[] = [];
  private supportTickets: SupportTicket[] = [];
  private auditLogs: AuditLog[] = [];
  private roles: Role[] = [];
  private adminUsers: AdminUser[] = [];
  private listeners: (() => void)[] = [];
  private isSyncing = false;

  private static instance: DataService;
  private static hasSyncedInitial = false;

  constructor() {
    if (DataService.instance) {
      return DataService.instance;
    }
    DataService.instance = this;

    if (typeof window !== "undefined") {
      this.loadFromStorage();
      this.syncFromBackend();
    }
  }

  private loadFromStorage() {
    try {
      const storedProds = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      this.products = storedProds ? JSON.parse(storedProds) : PRODUCTS_DATA;

      const storedCats = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      this.categories = storedCats ? JSON.parse(storedCats) : CATEGORIES_DATA;

      const storedBrands = localStorage.getItem(STORAGE_KEYS.BRANDS);
      this.brands = storedBrands ? JSON.parse(storedBrands) : BRANDS_DATA;

      const storedPromos = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
      this.promotions = storedPromos ? JSON.parse(storedPromos) : [];

      const storedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
      this.coupons = storedCoupons ? JSON.parse(storedCoupons) : [];

      const storedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
      this.banners = storedBanners ? JSON.parse(storedBanners) : [];

      const storedCMS = localStorage.getItem(STORAGE_KEYS.CMS_PAGES);
      this.cmsPages = storedCMS ? JSON.parse(storedCMS) : [
        { id: "1", title: "წესები და პირობები", slug: "terms", content: "spilo-ს სარგებლობის პირობები...", lastUpdated: "2026-01-15" },
        { id: "2", title: "კონფიდენციალურობა", slug: "privacy", content: "პერსონალურ მონაცემთა დაცვა...", lastUpdated: "2026-01-10" },
      ];

      const storedNav = localStorage.getItem(STORAGE_KEYS.NAVIGATION);
      this.navItems = storedNav ? JSON.parse(storedNav) : [
        { id: "1", label: "მთავარი", url: "/", order: 1 },
        { id: "2", label: "კატალოგი", url: "/catalog", order: 2 },
        { id: "3", label: "კატეგორიები", url: "/categories", order: 3 },
      ];

      const storedSupport = localStorage.getItem(STORAGE_KEYS.SUPPORT);
      this.supportTickets = storedSupport ? JSON.parse(storedSupport) : [];

      const storedLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      this.auditLogs = storedLogs ? JSON.parse(storedLogs) : [];

      this.roles = [
        { id: "role-1", name: "Super Admin", description: "სრული წვდომა სისტემაზე", permissions: ["all"] },
        { id: "role-2", name: "Store Manager", description: "პროდუქტებისა და შეკვეთების მართვა", permissions: ["products", "orders"] },
      ];

      const storedAdmins = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
      this.adminUsers = storedAdmins ? JSON.parse(storedAdmins) : [
        { id: "adm-1", name: "Beka Papiashvili", email: "beka@spilo.ge", roleId: "role-1", roleName: "Super Admin", status: "ACTIVE" },
      ];
    } catch (e) {
      console.error("Error loading dataService from storage", e);
    }
  }

  public async syncFromBackend(force = false) {
    if (typeof window === "undefined") return;
    // BUG FIX #1: Removed isSyncing guard — it was blocking all polling calls after the first request.
    // force=true is used by polling intervals, so we must always allow it through.
    if (!force && DataService.hasSyncedInitial) return;

    DataService.hasSyncedInitial = true;
    try {
      const [resProd, resCat, resBrand, resPromo, resCoupon, resBanner, resAdmin, resCMS, resNav, resSupport, resLogs] = await Promise.all([
        fetch("/api/products").then((r) => r.json()).catch(() => null),
        fetch("/api/categories").then((r) => r.json()).catch(() => null),
        fetch("/api/brands").then((r) => r.json()).catch(() => null),
        fetch("/api/promotions").then((r) => r.json()).catch(() => null),
        fetch("/api/coupons").then((r) => r.json()).catch(() => null),
        fetch("/api/banners").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/users").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/cms").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/navigation").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/support").then((r) => r.json()).catch(() => null),
        fetch("/api/admin/audit-logs").then((r) => r.json()).catch(() => null),
      ]);

      let hasChanges = false;

      if (resProd && resProd.success && Array.isArray(resProd.data) && resProd.data.length > 0) {
        this.products = resProd.data;
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
        hasChanges = true;
      }
      if (resCat && resCat.success && Array.isArray(resCat.data) && resCat.data.length > 0) {
        this.categories = resCat.data.map((cat: any) => {
          if (!cat.children || !Array.isArray(cat.children) || cat.children.length === 0) {
            const fallback = CATEGORIES_DATA.find((c) => c.id === cat.id || c.slug === cat.slug);
            if (fallback && fallback.children && fallback.children.length > 0) {
              return { ...cat, children: fallback.children };
            }
          }
          return cat;
        });
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
        hasChanges = true;
      }
      if (resBrand && resBrand.success && Array.isArray(resBrand.data) && resBrand.data.length > 0) {
        this.brands = resBrand.data;
        hasChanges = true;
      }
      if (resPromo && resPromo.success && Array.isArray(resPromo.data) && resPromo.data.length > 0) {
        this.promotions = resPromo.data;
        hasChanges = true;
      }
      if (resCoupon && resCoupon.success && Array.isArray(resCoupon.data) && resCoupon.data.length > 0) {
        this.coupons = resCoupon.data;
        hasChanges = true;
      }
      if (resBanner && resBanner.success && Array.isArray(resBanner.data) && resBanner.data.length > 0) {
        this.banners = resBanner.data;
        hasChanges = true;
      }
      if (resAdmin && resAdmin.success && Array.isArray(resAdmin.data) && resAdmin.data.length > 0) {
        this.adminUsers = resAdmin.data;
        hasChanges = true;
      }
      if (resCMS && resCMS.success && Array.isArray(resCMS.data) && resCMS.data.length > 0) {
        this.cmsPages = resCMS.data;
        hasChanges = true;
      }
      if (resNav && resNav.success && Array.isArray(resNav.data) && resNav.data.length > 0) {
        this.navItems = resNav.data;
        hasChanges = true;
      }
      if (resSupport && resSupport.success && Array.isArray(resSupport.data)) {
        this.supportTickets = [...resSupport.data];
        localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
        hasChanges = true;
      }
      if (resLogs && resLogs.success && Array.isArray(resLogs.data) && resLogs.data.length > 0) {
        this.auditLogs = resLogs.data;
        hasChanges = true;
      }

      if (hasChanges) {
        this.notify();
      }
    } catch (e) {
      console.warn("syncFromBackend error:", e);
    }
  }

  // Dedicated lightweight support-only GET sync for chat polling intervals
  public async syncSupportOnly(): Promise<void> {
    if (typeof window === "undefined") return;
    try {
      const res = await fetch("/api/admin/support", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
      if (res && res.success && Array.isArray(res.data)) {
        this.supportTickets = [...res.data];
        localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
        this.notify();
      }
    } catch (e) {
      console.warn("syncSupportOnly error:", e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => String(p.id) === String(id));
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.products.find((p) => p.slug === slug);
  }

  public saveProduct(productData: Partial<Product> & { title: string }): Product {
    let saved: Product;
    const isUpdate = !!productData.id;

    if (isUpdate) {
      const idx = this.products.findIndex((p) => String(p.id) === String(productData.id));
      if (idx >= 0) {
        saved = { ...this.products[idx], ...productData } as Product;
        this.products[idx] = saved;
      } else {
        saved = { ...productData, id: productData.id || `prod-${Date.now()}` } as Product;
        this.products.unshift(saved);
      }
    } else {
      saved = {
        id: `prod-${Date.now()}`,
        slug: productData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        price: 0,
        images: ["/placeholder.png"],
        category: "სხვა",
        brand: "სხვა",
        inStock: true,
        stock: 10,
        ...productData,
      } as Product;
      this.products.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    this.logAction("Beka Papiashvili", isUpdate ? "UPDATE_PRODUCT" : "CREATE_PRODUCT", `Product #${saved.id}`, `შენახულია პროდუქტი: ${saved.title}`);
    this.notify();

    if (typeof window !== "undefined") {
      const url = isUpdate ? `/api/products/${productData.id}` : "/api/products";
      const method = isUpdate ? "PUT" : "POST";
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.products.findIndex((p) => String(p.id) === String(saved.id));
            if (index >= 0) {
              this.products[index] = res.data;
              localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync product to MySQL:", err));
    }

    return saved;
  }

  public deleteProduct(id: string): void {
    this.products = this.products.filter((p) => String(p.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    this.logAction("Beka Papiashvili", "DELETE_PRODUCT", `Product #${id}`, "წაიშალა პროდუქტი");
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/products/${id}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete on MySQL:", err));
    }
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.categories;
  }

  public saveCategory(category: Partial<Category> & { name: string }): Category {
    let saved: Category;
    const isUpdate = !!category.id;

    if (isUpdate) {
      const idx = this.categories.findIndex((c) => String(c.id) === String(category.id));
      if (idx >= 0) {
        saved = { ...this.categories[idx], ...category } as Category;
        this.categories[idx] = saved;
      } else {
        saved = { ...category, id: category.id || `cat-${Date.now()}` } as Category;
        this.categories.unshift(saved);
      }
    } else {
      saved = {
        id: `cat-${Date.now()}`,
        slug: category.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        icon: "Package",
        ...category,
      } as Category;
      this.categories.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.logAction("Beka Papiashvili", isUpdate ? "UPDATE_CATEGORY" : "CREATE_CATEGORY", `Category #${saved.id}`, `შენახულია კატეგორია: ${saved.name}`);
    this.notify();

    if (typeof window !== "undefined") {
      const url = "/api/categories";
      const method = isUpdate ? "PUT" : "POST";
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.categories.findIndex((c) => String(c.id) === String(saved.id));
            if (index >= 0) {
              this.categories[index] = res.data;
              localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync category to MySQL:", err));
    }

    return saved;
  }

  public deleteCategory(id: string): void {
    this.categories = this.categories.filter((c) => String(c.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.logAction("Beka Papiashvili", "DELETE_CATEGORY", `Category #${id}`, "წაიშალა კატეგორია");
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete category on MySQL:", err));
    }
  }

  // --- BRANDS ---
  public getBrands(): Brand[] {
    return this.brands;
  }

  public saveBrand(brand: Partial<Brand> & { name: string }): Brand {
    let saved: Brand;
    const isUpdate = !!brand.id;

    if (isUpdate) {
      const idx = this.brands.findIndex((b) => String(b.id) === String(brand.id));
      if (idx >= 0) {
        saved = { ...this.brands[idx], ...brand } as Brand;
        this.brands[idx] = saved;
      } else {
        saved = { ...brand, id: brand.id || `brand-${Date.now()}` } as Brand;
        this.brands.unshift(saved);
      }
    } else {
      saved = {
        id: `brand-${Date.now()}`,
        slug: brand.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        logo: "/placeholder.png",
        ...brand,
      } as Brand;
      this.brands.unshift(saved);
    }

    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(this.brands));
    this.logAction("Beka Papiashvili", isUpdate ? "UPDATE_BRAND" : "CREATE_BRAND", `Brand #${saved.id}`, `შენახულია ბრენდი: ${saved.name}`);
    this.notify();

    if (typeof window !== "undefined") {
      const url = "/api/brands";
      const method = isUpdate ? "PUT" : "POST";
      fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saved),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.brands.findIndex((b) => String(b.id) === String(saved.id));
            if (index >= 0) {
              this.brands[index] = res.data;
              localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(this.brands));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync brand to MySQL:", err));
    }

    return saved;
  }

  public deleteBrand(id: string): void {
    this.brands = this.brands.filter((b) => String(b.id) !== String(id));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(this.brands));
    this.logAction("Beka Papiashvili", "DELETE_BRAND", `Brand #${id}`, "წაიშალა ბრენდი");
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/brands?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete brand on MySQL:", err));
    }
  }

  // --- PROMOTIONS ---
  public getPromotions(): Promotion[] {
    return this.promotions;
  }

  public savePromotion(promo: Promotion): void {
    const idx = this.promotions.findIndex((p) => p.id === promo.id);
    if (idx >= 0) {
      this.promotions[idx] = promo;
    } else {
      this.promotions.push(promo);
    }
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(this.promotions));
    this.logAction("Beka Papiashvili", "SAVE_PROMOTION", `Promo #${promo.id}`, `შენახულია აქცია: ${promo.name}`);
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promo),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.promotions.findIndex((p) => p.id === promo.id);
            if (index >= 0) {
              this.promotions[index] = { ...this.promotions[index], ...res.data };
              localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(this.promotions));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync promo to MySQL:", err));
    }
  }

  public deletePromotion(id: string): void {
    this.promotions = this.promotions.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(this.promotions));
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/promotions?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete promo on MySQL:", err));
    }
  }

  // --- COUPONS ---
  public getCoupons(): Coupon[] {
    return this.coupons;
  }

  public saveCoupon(coupon: Coupon): void {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      this.coupons[idx] = coupon;
    } else {
      this.coupons.push(coupon);
    }
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
    this.logAction("Beka Papiashvili", "SAVE_COUPON", `Coupon #${coupon.code}`, `შენახულია კუპონი: ${coupon.code}`);
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coupon),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.coupons.findIndex((c) => c.id === coupon.id);
            if (index >= 0) {
              this.coupons[index] = { ...this.coupons[index], ...res.data };
              localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync coupon to MySQL:", err));
    }
  }

  public deleteCoupon(id: string): void {
    this.coupons = this.coupons.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/coupons?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete coupon on MySQL:", err));
    }
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    return this.banners;
  }

  public saveBanner(banner: Banner): void {
    const idx = this.banners.findIndex((b) => b.id === banner.id);
    if (idx >= 0) {
      this.banners[idx] = banner;
    } else {
      this.banners.push(banner);
    }
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(banner),
      })
        .then((r) => r.json())
        .then((res) => {
          if (res && res.success && res.data) {
            const index = this.banners.findIndex((b) => b.id === banner.id);
            if (index >= 0) {
              this.banners[index] = { ...this.banners[index], ...res.data };
              localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
              this.notify();
            }
          }
        })
        .catch((err) => console.warn("Failed async sync banner to MySQL:", err));
    }
  }

  public deleteBanner(id: string): void {
    this.banners = this.banners.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/banners?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch((err) => console.warn("Failed async delete banner on MySQL:", err));
    }
  }

  // --- CMS PAGES ---
  public getCMSPages(): CMSPage[] {
    return this.cmsPages;
  }

  public saveCMSPage(page: CMSPage): void {
    const idx = this.cmsPages.findIndex((p) => p.id === page.id);
    if (idx >= 0) {
      this.cmsPages[idx] = page;
    } else {
      this.cmsPages.push(page);
    }
    localStorage.setItem(STORAGE_KEYS.CMS_PAGES, JSON.stringify(this.cmsPages));
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/admin/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      }).catch(() => {});
    }
  }

  // --- NAVIGATION ---
  public getNavigationItems(): NavigationItem[] {
    return this.navItems;
  }

  public saveNavigationItem(item: NavigationItem): void {
    const idx = this.navItems.findIndex((n) => n.id === item.id);
    if (idx >= 0) {
      this.navItems[idx] = item;
    } else {
      this.navItems.push(item);
    }
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(this.navItems));
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/admin/navigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      }).catch(() => {});
    }
  }

  public deleteNavigationItem(id: string): void {
    this.navItems = this.navItems.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(this.navItems));
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/admin/navigation?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});
    }
  }

  // --- SUPPORT TICKETS ---
  public getSupportTickets(): SupportTicket[] {
    return [...this.supportTickets];
  }

  public addUserSupportMessage(
    customerName: string,
    customerPhone: string,
    text: string,
    topic = "ონლაინ კონსულტაცია",
    customerEmail = "",
    customerId = "",
    attachment?: ChatAttachment
  ): string {
    // Ticket lookup strictly based on customerId (exact match) and status === OPEN
    let ticket = this.supportTickets.find(
      (t) => t.status === "OPEN" && (
        (customerId && t.customerId === customerId) ||
        (customerPhone && customerPhone !== "+995 5XX XX XX XX" && t.customerPhone === customerPhone)
      )
    );
    
    const timeStr = new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });

    if (!ticket) {
      ticket = {
        id: `tkt-${Date.now()}`,
        customerId: customerId || `cust-${Date.now()}`,
        customerName: customerName.trim() || "სტუმარი მომხმარებელი",
        customerPhone: customerPhone.trim() || "+995 5XX XX XX XX",
        customerEmail: customerEmail.trim() || `${customerPhone ? customerPhone.replace(/[^0-9]/g, "") : "guest"}@spilo.ge`,
        topic,
        status: "OPEN",
        time: "ახლახანს",
        messages: [],
      };
      this.supportTickets = [ticket, ...this.supportTickets];
    } else {
      this.supportTickets = this.supportTickets.map(t => t.id === ticket!.id ? { 
        ...t, 
        customerId: customerId || t.customerId,
        customerName: customerName || t.customerName,
        customerPhone: customerPhone || t.customerPhone,
        status: "OPEN" as const, 
        time: "ახლახანს" 
      } : t);
    }

    ticket.messages.push({
      sender: "user",
      text,
      time: timeStr,
      attachment,
    });

    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ticket.id,
          customerId: ticket.customerId,
          userName: ticket.customerName,
          userPhone: ticket.customerPhone,
          userEmail: ticket.customerEmail,
          status: ticket.status,
          messages: ticket.messages,
        }),
      }).catch(() => {});
    }

    return ticket.id;
  }

  public addSupportReply(ticketId: string, replyText: string, adminName?: string, adminAvatar = "", attachment?: ChatAttachment): void {
    let finalAdminName = adminName;
    if (!finalAdminName || finalAdminName === "Beka Papiashvili") {
      try {
        const { useStore } = require("@/store/useStore");
        const storeState = useStore.getState();
        finalAdminName =
          storeState.adminUser?.name ||
          storeState.user?.name ||
          (storeState.adminUser?.email ? storeState.adminUser.email.split("@")[0] : "") ||
          (storeState.user?.email ? storeState.user.email.split("@")[0] : "") ||
          "ოპერატორი";
      } catch (e) {
        finalAdminName = adminName || "ოპერატორი";
      }
    }

    let updatedTicket: SupportTicket | undefined;

    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          messages: [
            ...t.messages,
            {
              sender: "admin" as const,
              text: replyText,
              time: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
              adminName: finalAdminName,
              adminAvatar,
              attachment,
            },
          ],
        };
        return updatedTicket;
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
    this.notify();

    if (typeof window !== "undefined" && updatedTicket) {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTicket),
      }).catch(() => {});
    }
  }

  public updateSupportTicketStatus(ticketId: string, status: "OPEN" | "CLOSED" | "RESOLVED"): void {
    let updatedTicket: SupportTicket | undefined;

    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === ticketId) {
        const updatedMessages = [...t.messages];
        if (status === "RESOLVED" || status === "CLOSED") {
          updatedMessages.push({
            sender: "admin" as const,
            text: "საუბარი დასრულდა ოპერატორის მიერ. მადლობა რომ იყენებთ spilo-ს!",
            time: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
          });
        }
        updatedTicket = {
          ...t,
          status,
          messages: updatedMessages,
        };
        return updatedTicket;
      }
      return t;
    });
    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
    this.notify();

    if (typeof window !== "undefined" && updatedTicket) {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTicket),
      }).catch(() => {});
    }
  }

  public setTypingStatus(ticketId: string, sender: "user" | "admin", isTyping: boolean, adminName?: string): void {
    let updatedTicket: SupportTicket | undefined;

    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          ...(sender === "user"
            ? { isUserTyping: isTyping }
            : {
                isAdminTyping: isTyping,
                typingAdminName: isTyping ? (adminName || t.typingAdminName || "ოპერატორი") : "",
                ...(isTyping && !t.assignedToName ? { assignedToName: adminName || "ოპერატორი" } : {}),
              }),
        };
        return updatedTicket;
      }
      return t;
    });

    this.notify();

    if (typeof window !== "undefined" && updatedTicket) {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedTicket.id,
          isUserTyping: updatedTicket.isUserTyping,
          isAdminTyping: updatedTicket.isAdminTyping,
          typingAdminName: updatedTicket.typingAdminName,
          assignedToName: updatedTicket.assignedToName,
        }),
      }).catch(() => {});
    }
  }

  public assignTicket(ticketId: string, adminName: string): void {
    let updatedTicket: SupportTicket | undefined;

    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          assignedToName: adminName,
        };
        return updatedTicket;
      }
      return t;
    });

    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
    this.notify();

    if (typeof window !== "undefined" && updatedTicket) {
      fetch("/api/admin/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updatedTicket.id,
          assignedToName: updatedTicket.assignedToName,
        }),
      }).catch(() => {});
    }
  }

  public markMessagesAsRead(ticketId: string, reader: "user" | "admin"): void {
    let updatedTicket: SupportTicket | undefined;

    this.supportTickets = this.supportTickets.map((t) => {
      if (t.id === ticketId) {
        let hasUnread = false;
        const updatedMessages = t.messages.map((m) => {
          const isOppositeSender = (reader === "user" && m.sender === "admin") || (reader === "admin" && m.sender === "user");
          if (isOppositeSender && !m.read) {
            hasUnread = true;
            return { ...m, read: true };
          }
          return m;
        });

        if (hasUnread) {
          updatedTicket = {
            ...t,
            messages: updatedMessages,
          };
          return updatedTicket;
        }
      }
      return t;
    });

    if (updatedTicket) {
      localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
      this.notify();

      if (typeof window !== "undefined") {
        fetch("/api/admin/support", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: updatedTicket.id,
            messages: updatedTicket.messages,
          }),
        }).catch(() => {});
      }
    }
  }

  public deleteSupportTicket(ticketId: string): void {
    this.supportTickets = this.supportTickets.filter((t) => t.id !== ticketId);
    localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
    this.notify();

    if (typeof window !== "undefined") {
      fetch(`/api/admin/support?id=${encodeURIComponent(ticketId)}`, { method: "DELETE" }).catch(() => {});
    }
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAction(userName: string, action: string, entity: string, details: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toLocaleString("ka-GE"),
      userName,
      userEmail: "beka@spilo.ge",
      action,
      entity,
      details,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(this.auditLogs));
    this.notify();

    if (typeof window !== "undefined") {
      fetch("/api/admin/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: "beka@spilo.ge",
          action: `${action}: ${entity}`,
          target: details,
        }),
      }).catch(() => {});
    }
  }

  // --- ROLES & ADMIN USERS ---
  public getAdminUsers(): AdminUser[] {
    return this.adminUsers;
  }

  public saveAdminUser(user: AdminUser): void {
    const idx = this.adminUsers.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      this.adminUsers[idx] = user;
    } else {
      this.adminUsers.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify(this.adminUsers));
    this.notify();
  }

  public getRoles(): Role[] {
    return this.roles;
  }
}

export const dataService = new DataService();
