import { Category } from "@/types";

export const CATEGORIES_DATA: Category[] = [
  {
    id: "mobiles",
    name: "მობილურები",
    slug: "mobiles",
    icon: "Smartphone",
    image: "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
    featuredBrands: ["Apple", "Samsung", "Xiaomi", "POCO", "Google"],
    children: [
      { 
        id: "mobiles-brands", 
        name: "მობილურის ბრენდები", 
        slug: "mobiles-brands", 
        productCount: 210,
        items: [
          { id: "mob-apple", name: "Apple", slug: "iphones", brandQuery: "apple" },
          { id: "mob-samsung", name: "Samsung", slug: "androids", brandQuery: "samsung" },
          { id: "mob-xiaomi", name: "Xiaomi", slug: "androids", brandQuery: "xiaomi" },
          { id: "mob-poco", name: "Poco", slug: "androids", brandQuery: "poco" },
          { id: "mob-vivo", name: "Vivo", slug: "androids", brandQuery: "vivo" },
          { id: "mob-google", name: "Google", slug: "androids", brandQuery: "google" },
          { id: "mob-nothing", name: "Nothing", slug: "androids", brandQuery: "nothing" },
          { id: "mob-oneplus", name: "OnePlus", slug: "androids", brandQuery: "oneplus" },
          { id: "mob-realme", name: "Realme", slug: "androids", brandQuery: "realme" },
          { id: "mob-oppo", name: "Oppo", slug: "androids", brandQuery: "oppo" },
          { id: "mob-zte", name: "ZTE", slug: "androids", brandQuery: "zte" },
          { id: "mob-motorola", name: "Motorola", slug: "androids", brandQuery: "motorola" },
          { id: "mob-blackview", name: "Blackview", slug: "androids", brandQuery: "blackview" },
        ]
      },
      { 
        id: "wireless-chargers-sub", 
        name: "უსადენო დამტენები", 
        slug: "wireless-chargers", 
        productCount: 85,
        items: [
          { id: "wc-apple", name: "Apple", slug: "chargers", brandQuery: "apple" },
          { id: "wc-samsung", name: "Samsung", slug: "chargers", brandQuery: "samsung" },
          { id: "wc-xiaomi", name: "Xiaomi", slug: "chargers", brandQuery: "xiaomi" },
          { id: "wc-ugreen", name: "Ugreen", slug: "chargers", brandQuery: "ugreen" },
          { id: "wc-belkin", name: "Belkin", slug: "chargers", brandQuery: "belkin" },
          { id: "wc-havit", name: "Havit", slug: "chargers", brandQuery: "havit" },
          { id: "wc-hoco", name: "Hoco", slug: "chargers", brandQuery: "hoco" },
          { id: "wc-anker", name: "Anker", slug: "chargers", brandQuery: "anker" },
        ]
      },
      { 
        id: "earphones-buds", 
        name: "ყურსასმენები Buds", 
        slug: "earphones-buds", 
        productCount: 140,
        items: [
          { id: "eb-airpods", name: "Apple Airpods", slug: "wireless-earphones", brandQuery: "apple" },
          { id: "eb-galaxy", name: "Galaxy Buds", slug: "wireless-earphones", brandQuery: "samsung" },
          { id: "eb-xiaomi", name: "Xiaomi Buds", slug: "wireless-earphones", brandQuery: "xiaomi" },
          { id: "eb-sony", name: "Sony Buds", slug: "wireless-earphones", brandQuery: "sony" },
          { id: "eb-nothing", name: "Nothing Buds", slug: "wireless-earphones", brandQuery: "nothing" },
          { id: "eb-realme", name: "Realme Buds", slug: "wireless-earphones", brandQuery: "realme" },
          { id: "eb-jbl", name: "JBL Buds", slug: "wireless-earphones", brandQuery: "jbl" },
          { id: "eb-oneplus", name: "OnePlus Buds", slug: "wireless-earphones", brandQuery: "oneplus" },
          { id: "eb-marshall", name: "Marshall Buds", slug: "wireless-earphones", brandQuery: "marshall" },
          { id: "eb-motorola", name: "Motorola Buds", slug: "wireless-earphones", brandQuery: "motorola" },
          { id: "eb-vivo", name: "Vivo Buds", slug: "wireless-earphones", brandQuery: "vivo" },
          { id: "eb-accs", name: "Buds-ის აქსესუარები", slug: "wireless-earphones" },
        ]
      },
      { 
        id: "charger-adapters-main", 
        name: "დამტენი ადაპტერი", 
        slug: "charger-adapters", 
        productCount: 95,
        items: [
          { id: "ca-apple", name: "Apple Adapter", slug: "chargers", brandQuery: "apple" },
          { id: "ca-samsung", name: "Samsung Adapter", slug: "chargers", brandQuery: "samsung" },
          { id: "ca-anker", name: "Anker Adapter", slug: "chargers", brandQuery: "anker" },
          { id: "ca-spigen", name: "Spigen Adapter", slug: "chargers", brandQuery: "spigen" },
          { id: "ca-belkin", name: "Belkin Adapter", slug: "chargers", brandQuery: "belkin" },
          { id: "ca-ugreen", name: "Ugreen Adapter", slug: "chargers", brandQuery: "ugreen" },
          { id: "ca-xiaomi", name: "Xiaomi adapter", slug: "chargers", brandQuery: "xiaomi" },
          { id: "ca-baseus", name: "Baseus Adapter", slug: "chargers", brandQuery: "baseus" },
        ]
      },
      { 
        id: "mobile-cases-main", 
        name: "მობილურის ჩასადებები", 
        slug: "mobile-cases", 
        productCount: 180,
        items: [
          { id: "mc-google", name: "For Google", slug: "phone-cases", brandQuery: "google" },
          { id: "mc-realme", name: "For Realme", slug: "phone-cases", brandQuery: "realme" },
          { id: "mc-apple", name: "For Apple", slug: "phone-cases", brandQuery: "apple" },
          { id: "mc-samsung", name: "For Samsung", slug: "phone-cases", brandQuery: "samsung" },
          { id: "mc-honor", name: "For Honor", slug: "phone-cases", brandQuery: "honor" },
          { id: "mc-xiaomi", name: "For Xiaomi", slug: "phone-cases", brandQuery: "xiaomi" },
          { id: "mc-oppo", name: "For Oppo", slug: "phone-cases", brandQuery: "oppo" },
          { id: "mc-motorola", name: "For Motorola", slug: "phone-cases", brandQuery: "motorola" },
          { id: "mc-nothing", name: "For Nothing", slug: "phone-cases", brandQuery: "nothing" },
          { id: "mc-oneplus", name: "For Oneplus", slug: "phone-cases", brandQuery: "oneplus" },
        ]
      },
      { 
        id: "mobile-accessories-main", 
        name: "მობილურის აქსესუარები", 
        slug: "mobile-accessories", 
        productCount: 160,
        items: [
          { id: "ma-screen", name: "ეკრანის დამცავები", slug: "phone-cases" },
          { id: "ma-stabs", name: "მობილურის სტაბილიზატორები", slug: "phone-cases" },
          { id: "ma-connectors", name: "კონექტორები", slug: "phone-cases" },
          { id: "ma-cables", name: "კაბელები", slug: "phone-cases" },
          { id: "ma-triggers", name: "სათამაშო ტრიგერები", slug: "phone-cases" },
          { id: "ma-memory", name: "მეხსიერების ბარათი", slug: "phone-cases" },
          { id: "ma-gps", name: "GPS ტრეკერები", slug: "phone-cases" },
          { id: "ma-camera-prot", name: "კამერის დამცავები", slug: "phone-cases" },
          { id: "ma-selfie", name: "სელფის ჯოხები", slug: "phone-cases" },
          { id: "ma-otg", name: "OTG ფლეშ მეხსიერებები", slug: "phone-cases" },
        ]
      },
      { 
        id: "smartwatches-sub-main", 
        name: "სმარტ საათები", 
        slug: "smartwatches-sub", 
        productCount: 120,
        items: [
          { id: "sw-apple", name: "Apple Watch", slug: "smartwatches", brandQuery: "apple" },
          { id: "sw-galaxy", name: "Galaxy Watch", slug: "smartwatches", brandQuery: "samsung" },
          { id: "sw-xiaomi", name: "Xiaomi Watch", slug: "smartwatches", brandQuery: "xiaomi" },
          { id: "sw-google", name: "Google Watch", slug: "smartwatches", brandQuery: "google" },
          { id: "sw-amazfit", name: "Amazfit Watch", slug: "smartwatches", brandQuery: "amazfit" },
          { id: "sw-garmin", name: "Garmin Watch", slug: "smartwatches", brandQuery: "garmin" },
          { id: "sw-oneplus", name: "OnePlus Watch", slug: "smartwatches", brandQuery: "oneplus" },
          { id: "sw-nothing", name: "Nothing Watch", slug: "smartwatches", brandQuery: "nothing" },
          { id: "sw-accs", name: "საათის აქსესუარები", slug: "smartwatches" },
          { id: "sw-lagenio", name: "Lagenio Watch", slug: "smartwatches", brandQuery: "lagenio" },
        ]
      },
      { 
        id: "power-banks-main", 
        name: "Power banks", 
        slug: "power-banks", 
        productCount: 90,
        items: [
          { id: "pb-anker", name: "Anker", slug: "chargers", brandQuery: "anker" },
          { id: "pb-ugreen", name: "Ugreen", slug: "chargers", brandQuery: "ugreen" },
          { id: "pb-xiaomi", name: "Xiaomi", slug: "chargers", brandQuery: "xiaomi" },
          { id: "pb-lenovo", name: "Lenovo", slug: "chargers", brandQuery: "lenovo" },
          { id: "pb-ecoflow", name: "EcoFlow", slug: "chargers", brandQuery: "ecoflow" },
          { id: "pb-belkin", name: "Belkin", slug: "chargers", brandQuery: "belkin" },
          { id: "pb-samsung", name: "Samsung", slug: "chargers", brandQuery: "samsung" },
        ]
      },
    ],
  },
  {
    id: "tablets",
    name: "ტაბები",
    slug: "tablets",
    icon: "Tablet",
    children: [
      { 
        id: "tablet-brands", 
        name: "ბრენდები", 
        slug: "tablet-brands", 
        productCount: 50,
        items: [
          { id: "apple-ipads", name: "Apple iPads", slug: "ipads", brandQuery: "apple", productCount: 18 },
          { id: "samsung-galaxy-tab", name: "Samsung Galaxy Tab", slug: "android-tablets", brandQuery: "samsung", productCount: 20 },
          { id: "xiaomi-pad", name: "Xiaomi Pad & Redmi Pad", slug: "android-tablets", brandQuery: "xiaomi", productCount: 12 },
        ]
      },
      { 
        id: "tablet-accessories", 
        name: "ტაბის ჩასადებები & სტილუსები", 
        slug: "tablet-accessories", 
        productCount: 35,
        items: [
          { id: "apple-pencil", name: "Apple Pencil & Smart Keyboards", slug: "tablet-accessories", brandQuery: "apple", productCount: 15 },
          { id: "tablet-cases", name: "დამცავი ქეისები & შუშები", slug: "tablet-accessories", productCount: 20 },
        ]
      },
    ],
  },
  {
    id: "smartwatches",
    name: "სმარტ საათები",
    slug: "smartwatches",
    icon: "Watch",
    children: [
      { 
        id: "watch-brands", 
        name: "ბრენდები", 
        slug: "watch-brands", 
        productCount: 65,
        items: [
          { id: "apple-watch-main", name: "Apple Watch Series & Ultra", slug: "smartwatches", brandQuery: "apple", productCount: 24 },
          { id: "galaxy-watch-main", name: "Samsung Galaxy Watch", slug: "smartwatches", brandQuery: "samsung", productCount: 18 },
          { id: "xiaomi-band-main", name: "Xiaomi Smart Band & Watch", slug: "smartwatches", brandQuery: "xiaomi", productCount: 15 },
          { id: "garmin-main", name: "Garmin & Huawei Watch", slug: "smartwatches", brandQuery: "garmin", productCount: 8 },
        ]
      },
      { 
        id: "watch-straps", 
        name: "საათის სამაჯურები & დამტენები", 
        slug: "watch-straps", 
        productCount: 40,
        items: [
          { id: "silicone-straps", name: "სილიკონის & სპორტული სამაჯურები", slug: "smartwatches", productCount: 25 },
          { id: "watch-chargers", name: "უსადენო დამტენი კაბელები", slug: "smartwatches", productCount: 15 },
        ]
      },
    ],
  },
  {
    id: "laptops",
    name: "ლეპტოპები | IT",
    slug: "laptops",
    icon: "Laptop",
    children: [
      { 
        id: "laptop-brands", 
        name: "ბრენდები", 
        slug: "laptop-brands", 
        productCount: 95,
        items: [
          { id: "macbooks-main", name: "Apple MacBook Air & Pro", slug: "macbooks", brandQuery: "apple", productCount: 25 },
          { id: "asus-laptops", name: "ASUS ROG & TUF Gaming", slug: "gaming-laptops", brandQuery: "asus", productCount: 30 },
          { id: "lenovo-laptops", name: "Lenovo Legion & IdeaPad", slug: "gaming-laptops", brandQuery: "lenovo", productCount: 22 },
          { id: "dell-laptops", name: "Dell XPS & Latitude", slug: "ultrabooks", brandQuery: "dell", productCount: 18 },
        ]
      },
      { 
        id: "laptop-accs", 
        name: "ლეპტოპის აქსესუარები", 
        slug: "laptop-accs", 
        productCount: 45,
        items: [
          { id: "laptop-bags-main", name: "ლეპტოპის ჩანთები & შალითები", slug: "laptop-bags", productCount: 25 },
          { id: "usb-hubs", name: "Type-C ჰაბები & სადგურები", slug: "laptop-bags", productCount: 20 },
        ]
      },
    ],
  },
  {
    id: "audio-systems",
    name: "აუდიო სისტემა",
    slug: "audio-systems",
    icon: "Headphones",
    children: [
      { 
        id: "audio-brands", 
        name: "ბრენდები", 
        slug: "audio-brands", 
        productCount: 120,
        items: [
          { id: "brand-apple", name: "Apple", slug: "audio-systems", brandQuery: "apple" },
          { id: "brand-samsung", name: "Samsung", slug: "audio-systems", brandQuery: "samsung" },
          { id: "brand-xiaomi", name: "Xiaomi", slug: "audio-systems", brandQuery: "xiaomi" },
          { id: "brand-jbl", name: "JBL", slug: "audio-systems", brandQuery: "jbl" },
          { id: "brand-sony", name: "Sony", slug: "audio-systems", brandQuery: "sony" },
          { id: "brand-bose", name: "Bose", slug: "audio-systems", brandQuery: "bose" },
          { id: "brand-beats", name: "Beats", slug: "audio-systems", brandQuery: "beats" },
          { id: "brand-realme", name: "Realme", slug: "audio-systems", brandQuery: "realme" },
          { id: "brand-marshall", name: "Marshall", slug: "audio-systems", brandQuery: "marshall" },
        ]
      },
      { 
        id: "headphones-sub", 
        name: "ყურსასმენები", 
        slug: "headphones", 
        productCount: 95,
        items: [
          { id: "head-headphones", name: "Headphones", slug: "headphones" },
          { id: "head-buds", name: "Buds", slug: "headphones" },
          { id: "head-earphones", name: "Earphones", slug: "headphones" },
          { id: "head-gaming", name: "Gaming", slug: "headphones" },
          { id: "head-sport", name: "სპორტული", slug: "headphones" },
          { id: "head-kids", name: "საბავშვო", slug: "headphones" },
        ]
      },
      { 
        id: "audio-equipment", 
        name: "აუდიო ტექნიკა", 
        slug: "audio-equipment", 
        productCount: 75,
        items: [
          { id: "eq-portable", name: "პორტატული დინამიკები", slug: "audio-equipment" },
          { id: "eq-home", name: "სახლის დინამიკები", slug: "audio-equipment" },
          { id: "eq-turntables", name: "ფირსაკრავები", slug: "audio-equipment" },
          { id: "eq-smart", name: "სმარტ ასისტენტები", slug: "audio-equipment" },
          { id: "eq-soundbar", name: "Soundbar", slug: "audio-equipment" },
        ]
      },
      { 
        id: "microphones", 
        name: "მიკროფონები", 
        slug: "microphones", 
        productCount: 50,
        items: [
          { id: "mic-streaming", name: "სტრიმინგ მიკროფონები", slug: "microphones" },
          { id: "mic-gaming", name: "გეიმინგ მიკროფონები", slug: "microphones" },
          { id: "mic-lavalier", name: "ლაველური მიკროფონები", slug: "microphones" },
          { id: "mic-wireless", name: "უსადენო მიკროფონები", slug: "microphones" },
          { id: "mic-camera", name: "ფოტოაპარატის მიკროფონები", slug: "microphones" },
        ]
      },
      { 
        id: "audio-accessories", 
        name: "აქსესუარები", 
        slug: "audio-accessories", 
        productCount: 65,
        items: [
          { id: "acc-powerbanks", name: "Power Banks", slug: "accessories" },
          { id: "acc-extensions", name: "დენის დამაგრძელებლები", slug: "accessories" },
          { id: "acc-cables", name: "კაბელები", slug: "accessories" },
          { id: "acc-wireless-chargers", name: "უსადენო დამტენები", slug: "accessories" },
        ]
      },
      { 
        id: "charging-adapters", 
        name: "დამტენი ადაპტერი", 
        slug: "charging-adapters", 
        productCount: 80,
        items: [
          { id: "ad-apple", name: "Apple Adapter", slug: "chargers" },
          { id: "ad-samsung", name: "Samsung Adapter", slug: "chargers" },
          { id: "ad-anker", name: "Anker Adapter", slug: "chargers" },
          { id: "ad-spigen", name: "Spigen Adapter", slug: "chargers" },
          { id: "ad-belkin", name: "Belkin Adapter", slug: "chargers" },
          { id: "ad-ugreen", name: "Ugreen Adapter", slug: "chargers" },
          { id: "ad-xiaomi", name: "Xiaomi adapter", slug: "chargers" },
          { id: "ad-baseus", name: "Baseus Adapter", slug: "chargers" },
        ]
      },
    ],
  },
  {
    id: "gaming",
    name: "Gaming",
    slug: "gaming",
    icon: "Gamepad2",
    children: [
      { 
        id: "gaming-consoles-sub", 
        name: "სათამაშო კონსოლები", 
        slug: "gaming-consoles-sub", 
        productCount: 45,
        items: [
          { id: "ps5-main", name: "PlayStation 5 Slim & Digital", slug: "playstation", brandQuery: "sony", productCount: 18 },
          { id: "xbox-main", name: "Xbox Series X & Series S", slug: "xbox", brandQuery: "microsoft", productCount: 12 },
          { id: "nintendo-main", name: "Nintendo Switch OLED", slug: "nintendo", brandQuery: "nintendo", productCount: 15 },
        ]
      },
      { 
        id: "gaming-accessories", 
        name: "გეიმინგ აქსესუარები", 
        slug: "gaming-accessories", 
        productCount: 70,
        items: [
          { id: "dualsense-main", name: "DualSense & Xbox Controllers", slug: "gamepads", productCount: 30 },
          { id: "steelseries-headsets", name: "SteelSeries & Razer Headsets", slug: "gamepads", productCount: 40 },
        ]
      },
    ],
  },
  {
    id: "tv-monitors",
    name: "TV | მონიტორები",
    slug: "tv-monitors",
    icon: "Tv",
    children: [
      { 
        id: "televisions", 
        name: "ტელევიზორები", 
        slug: "televisions", 
        productCount: 50,
        items: [
          { id: "samsung-tv", name: "Samsung QLED & Neo QLED TV", slug: "monitors", brandQuery: "samsung", productCount: 20 },
          { id: "lg-tv", name: "LG OLED 4K Smart TV", slug: "monitors", brandQuery: "lg", productCount: 18 },
          { id: "xiaomi-tv", name: "Xiaomi TV Max & A Pro", slug: "monitors", brandQuery: "xiaomi", productCount: 12 },
        ]
      },
      { 
        id: "gaming-monitors", 
        name: "გეიმინგ მონიტორები", 
        slug: "gaming-monitors", 
        productCount: 40,
        items: [
          { id: "odyssey-monitors", name: "Samsung Odyssey 240Hz", slug: "monitors", brandQuery: "samsung", productCount: 15 },
          { id: "dell-monitors", name: "Dell XPS & Alienware Monitors", slug: "monitors", brandQuery: "dell", productCount: 15 },
          { id: "asus-monitors", name: "ASUS ROG Swift Gaming Monitors", slug: "monitors", brandQuery: "asus", productCount: 10 },
        ]
      },
    ],
  },
  {
    id: "photo-video",
    name: "ფოტო | ვიდეო",
    slug: "photo-video",
    icon: "Camera",
    children: [
      { 
        id: "drones-cams", 
        name: "დრონები & კამერები", 
        slug: "drones-cams", 
        productCount: 40,
        items: [
          { id: "dji-drones-all", name: "DJI Neo, Mini 4 Pro & Air 3", slug: "mini-drones", brandQuery: "dji", productCount: 15 },
          { id: "action-cameras-all", name: "GoPro Hero & Insta360 X4", slug: "action-cams", brandQuery: "gopro", productCount: 15 },
          { id: "sony-alpha", name: "Sony Alpha Mirrorless Cameras", slug: "action-cams", brandQuery: "sony", productCount: 10 },
        ]
      },
      { 
        id: "gimbals-accessories", 
        name: "სტაბილიზატორები & აქსესუარები", 
        slug: "gimbals-accessories", 
        productCount: 35,
        items: [
          { id: "osmo-pocket", name: "DJI Osmo Pocket 3 & Mobile 6", slug: "gimbals", brandQuery: "dji", productCount: 15 },
          { id: "tripods-lighting", name: "შტატივები & განათების სინათლე", slug: "camera-accessories", productCount: 20 },
        ]
      },
    ],
  },
  {
    id: "scooters",
    name: "სკუტერები",
    slug: "scooters",
    icon: "Sparkles",
    children: [
      { 
        id: "electric-scooters", 
        name: "ელექტრო სკუტერები", 
        slug: "electric-scooters", 
        productCount: 25,
        items: [
          { id: "ninebot-scooters", name: "Ninebot Segway MAX & F-Series", slug: "electric-scooters", brandQuery: "ninebot", productCount: 12 },
          { id: "xiaomi-scooters", name: "Xiaomi Electric Scooter 4 Pro", slug: "electric-scooters", brandQuery: "xiaomi", productCount: 8 },
          { id: "dualtron-scooters", name: "Dualtron & Kaabo High Power", slug: "electric-scooters", brandQuery: "dualtron", productCount: 5 },
        ]
      },
      { 
        id: "scooter-accs", 
        name: "ჩაფხუტები & დამცავები", 
        slug: "scooter-accs", 
        productCount: 20,
        items: [
          { id: "helmets", name: "უსაფრთხოების ჩაფხუტები & საკეტები", slug: "electric-scooters", productCount: 20 },
        ]
      },
    ],
  },
  {
    id: "smart-home",
    name: "ჭკვიანი სახლი",
    slug: "smart-home",
    icon: "Home",
    children: [
      { 
        id: "vacuums", 
        name: "მტვერსასრუტები", 
        slug: "vacuums", 
        productCount: 35,
        items: [
          { id: "dreame-vacuums", name: "Dreame L20 & L10 Ultra", slug: "robot-vacuums", brandQuery: "dreame", productCount: 12 },
          { id: "dyson-vacuums", name: "Dyson V15 Detect & Gen5", slug: "cordless-vacuums", brandQuery: "dyson", productCount: 13 },
          { id: "roborock-vacuums", name: "Roborock S8 & Q Revo", slug: "robot-vacuums", brandQuery: "roborock", productCount: 10 },
        ]
      },
      { 
        id: "home-appliances", 
        name: "საყოფაცხოვრებო ჭკვიანი ტექნიკა", 
        slug: "home-appliances", 
        productCount: 40,
        items: [
          { id: "coffee-makers", name: "Ariete Espresso Coffee Machines", slug: "coffee-machines", brandQuery: "ariete", productCount: 15 },
          { id: "philips-hue", name: "Philips Hue Smart Lighting", slug: "smart-lighting", brandQuery: "philips", productCount: 25 },
        ]
      },
    ],
  },
  {
    id: "beauty",
    name: "Beauty",
    slug: "beauty",
    icon: "Sparkles",
    children: [
      { 
        id: "hair-styler", 
        name: "თმის მოვლა & სტაილერი", 
        slug: "hair-styler", 
        productCount: 30,
        items: [
          { id: "dyson-airwrap", name: "Dyson Airwrap Multi-styler", slug: "beauty", brandQuery: "dyson", productCount: 12 },
          { id: "dyson-supersonic", name: "Dyson Supersonic Hair Dryer", slug: "beauty", brandQuery: "dyson", productCount: 10 },
          { id: "philips-straighteners", name: "Philips MoistureProtect Straightener", slug: "beauty", brandQuery: "philips", productCount: 8 },
        ]
      },
      { 
        id: "personal-care", 
        name: "პირადი ჰიგიენა & მოვლა", 
        slug: "personal-care", 
        productCount: 25,
        items: [
          { id: "braun-shavers", name: "Braun Series 9 Shavers & Trimmers", slug: "beauty", brandQuery: "braun", productCount: 15 },
          { id: "philips-sonicare", name: "Philips Sonicare Toothbrushes", slug: "beauty", brandQuery: "philips", productCount: 10 },
        ]
      },
    ],
  },
  {
    id: "car-accessories",
    name: "მანქანის აქსესუარები",
    slug: "car-accessories",
    icon: "Sparkles",
    children: [
      { 
        id: "car-electronics", 
        name: "ავტო ელექტრონიკა", 
        slug: "car-electronics", 
        productCount: 45,
        items: [
          { id: "dvr-cameras", name: "70mai & Xiaomi DVR ვიდეორეგისტრატორები", slug: "car-accessories", brandQuery: "xiaomi", productCount: 20 },
          { id: "fm-transmitters", name: "Baseus FM ტრანსმიტერები & დამტენები", slug: "car-accessories", brandQuery: "baseus", productCount: 25 },
        ]
      },
      { 
        id: "car-holders-cleaners", 
        name: "ავტო ჰოლდერები & მტვერსასრუტები", 
        slug: "car-holders-cleaners", 
        productCount: 30,
        items: [
          { id: "baseus-holders", name: "Baseus MagSafe Car Mounts", slug: "car-accessories", brandQuery: "baseus", productCount: 18 },
          { id: "car-vacuums", name: "პორტატული ავტო მტვერსასრუტები", slug: "car-accessories", productCount: 12 },
        ]
      },
    ],
  },
  {
    id: "accessories",
    name: "აქსესუარები",
    slug: "accessories",
    icon: "Sparkles",
    children: [
      { 
        id: "daily-accessories", 
        name: "ყოველდღიური აქსესუარები", 
        slug: "daily-accessories", 
        productCount: 50,
        items: [
          { id: "backpacks", name: "Thule & Baseus ლეპტოპის ზურგჩანთები", slug: "accessories", productCount: 25 },
          { id: "wallets-organizers", name: "საფულეები & საკაბელო ორგანაიზერები", slug: "accessories", productCount: 25 },
        ]
      },
    ],
  },
];
