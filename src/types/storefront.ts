export interface PromoStyleConfig {
  cardLayoutVariant?: 'GLASS_MODERN' | 'SPLIT_HORIZONTAL' | 'BENTO_CARD' | 'FLOATING_3D' | 'NEON_MINIMAL';
  cardShape?: 'ROUNDED_LG' | 'ROUNDED_2XL' | 'ROUNDED_3XL' | 'SHARP';
  aspectRatio?: 'SQUARE' | 'PORTRAIT_TALL' | 'LANDSCAPE_WIDE';
  borderStyle?: 'GLOW_BORDER' | 'SOLID_THIN' | 'NO_BORDER_SHADOW' | 'GLASS_BORDER';
  contentAlignment?: 'LEFT' | 'CENTER' | 'BOTTOM_OVERLAY';
  imagePosition?: 'RIGHT' | 'BACKGROUND_FULL' | 'FLOATING_TOP' | 'INSIDE_CARD';
  enableHoverZoom?: boolean;
}

export interface PromoCardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  priceText?: string;
  oldPriceText?: string;
  bgGradient?: string;
  bgColor?: string;
  bgImageUrl?: string;
  link: string;
  buttonText?: string;
}

export interface TrustItem {
  id: string;
  icon: 'Truck' | 'CreditCard' | 'ShieldCheck' | 'Headphones' | 'RotateCcw' | 'Sparkles' | 'Award' | 'Clock';
  title: string;
  subtitle?: string;
  link?: string;
  iconColor?: string;
}

export const DEFAULT_PROMO_CARDS: PromoCardItem[] = [
  {
    id: "pc-1",
    title: "ტანსაცმელი & ფეხსაცმელი",
    badge: "40%-მდე",
    bgColor: "#FFC5E3",
    bgGradient: "from-[#FFC5E3] to-[#FFA8D5]",
    bgImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
    link: "/catalog",
  },
  {
    id: "pc-2",
    title: "აუდიოტექნიკა",
    badge: "40%-მდე",
    bgColor: "#E2D9FF",
    bgGradient: "from-[#E2D9FF] to-[#D0C2FF]",
    bgImageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
    link: "/catalog?category=audio",
  },
  {
    id: "pc-3",
    title: "ქართული ბრენდები",
    badge: "40%-მდე",
    bgColor: "#FFE6C7",
    bgGradient: "from-[#FFE6C7] to-[#FFD5A3]",
    bgImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
    link: "/catalog",
  },
  {
    id: "pc-4",
    title: "სმარტ გაჯეტები",
    badge: "35%-მდე",
    bgColor: "#C8F2FF",
    bgGradient: "from-[#C8F2FF] to-[#A8E8FF]",
    bgImageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500&q=80",
    link: "/catalog?category=gadgets",
  },
];

export const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  {
    id: "trust-1",
    icon: "Truck",
    title: "სწრაფი მიწოდება",
    subtitle: "უფასოდ მთელ საქართველოში",
    link: "/page/delivery",
    iconColor: "#2563eb",
  },
  {
    id: "trust-2",
    icon: "ShieldCheck",
    title: "ოფიციალური გარანტია",
    subtitle: "100% ორიგინალი პროდუქცია",
    link: "/page/warranty",
    iconColor: "#16a34a",
  },
  {
    id: "trust-3",
    icon: "CreditCard",
    title: "0% განვადება",
    subtitle: "ყველა წამყვან ბანკში",
    link: "/page/installments",
    iconColor: "#d97706",
  },
  {
    id: "trust-4",
    icon: "Sparkles",
    title: "სასაჩუქრე შეფუთვა",
    subtitle: "უფასო შეფუთვა და ბარათი",
    link: "/catalog",
    iconColor: "#9333ea",
  },
];

export interface HeroSlideItem {
  id: string;
  image: string;
  mobileImage?: string;
  badge?: string;
  title: string;
  subtitle?: string;
  buttonText?: string;
  link?: string;
  bgGradient?: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "hero-1",
    image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1400&q=80",
    badge: "სპეციალური შეთავაზება",
    title: "იპოვე იდეალური საჩუქარი ყველასთვის",
    subtitle: "შეარჩიე, შეფუთე, გაუგზავნე საჩუქარი მარტივად spilo-თი",
    buttonText: "შეარჩიე საჩუქარი",
    link: "/catalog",
  },
  {
    id: "hero-2",
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&q=80",
    badge: "Next-Gen Gaming",
    title: "PlayStation 5 & VR2 ექსკლუზივი",
    subtitle: "საუკეთესო ფასები და 0% განვადება წამყვან ბანკებში",
    buttonText: "გეიმინგ კატალოგი",
    link: "/catalog?category=gaming",
  },
  {
    id: "hero-3",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80",
    badge: "Apple Official",
    title: "iPhone 16 Pro & Apple Intelligence",
    subtitle: "ტიტანის კორპუსი და პროფესიონალური კამერის სისტემა",
    buttonText: "აღმოაჩინე",
    link: "/catalog?brand=apple",
  },
];
