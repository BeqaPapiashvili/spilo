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
  applicableCategoryIds?: string[];
  applicableBrandIds?: string[];
  applicableProductIds?: string[];
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
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
  imageMobile?: string;
  position: "HERO" | "MID_PAGE" | "CATEGORY" | "SIDEBAR";
  isActive: boolean;
  priority: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userEmail: string;
  action: string; // e.g. "CREATE_PRODUCT", "UPDATE_PRICE", "CHANGE_ORDER_STATUS"
  entity: string; // e.g. "Product #dji-neo"
  details: string; // e.g. "Price changed from 2999₾ to 2799₾"
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
  avatar?: string;
  status: "ACTIVE" | "INACTIVE";
  lastLogin?: string;
}

// Global Storage Keys
const STORAGE_KEYS = {
  PRODUCTS: "spilo_admin_products",
  CATEGORIES: "spilo_admin_categories",
  BRANDS: "spilo_admin_brands",
  PROMOTIONS: "spilo_admin_promotions",
  COUPONS: "spilo_admin_coupons",
  BANNERS: "spilo_admin_banners",
  AUDIT_LOGS: "spilo_admin_audit_logs",
  ADMIN_USERS: "spilo_admin_users",
  ROLES: "spilo_admin_roles",
};

class DataService {
  private products: Product[] = [];
  private categories: Category[] = [];
  private brands: Brand[] = [];
  private promotions: Promotion[] = [];
  private coupons: Coupon[] = [];
  private banners: Banner[] = [];
  private auditLogs: AuditLog[] = [];
  private adminUsers: AdminUser[] = [];
  private roles: Role[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== "undefined") {
      this.initData();
    } else {
      this.products = [...PRODUCTS_DATA];
      this.categories = [...CATEGORIES_DATA];
      this.brands = [...BRANDS_DATA];
    }
  }

  private initData() {
    // Products
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    this.products = savedProducts ? JSON.parse(savedProducts) : [...PRODUCTS_DATA];

    // Categories
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    this.categories = savedCategories ? JSON.parse(savedCategories) : [...CATEGORIES_DATA];

    // Brands
    const savedBrands = localStorage.getItem(STORAGE_KEYS.BRANDS);
    this.brands = savedBrands ? JSON.parse(savedBrands) : [...BRANDS_DATA];

    // Promotions Mock Initial
    const savedPromotions = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    this.promotions = savedPromotions
      ? JSON.parse(savedPromotions)
      : [
          {
            id: "promo-summer-2026",
            name: "ზაფხულის სუპერ ფასდაკლებები",
            slug: "summer-sale-2026",
            description: "20%-მდე ფასდაკლება სმარტფონებსა და აუდიო ტექნიკაზე",
            discountType: "percentage",
            discountValue: 20,
            startDate: "2026-06-01",
            endDate: "2026-08-31",
            status: "ACTIVE",
            bannerImage: "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
          },
        ];

    // Coupons
    const savedCoupons = localStorage.getItem(STORAGE_KEYS.COUPONS);
    this.coupons = savedCoupons
      ? JSON.parse(savedCoupons)
      : [
          {
            id: "cpn-spilo10",
            code: "SPILO10",
            discountType: "percentage",
            discountValue: 10,
            minOrderAmount: 100,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            usedCount: 42,
            status: "ACTIVE",
          },
          {
            id: "cpn-welcome50",
            code: "WELCOME50",
            discountType: "fixed",
            discountValue: 50,
            minOrderAmount: 500,
            startDate: "2026-01-01",
            endDate: "2026-12-31",
            usedCount: 18,
            status: "ACTIVE",
          },
        ];

    // Banners
    const savedBanners = localStorage.getItem(STORAGE_KEYS.BANNERS);
    this.banners = savedBanners
      ? JSON.parse(savedBanners)
      : [
          {
            id: "banner-1",
            title: "iPhone 16 Pro — 0% განვადება",
            subtitle: "შეიძინეთ უპროცენტო განვადებით Spilo-ზე",
            ctaText: "ყიდვა",
            ctaLink: "/catalog?category=mobiles",
            imageDesktop: "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
            position: "HERO",
            isActive: true,
            priority: 1,
          },
          {
            id: "banner-2",
            title: "DJI Neo & Osmo 3",
            subtitle: "სპეციალური ფასი დრონებსა და სტაბილიზატორებზე",
            ctaText: "ნახვა",
            ctaLink: "/catalog?category=photo-video",
            imageDesktop: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
            position: "HERO",
            isActive: true,
            priority: 2,
          },
        ];

    // Audit Logs
    const savedAuditLogs = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    this.auditLogs = savedAuditLogs
      ? JSON.parse(savedAuditLogs)
      : [
          {
            id: "log-1",
            timestamp: "2026-08-14 10:30",
            userName: "Beka Papiashvili",
            userEmail: "beka@spilo.ge",
            action: "UPDATE_PRODUCT",
            entity: "iPhone 16 Pro Max",
            details: "ფასი შეიცვალა: 3899₾ -> 3699₾",
          },
          {
            id: "log-2",
            timestamp: "2026-08-14 09:15",
            userName: "Admin Manager",
            userEmail: "admin@spilo.ge",
            action: "UPDATE_ORDER_STATUS",
            entity: "Order #SPL-92841",
            details: "სტატუსი შეიცვალა: PENDING -> SHIPPED",
          },
        ];

    // Roles & Admin Users
    this.roles = [
      {
        id: "super_admin",
        name: "Super Admin",
        description: "სრული წვდომა სისტემის ყველა მოდულზე",
        permissions: ["*"],
      },
      {
        id: "store_manager",
        name: "Store Manager",
        description: "პროდუქტების, შეკვეთების, აქციებისა და კლიენტების მართვა",
        permissions: ["products.*", "categories.*", "brands.*", "orders.*", "promotions.*", "inventory.*"],
      },
      {
        id: "support_agent",
        name: "Support Agent",
        description: "მომხმარებელთა მხარდაჭერა და მიმოხილვების მოდერაცია",
        permissions: ["support.*", "orders.view", "customers.view", "reviews.moderate"],
      },
    ];

    this.adminUsers = [
      {
        id: "usr-1",
        name: "Beka Papiashvili",
        email: "beka@spilo.ge",
        roleId: "super_admin",
        roleName: "Super Admin",
        status: "ACTIVE",
        lastLogin: "2026-08-14 10:45",
      },
      {
        id: "usr-2",
        name: "Nino Beridze",
        email: "nino@spilo.ge",
        roleId: "store_manager",
        roleName: "Store Manager",
        status: "ACTIVE",
        lastLogin: "2026-08-13 18:20",
      },
    ];
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  // --- BANNERS ---
  public getBanners(): Banner[] {
    return this.banners;
  }

  // --- PRODUCTS ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id || p.slug === id);
  }

  public saveProduct(productData: Partial<Product> & { title: string; price: number }): Product {
    let existingIndex = this.products.findIndex((p) => p.id === productData.id);
    let updatedProduct: Product;

    if (existingIndex >= 0) {
      updatedProduct = { ...this.products[existingIndex], ...productData };
      this.products[existingIndex] = updatedProduct;
      this.logAction("Beka Papiashvili", "UPDATE_PRODUCT", `Product #${updatedProduct.id}`, `განახლდა პროდუქტი: ${updatedProduct.title}`);
    } else {
      const newId = productData.id || `prod-${Date.now()}`;
      updatedProduct = {
        id: newId,
        sku: productData.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        code: productData.code || `${Math.floor(100000 + Math.random() * 900000)}`,
        title: productData.title,
        slug: productData.slug || productData.title.toLowerCase().replace(/\s+/g, "-"),
        description: productData.description || "",
        price: Number(productData.price),
        discountPrice: productData.discountPrice ? Number(productData.discountPrice) : undefined,
        discountPercentage: productData.discountPrice
          ? Math.round(((Number(productData.price) - Number(productData.discountPrice)) / Number(productData.price)) * 100)
          : undefined,
        monthlyInstallment: Math.round(Number(productData.price) / 12),
        stock: Number(productData.stock ?? 10),
        categoryId: productData.categoryId || "mobiles",
        categoryName: productData.categoryName || "მობილურები",
        brandId: productData.brandId || "apple",
        brandName: productData.brandName || "Apple",
        images: productData.images && productData.images.length > 0 ? productData.images : ["https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg"],
        rating: productData.rating || 5.0,
        reviewCount: productData.reviewCount || 1,
        isFeatured: productData.isFeatured ?? true,
        specs: productData.specs || [],
        variants: productData.variants || [],
      };
      this.products.unshift(updatedProduct);
      this.logAction("Beka Papiashvili", "CREATE_PRODUCT", `Product #${updatedProduct.id}`, `შეიქმნა ახალი პროდუქტი: ${updatedProduct.title}`);
    }

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    this.notify();
    return updatedProduct;
  }

  public deleteProduct(id: string): void {
    const product = this.getProductById(id);
    this.products = this.products.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(this.products));
    if (product) {
      this.logAction("Beka Papiashvili", "DELETE_PRODUCT", `Product #${id}`, `წაიშალა პროდუქტი: ${product.title}`);
    }
    this.notify();
  }

  // --- CATEGORIES ---
  public getCategories(): Category[] {
    return this.categories;
  }

  public saveCategory(categoryData: Partial<Category> & { name: string }): Category {
    let existingIndex = this.categories.findIndex((c) => c.id === categoryData.id);
    let updatedCategory: Category;

    if (existingIndex >= 0) {
      updatedCategory = { ...this.categories[existingIndex], ...categoryData };
      this.categories[existingIndex] = updatedCategory;
    } else {
      updatedCategory = {
        id: categoryData.id || `cat-${Date.now()}`,
        name: categoryData.name,
        slug: categoryData.slug || categoryData.name.toLowerCase().replace(/\s+/g, "-"),
        icon: categoryData.icon || "Sparkles",
        children: categoryData.children || [],
      };
      this.categories.push(updatedCategory);
    }

    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.logAction("Beka Papiashvili", "SAVE_CATEGORY", `Category #${updatedCategory.id}`, `შენახულია კატეგორია: ${updatedCategory.name}`);
    this.notify();
    return updatedCategory;
  }

  public deleteCategory(id: string): void {
    this.categories = this.categories.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(this.categories));
    this.logAction("Beka Papiashvili", "DELETE_CATEGORY", `Category #${id}`, `წაიშალა კატეგორია ID: ${id}`);
    this.notify();
  }

  // --- BRANDS ---
  public getBrands(): Brand[] {
    return this.brands;
  }

  public saveBrand(brandData: Partial<Brand> & { name: string }): Brand {
    let existingIndex = this.brands.findIndex((b) => b.id === brandData.id);
    let updatedBrand: Brand;

    if (existingIndex >= 0) {
      updatedBrand = { ...this.brands[existingIndex], ...brandData };
      this.brands[existingIndex] = updatedBrand;
    } else {
      updatedBrand = {
        id: brandData.id || `brand-${Date.now()}`,
        name: brandData.name,
        slug: brandData.slug || brandData.name.toLowerCase().replace(/\s+/g, "-"),
        logo: brandData.logo || "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
        featured: brandData.featured ?? true,
      };
      this.brands.push(updatedBrand);
    }

    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(this.brands));
    this.logAction("Beka Papiashvili", "SAVE_BRAND", `Brand #${updatedBrand.id}`, `შენახულია ბრენდი: ${updatedBrand.name}`);
    this.notify();
    return updatedBrand;
  }

  public deleteBrand(id: string): void {
    this.brands = this.brands.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(this.brands));
    this.notify();
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
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  public logAction(userName: string, action: string, entity: string, details: string) {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
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
  }

  // --- ROLES & ADMIN USERS ---
  public getAdminUsers(): AdminUser[] {
    return this.adminUsers;
  }

  public getRoles(): Role[] {
    return this.roles;
  }
}

export const dataService = new DataService();
