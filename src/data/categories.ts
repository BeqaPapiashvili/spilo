import { Category } from "@/types";

export const CATEGORIES_DATA: Category[] = [
  {
    id: "smartphones",
    name: "სმარტფონები & პლანშეტები",
    slug: "smartphones",
    icon: "Smartphone",
    image: "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
    featuredBrands: ["Apple", "Samsung", "Xiaomi", "Google"],
    promoBanner: {
      title: "iPhone 16 Pro — 0% განვადებით",
      image: "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
      link: "/catalog?category=smartphones",
    },
    children: [
      { id: "iphones", name: "iPhones", slug: "iphones", productCount: 32 },
      { id: "androids", name: "Android სმარტფონები", slug: "androids", productCount: 48 },
      { id: "tablets", name: "პლანშეტები", slug: "tablets", productCount: 18 },
      { id: "phone-accessories", name: "ქეისები & დამტენები", slug: "phone-accessories", productCount: 85 },
    ],
  },
  {
    id: "laptops-computers",
    name: "ლეპტოპები & კომპიუტერები",
    slug: "laptops-computers",
    icon: "Laptop",
    image: "https://veli.store/media-cdn/__sized__/product/macbookpro16-thumbnail-200x200-95.jpg",
    featuredBrands: ["Apple", "ASUS", "Lenovo", "Dell"],
    promoBanner: {
      title: "MacBook Pro M3 Max",
      image: "https://veli.store/media-cdn/__sized__/product/macbookpro16-thumbnail-200x200-95.jpg",
      link: "/catalog?category=laptops-computers",
    },
    children: [
      { id: "laptops", name: "ლეპტოპები", slug: "laptops", productCount: 42 },
      { id: "monitors", name: "მონიტორები", slug: "monitors", productCount: 22 },
      { id: "pc-components", name: "კომპიუტერის ნაწილები", slug: "pc-components", productCount: 64 },
      { id: "keyboards-mice", name: "კლავიატურები & მაუსები", slug: "keyboards-mice", productCount: 50 },
    ],
  },
  {
    id: "drones-gadgets",
    name: "დრონები & კამერები",
    slug: "drones-gadgets",
    icon: "Camera",
    image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
    featuredBrands: ["DJI", "Insta360", "GoPro"],
    promoBanner: {
      title: "DJI Neo & Osmo 3 Special Offer",
      image: "https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg",
      link: "/catalog?category=drones-gadgets",
    },
    children: [
      { id: "drones", name: "დრონები", slug: "drones", productCount: 14 },
      { id: "gimbals", name: "სტაბილიზატორები", slug: "gimbals", productCount: 9 },
      { id: "action-cams", name: "ექშენ კამერები", slug: "action-cams", productCount: 12 },
      { id: "drone-accessories", name: "დრონის აქსესუარები", slug: "drone-accessories", productCount: 25 },
    ],
  },
  {
    id: "audio-sound",
    name: "აუდიო & ყურსასმენები",
    slug: "audio-sound",
    icon: "Headphones",
    image: "https://veli.store/media-cdn/__sized__/product/airpodspro2-thumbnail-200x200-95.jpg",
    featuredBrands: ["Sony", "Marshall", "JBL", "Apple"],
    children: [
      { id: "wireless-earphones", name: "უპროტესტო ყურსასმენები", slug: "wireless-earphones", productCount: 30 },
      { id: "headphones", name: "სრულზომიანი ყურსასმენები", slug: "headphones", productCount: 15 },
      { id: "speakers", name: "პორტატული დინამიკები", slug: "speakers", productCount: 28 },
      { id: "soundbars", name: "საუნდბარები", slug: "soundbars", productCount: 11 },
    ],
  },
  {
    id: "furniture-home",
    name: "ავეჯი & ინტერიერი",
    slug: "furniture-home",
    icon: "Home",
    children: [
      { id: "sofas-chairs", name: "დივნები & სავარძლები", slug: "sofas-chairs", productCount: 24 },
      { id: "desks-tables", name: "მაგიდები", slug: "desks-tables", productCount: 19 },
      { id: "lighting", name: "განათება", slug: "lighting", productCount: 31 },
    ],
  },
];
