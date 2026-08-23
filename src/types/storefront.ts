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
    title: "საზაფხულო ფასდაკლება",
    subtitle: "აუზები & ეზოს ავეჯი",
    badge: "50%-მდე",
    bgColor: "#FEF08A",
    bgGradient: "from-[#FEF08A] to-[#FDE047]",
    bgImageUrl: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&q=80",
    link: "/catalog",
  },
  {
    id: "pc-2",
    title: "სმარტ ტექნიკა & IT",
    subtitle: "ლეპტოპები & გაჯეტები",
    badge: "40%-მდე",
    bgColor: "#BAE6FD",
    bgGradient: "from-[#BAE6FD] to-[#7DD3FC]",
    bgImageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80",
    link: "/catalog?category=laptops",
  },
  {
    id: "pc-3",
    title: "ყავის აპარატები & სამზარეულო",
    subtitle: "მსხვილი და წვრილი ტექნიკა",
    badge: "35%-მდე",
    bgColor: "#FED7AA",
    bgGradient: "from-[#FED7AA] to-[#FDBA74]",
    bgImageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80",
    link: "/catalog?category=appliances",
  },
  {
    id: "pc-4",
    title: "აუდიო & ყურსასმენები",
    subtitle: "პრემიუმ ხმა & აქსესუარები",
    badge: "45%-მდე",
    bgColor: "#BBF7D0",
    bgGradient: "from-[#BBF7D0] to-[#86EFAC]",
    bgImageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
    link: "/catalog?category=audio",
  },
];

export const DEFAULT_TRUST_ITEMS: TrustItem[] = [
  {
    id: "trust-1",
    icon: "Truck",
    title: "სწრაფი მიწოდება",
    subtitle: "უფასოდ მთელ საქართველოში",
    link: "/page/delivery",
    iconColor: "#FF5238",
  },
  {
    id: "trust-2",
    icon: "ShieldCheck",
    title: "ოფიციალური გარანტია",
    subtitle: "100% ორიგინალი პროდუქცია",
    link: "/page/warranty",
    iconColor: "#10B981",
  },
  {
    id: "trust-3",
    icon: "CreditCard",
    title: "0% განვადება",
    subtitle: "ყველა წამყვან ბანკში",
    link: "/page/installments",
    iconColor: "#F59E0B",
  },
  {
    id: "trust-4",
    icon: "Sparkles",
    title: "საჩუქრები & ქულები",
    subtitle: "დააგროვე ყოველ შენაძენზე",
    link: "/catalog",
    iconColor: "#4F46E5",
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
