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
        id: "mobile-brands", 
        name: "მობილურის ბრენდები", 
        slug: "mobile-brands", 
        productCount: 130,
        items: [
          { id: "apple-phones", name: "Apple iPhones", slug: "iphones", brandQuery: "apple", productCount: 32 },
          { id: "samsung-phones", name: "Samsung Galaxy", slug: "androids", brandQuery: "samsung", productCount: 45 },
          { id: "xiaomi-phones", name: "Xiaomi & Redmi", slug: "androids", brandQuery: "xiaomi", productCount: 28 },
          { id: "poco-phones", name: "POCO Series", slug: "androids", brandQuery: "poco", productCount: 15 },
          { id: "google-pixel", name: "Google Pixel", slug: "androids", brandQuery: "google", productCount: 12 },
        ]
      },
      { 
        id: "earphones", 
        name: "ყურსასმენები", 
        slug: "earphones", 
        productCount: 95,
        items: [
          { id: "airpods", name: "Apple AirPods", slug: "wireless-earphones", brandQuery: "apple", productCount: 18 },
          { id: "galaxy-buds", name: "Samsung Galaxy Buds", slug: "wireless-earphones", brandQuery: "samsung", productCount: 16 },
          { id: "xiaomi-buds", name: "Xiaomi Buds", slug: "wireless-earphones", brandQuery: "xiaomi", productCount: 22 },
          { id: "sony-buds", name: "Sony Wireless Buds", slug: "wireless-earphones", brandQuery: "sony", productCount: 14 },
          { id: "marshall-earphones", name: "Marshall Motif & Minor", slug: "wireless-earphones", brandQuery: "marshall", productCount: 10 },
        ]
      },
      { 
        id: "mobile-cases", 
        name: "მობილურის ჩასადებები", 
        slug: "mobile-cases", 
        productCount: 150,
        items: [
          { id: "magsafe-cases", name: "MagSafe ჩასადებები", slug: "phone-cases", productCount: 45 },
          { id: "clear-cases", name: "გამჭვირვალე სილიკონები", slug: "phone-cases", productCount: 35 },
          { id: "leather-cases", name: "ტყავის ქეისები", slug: "phone-cases", productCount: 25 },
          { id: "armor-cases", name: "დარტყმაგამძლე ქეისები", slug: "phone-cases", productCount: 35 },
        ]
      },
      { 
        id: "smartwatches-sub", 
        name: "სმარტ საათები", 
        slug: "smartwatches-sub", 
        productCount: 65,
        items: [
          { id: "apple-watch", name: "Apple Watch Series & Ultra", slug: "smartwatches", brandQuery: "apple", productCount: 24 },
          { id: "galaxy-watch", name: "Samsung Galaxy Watch", slug: "smartwatches", brandQuery: "samsung", productCount: 18 },
          { id: "smart-bands", name: "Xiaomi Smart Band", slug: "smartwatches", brandQuery: "xiaomi", productCount: 12 },
          { id: "garmin-watch", name: "Garmin & Huawei Watch", slug: "smartwatches", brandQuery: "garmin", productCount: 8 },
        ]
      },
      { 
        id: "wireless-chargers", 
        name: "უსადენო დამტენები", 
        slug: "wireless-chargers", 
        productCount: 35,
        items: [
          { id: "magsafe-chargers", name: "Apple MagSafe Charger", slug: "chargers", brandQuery: "apple", productCount: 15 },
          { id: "samsung-wireless-pad", name: "Samsung Wireless Fast Charger", slug: "chargers", brandQuery: "samsung", productCount: 12 },
          { id: "3in1-charging-stations", name: "3in1 Charging Stations", slug: "chargers", productCount: 8 },
        ]
      },
      { 
        id: "charger-adapters", 
        name: "დამტენი ადაპტერები", 
        slug: "charger-adapters", 
        productCount: 85,
        items: [
          { id: "fast-adapters-20w", name: "20W / 25W Fast Adapters", slug: "chargers", productCount: 40 },
          { id: "turbo-adapters-67w", name: "45W / 67W Turbo Chargers", slug: "chargers", productCount: 25 },
          { id: "usbc-lightning-cables", name: "Type-C & Lightning Cables", slug: "chargers", productCount: 20 },
        ]
      },
      { 
        id: "mobile-accessories", 
        name: "მობილურის აქსესუარები", 
        slug: "mobile-accessories", 
        productCount: 90,
        items: [
          { id: "screen-protectors", name: "ეკრანის ბრონირებული დამცავები", slug: "phone-cases", productCount: 40 },
          { id: "car-holders", name: "მანქანის მობილურის სამაგრები", slug: "phone-cases", productCount: 30 },
          { id: "selfie-sticks", name: "სელფის ჯოხები & შტატივები", slug: "phone-cases", productCount: 20 },
        ]
      },
      { 
        id: "powerbanks", 
        name: "პოვერ ბანკები", 
        slug: "powerbanks", 
        productCount: 40,
        items: [
          { id: "anker-powerbanks", name: "Anker Powerbanks", slug: "chargers", brandQuery: "anker", productCount: 15 },
          { id: "xiaomi-powerbanks", name: "Xiaomi Powerbanks 10000 / 20000mAh", slug: "chargers", brandQuery: "xiaomi", productCount: 18 },
          { id: "magsafe-battery", name: "MagSafe Battery Packs", slug: "chargers", brandQuery: "apple", productCount: 7 },
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
        name: "ტაბების ბრენდები", 
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
        name: "საათების ბრენდები", 
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
    name: "ლეპტოპები",
    slug: "laptops",
    icon: "Laptop",
    children: [
      { 
        id: "laptop-brands", 
        name: "ლეპტოპების ბრენდები", 
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
        id: "portable-speakers", 
        name: "პორტატული დინამიკები", 
        slug: "portable-speakers", 
        productCount: 60,
        items: [
          { id: "jbl-speakers", name: "JBL Boombox, Charge & Flip", slug: "speakers", brandQuery: "jbl", productCount: 25 },
          { id: "marshall-speakers", name: "Marshall Stanmore, Acton & Emberton", slug: "speakers", brandQuery: "marshall", productCount: 20 },
          { id: "bose-speakers", name: "Bose SoundLink & Portable", slug: "speakers", brandQuery: "bose", productCount: 15 },
        ]
      },
      { 
        id: "soundbars-home", 
        name: "საუნდბარები & სახლის აუდიო", 
        slug: "soundbars-home", 
        productCount: 25,
        items: [
          { id: "sony-soundbars", name: "Sony Soundbars 5.1 & Dolby Atmos", slug: "soundbars", brandQuery: "sony", productCount: 12 },
          { id: "jbl-soundbars", name: "JBL Cinema Soundbars", slug: "soundbars", brandQuery: "jbl", productCount: 13 },
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
