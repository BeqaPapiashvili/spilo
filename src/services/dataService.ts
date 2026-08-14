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

export interface SupportTicket {
  id: string;
  customerName: string;
  customerEmail: string;
  topic: string;
  status: "OPEN" | "CLOSED" | "RESOLVED";
  time: string;
  messages: { sender: "user" | "admin"; text: string; time: string }[];
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
  CMS_PAGES: "spilo_admin_cms_pages",
  NAVIGATION: "spilo_admin_navigation",
  SUPPORT: "spilo_admin_support",
  AUDIT_LOGS: "spilo_admin_audit_logs",
  ADMIN_USERS: "spilo_admin_users",
  ROLES: "spilo_admin_roles",
  DELIVERY: "spilo_admin_delivery",
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
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    this.products = savedProducts ? JSON.parse(savedProducts) : [...PRODUCTS_DATA];

    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    this.categories = savedCategories ? JSON.parse(savedCategories) : [...CATEGORIES_DATA];

    const savedBrands = localStorage.getItem(STORAGE_KEYS.BRANDS);
    this.brands = savedBrands ? JSON.parse(savedBrands) : [...BRANDS_DATA];

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

    const savedCMS = localStorage.getItem(STORAGE_KEYS.CMS_PAGES);
    this.cmsPages = savedCMS
      ? JSON.parse(savedCMS)
      : [
          { id: "about", title: "ჩვენ შესახებ (About Us)", slug: "about", content: "Spilo არის თანამედროვე ონლაინ მაღაზია საქართველოში...", lastUpdated: "2026-08-10" },
          { id: "terms", title: "წესები და პირობები (Terms)", slug: "terms", content: "მაღაზიით სარგებლობის წესები და პირობები...", lastUpdated: "2026-08-01" },
          { id: "privacy", title: "კონფიდენციალურობა (Privacy)", slug: "privacy", content: "პერსონალური მონაცემების დაცვის პოლიტიკა...", lastUpdated: "2026-08-01" },
          { id: "faq", title: "ხშირად დასმული კითხვები (FAQ)", slug: "faq", content: "პასუხები ხშირად დასმულ კითხვებზე...", lastUpdated: "2026-08-12" },
        ];

    const savedNav = localStorage.getItem(STORAGE_KEYS.NAVIGATION);
    this.navItems = savedNav
      ? JSON.parse(savedNav)
      : [
          { id: "nav-1", label: "მობილურები", url: "/categories/mobiles", order: 1 },
          { id: "nav-2", label: "ტაბები", url: "/categories/tablets", order: 2 },
          { id: "nav-3", label: "სმარტ საათები", url: "/categories/smartwatches", order: 3 },
          { id: "nav-4", label: "ლეპტოპები", url: "/categories/laptops", order: 4 },
          { id: "nav-5", label: "აუდიო სისტემა", url: "/categories/audio-systems", order: 5 },
          { id: "nav-6", label: "Gaming", url: "/categories/gaming", order: 6 },
        ];

    const savedSupport = localStorage.getItem(STORAGE_KEYS.SUPPORT);
    this.supportTickets = savedSupport
      ? JSON.parse(savedSupport)
      : [
          {
            id: "conv-1",
            customerName: "Beka Papiashvili",
            customerEmail: "beka@spilo.ge",
            topic: "iPhone 16 Pro-ს მიწოდების ვადა",
            status: "OPEN",
            time: "10:30",
            messages: [
              { sender: "user", text: "გამარჯობა, თბილისში რამდენ დღეში მოიტანთ?", time: "10:30" },
            ],
          },
          {
            id: "conv-2",
            customerName: "Nino Beridze",
            customerEmail: "nino@gmail.com",
            topic: "განვადების დამტკიცების კითხვა",
            status: "OPEN",
            time: "09:45",
            messages: [
              { sender: "user", text: "TBC განვადებით შეძენას რამდენი წუთი სჭირდება?", time: "09:45" },
            ],
          },
        ];

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
        ];

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
        permissions: ["products.*", "categories.*", "brands.*", "orders.*"],
      },
    ];

    const savedUsers = localStorage.getItem(STORAGE_KEYS.ADMIN_USERS);
    this.adminUsers = savedUsers
      ? JSON.parse(savedUsers)
      : [
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

  public deletePromotion(id: string): void {
    this.promotions = this.promotions.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(this.promotions));
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

  public deleteCoupon(id: string): void {
    this.coupons = this.coupons.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.COUPONS, JSON.stringify(this.coupons));
    this.notify();
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
  }

  public deleteBanner(id: string): void {
    this.banners = this.banners.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(this.banners));
    this.notify();
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
  }

  public deleteNavigationItem(id: string): void {
    this.navItems = this.navItems.filter((n) => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.NAVIGATION, JSON.stringify(this.navItems));
    this.notify();
  }

  // --- SUPPORT TICKETS ---
  public getSupportTickets(): SupportTicket[] {
    return this.supportTickets;
  }

  public addSupportReply(ticketId: string, replyText: string): void {
    const ticket = this.supportTickets.find((t) => t.id === ticketId);
    if (ticket) {
      ticket.messages.push({
        sender: "admin",
        text: replyText,
        time: new Date().toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      });
      localStorage.setItem(STORAGE_KEYS.SUPPORT, JSON.stringify(this.supportTickets));
      this.notify();
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
