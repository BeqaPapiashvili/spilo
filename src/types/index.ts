export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  title: string;
  items: SpecItem[];
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color", "Storage"
  type: "color" | "text";
  options: {
    label: string;
    value: string;
    colorHex?: string;
    inStock: boolean;
    priceModifier?: number;
    image?: string;
  }[];
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  likes?: number;
}

export interface Product {
  id: string;
  sku: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  monthlyInstallment?: number;
  stock: number;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  brandLogo?: string;
  image?: string;
  images: string[];
  specs?: SpecGroup[];
  variants?: ProductVariant[];
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isHot?: boolean;
  isFeatured?: boolean;
  warrantyMonths?: number;
  freeShipping?: boolean;
  storage?: string;
  ram?: string;
  colorName?: string;
  colorHex?: string;
  screenSize?: string;
  resolution?: string;
  purpose?: string;
  connectivity?: string;
  material?: string;
  processor?: string;
  graphicsCard?: string;
  flightTime?: string;
  noiseCancellation?: boolean;
}

export interface DeepCategoryItem {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  brandQuery?: string;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  items?: DeepCategoryItem[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  productCount?: number;
  children?: SubCategory[];
  featuredBrands?: string[];
  promoBanner?: {
    title: string;
    image: string;
    link: string;
  };
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string;
  featured?: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedVariants?: Record<string, string>;
  quantity: number;
}

export interface WishlistItem {
  id: string;
  product: Product;
  addedAt: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  selectedVariants?: Record<string, string>;
}

export type OrderStatus = "მუშავდება" | "გზაშია" | "ჩაბარებულია" | "გაუქმებულია";

export interface OrderTrackingStep {
  title: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

export interface OrderRecord {
  id: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  shippingAddress: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
    notes?: string;
  };
  trackingSteps: OrderTrackingStep[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  addresses?: {
    id: string;
    title: string;
    city: string;
    address: string;
    isDefault?: boolean;
  }[];
}

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
