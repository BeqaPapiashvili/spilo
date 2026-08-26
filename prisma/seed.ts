import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "mysql://root:@127.0.0.1:3306/spilo_db";
const adapter = new PrismaMariaDb(connectionString);

const prisma = new PrismaClient({ adapter });

const SEED_CATEGORIES = [
  {
    "id": "mobiles",
    "name": "მობილურები",
    "slug": "mobiles",
    "icon": "Smartphone",
    "children": [
      {
        "id": "mobiles-brands",
        "name": "მობილურის ბრენდები",
        "slug": "mobiles-brands",
        "productCount": 210,
        "items": [
          {
            "id": "mob-apple",
            "name": "Apple",
            "slug": "iphones",
            "brandQuery": "apple"
          },
          {
            "id": "mob-samsung",
            "name": "Samsung",
            "slug": "androids",
            "brandQuery": "samsung"
          },
          {
            "id": "mob-xiaomi",
            "name": "Xiaomi",
            "slug": "androids",
            "brandQuery": "xiaomi"
          },
          {
            "id": "mob-poco",
            "name": "Poco",
            "slug": "androids",
            "brandQuery": "poco"
          },
          {
            "id": "mob-vivo",
            "name": "Vivo",
            "slug": "androids",
            "brandQuery": "vivo"
          },
          {
            "id": "mob-google",
            "name": "Google",
            "slug": "androids",
            "brandQuery": "google"
          },
          {
            "id": "mob-nothing",
            "name": "Nothing",
            "slug": "androids",
            "brandQuery": "nothing"
          },
          {
            "id": "mob-oneplus",
            "name": "OnePlus",
            "slug": "androids",
            "brandQuery": "oneplus"
          },
          {
            "id": "mob-realme",
            "name": "Realme",
            "slug": "androids",
            "brandQuery": "realme"
          },
          {
            "id": "mob-oppo",
            "name": "Oppo",
            "slug": "androids",
            "brandQuery": "oppo"
          },
          {
            "id": "mob-zte",
            "name": "ZTE",
            "slug": "androids",
            "brandQuery": "zte"
          },
          {
            "id": "mob-motorola",
            "name": "Motorola",
            "slug": "androids",
            "brandQuery": "motorola"
          },
          {
            "id": "mob-blackview",
            "name": "Blackview",
            "slug": "androids",
            "brandQuery": "blackview"
          }
        ]
      },
      {
        "id": "wireless-chargers-sub",
        "name": "უსადენო დამტენები",
        "slug": "wireless-chargers",
        "productCount": 85,
        "items": [
          {
            "id": "wc-apple",
            "name": "Apple",
            "slug": "chargers",
            "brandQuery": "apple"
          },
          {
            "id": "wc-samsung",
            "name": "Samsung",
            "slug": "chargers",
            "brandQuery": "samsung"
          },
          {
            "id": "wc-xiaomi",
            "name": "Xiaomi",
            "slug": "chargers",
            "brandQuery": "xiaomi"
          },
          {
            "id": "wc-ugreen",
            "name": "Ugreen",
            "slug": "chargers",
            "brandQuery": "ugreen"
          },
          {
            "id": "wc-belkin",
            "name": "Belkin",
            "slug": "chargers",
            "brandQuery": "belkin"
          },
          {
            "id": "wc-havit",
            "name": "Havit",
            "slug": "chargers",
            "brandQuery": "havit"
          },
          {
            "id": "wc-hoco",
            "name": "Hoco",
            "slug": "chargers",
            "brandQuery": "hoco"
          },
          {
            "id": "wc-anker",
            "name": "Anker",
            "slug": "chargers",
            "brandQuery": "anker"
          }
        ]
      },
      {
        "id": "earphones-buds",
        "name": "ყურსასმენები Buds",
        "slug": "earphones-buds",
        "productCount": 140,
        "items": [
          {
            "id": "eb-airpods",
            "name": "Apple Airpods",
            "slug": "wireless-earphones",
            "brandQuery": "apple"
          },
          {
            "id": "eb-galaxy",
            "name": "Galaxy Buds",
            "slug": "wireless-earphones",
            "brandQuery": "samsung"
          },
          {
            "id": "eb-xiaomi",
            "name": "Xiaomi Buds",
            "slug": "wireless-earphones",
            "brandQuery": "xiaomi"
          },
          {
            "id": "eb-sony",
            "name": "Sony Buds",
            "slug": "wireless-earphones",
            "brandQuery": "sony"
          },
          {
            "id": "eb-nothing",
            "name": "Nothing Buds",
            "slug": "wireless-earphones",
            "brandQuery": "nothing"
          },
          {
            "id": "eb-realme",
            "name": "Realme Buds",
            "slug": "wireless-earphones",
            "brandQuery": "realme"
          },
          {
            "id": "eb-jbl",
            "name": "JBL Buds",
            "slug": "wireless-earphones",
            "brandQuery": "jbl"
          },
          {
            "id": "eb-oneplus",
            "name": "OnePlus Buds",
            "slug": "wireless-earphones",
            "brandQuery": "oneplus"
          },
          {
            "id": "eb-marshall",
            "name": "Marshall Buds",
            "slug": "wireless-earphones",
            "brandQuery": "marshall"
          },
          {
            "id": "eb-motorola",
            "name": "Motorola Buds",
            "slug": "wireless-earphones",
            "brandQuery": "motorola"
          },
          {
            "id": "eb-vivo",
            "name": "Vivo Buds",
            "slug": "wireless-earphones",
            "brandQuery": "vivo"
          },
          {
            "id": "eb-accs",
            "name": "Buds-ის აქსესუარები",
            "slug": "wireless-earphones"
          }
        ]
      },
      {
        "id": "charger-adapters-main",
        "name": "დამტენი ადაპტერი",
        "slug": "charger-adapters",
        "productCount": 95,
        "items": [
          {
            "id": "ca-apple",
            "name": "Apple Adapter",
            "slug": "chargers",
            "brandQuery": "apple"
          },
          {
            "id": "ca-samsung",
            "name": "Samsung Adapter",
            "slug": "chargers",
            "brandQuery": "samsung"
          },
          {
            "id": "ca-anker",
            "name": "Anker Adapter",
            "slug": "chargers",
            "brandQuery": "anker"
          },
          {
            "id": "ca-spigen",
            "name": "Spigen Adapter",
            "slug": "chargers",
            "brandQuery": "spigen"
          },
          {
            "id": "ca-belkin",
            "name": "Belkin Adapter",
            "slug": "chargers",
            "brandQuery": "belkin"
          },
          {
            "id": "ca-ugreen",
            "name": "Ugreen Adapter",
            "slug": "chargers",
            "brandQuery": "ugreen"
          },
          {
            "id": "ca-xiaomi",
            "name": "Xiaomi adapter",
            "slug": "chargers",
            "brandQuery": "xiaomi"
          },
          {
            "id": "ca-baseus",
            "name": "Baseus Adapter",
            "slug": "chargers",
            "brandQuery": "baseus"
          }
        ]
      },
      {
        "id": "mobile-cases-main",
        "name": "მობილურის ჩასადებები",
        "slug": "mobile-cases",
        "productCount": 180,
        "items": [
          {
            "id": "mc-google",
            "name": "For Google",
            "slug": "phone-cases",
            "brandQuery": "google"
          },
          {
            "id": "mc-realme",
            "name": "For Realme",
            "slug": "phone-cases",
            "brandQuery": "realme"
          },
          {
            "id": "mc-apple",
            "name": "For Apple",
            "slug": "phone-cases",
            "brandQuery": "apple"
          },
          {
            "id": "mc-samsung",
            "name": "For Samsung",
            "slug": "phone-cases",
            "brandQuery": "samsung"
          },
          {
            "id": "mc-honor",
            "name": "For Honor",
            "slug": "phone-cases",
            "brandQuery": "honor"
          },
          {
            "id": "mc-xiaomi",
            "name": "For Xiaomi",
            "slug": "phone-cases",
            "brandQuery": "xiaomi"
          },
          {
            "id": "mc-oppo",
            "name": "For Oppo",
            "slug": "phone-cases",
            "brandQuery": "oppo"
          },
          {
            "id": "mc-motorola",
            "name": "For Motorola",
            "slug": "phone-cases",
            "brandQuery": "motorola"
          },
          {
            "id": "mc-nothing",
            "name": "For Nothing",
            "slug": "phone-cases",
            "brandQuery": "nothing"
          },
          {
            "id": "mc-oneplus",
            "name": "For Oneplus",
            "slug": "phone-cases",
            "brandQuery": "oneplus"
          }
        ]
      },
      {
        "id": "mobile-accessories-main",
        "name": "მობილურის აქსესუარები",
        "slug": "mobile-accessories",
        "productCount": 160,
        "items": [
          {
            "id": "ma-screen",
            "name": "ეკრანის დამცავები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-stabs",
            "name": "მობილურის სტაბილიზატორები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-connectors",
            "name": "კონექტორები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-cables",
            "name": "კაბელები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-triggers",
            "name": "სათამაშო ტრიგერები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-memory",
            "name": "მეხსიერების ბარათი",
            "slug": "phone-cases"
          },
          {
            "id": "ma-gps",
            "name": "GPS ტრეკერები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-camera-prot",
            "name": "კამერის დამცავები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-selfie",
            "name": "სელფის ჯოხები",
            "slug": "phone-cases"
          },
          {
            "id": "ma-otg",
            "name": "OTG ფლეშ მეხსიერებები",
            "slug": "phone-cases"
          }
        ]
      },
      {
        "id": "smartwatches-sub-main",
        "name": "სმარტ საათები",
        "slug": "smartwatches-sub",
        "productCount": 120,
        "items": [
          {
            "id": "sw-apple",
            "name": "Apple Watch",
            "slug": "smartwatches",
            "brandQuery": "apple"
          },
          {
            "id": "sw-galaxy",
            "name": "Galaxy Watch",
            "slug": "smartwatches",
            "brandQuery": "samsung"
          },
          {
            "id": "sw-xiaomi",
            "name": "Xiaomi Watch",
            "slug": "smartwatches",
            "brandQuery": "xiaomi"
          },
          {
            "id": "sw-google",
            "name": "Google Watch",
            "slug": "smartwatches",
            "brandQuery": "google"
          },
          {
            "id": "sw-amazfit",
            "name": "Amazfit Watch",
            "slug": "smartwatches",
            "brandQuery": "amazfit"
          },
          {
            "id": "sw-garmin",
            "name": "Garmin Watch",
            "slug": "smartwatches",
            "brandQuery": "garmin"
          },
          {
            "id": "sw-oneplus",
            "name": "OnePlus Watch",
            "slug": "smartwatches",
            "brandQuery": "oneplus"
          },
          {
            "id": "sw-nothing",
            "name": "Nothing Watch",
            "slug": "smartwatches",
            "brandQuery": "nothing"
          },
          {
            "id": "sw-accs",
            "name": "საათის აქსესუარები",
            "slug": "smartwatches"
          },
          {
            "id": "sw-lagenio",
            "name": "Lagenio Watch",
            "slug": "smartwatches",
            "brandQuery": "lagenio"
          }
        ]
      },
      {
        "id": "power-banks-main",
        "name": "Power banks",
        "slug": "power-banks",
        "productCount": 90,
        "items": [
          {
            "id": "pb-anker",
            "name": "Anker",
            "slug": "chargers",
            "brandQuery": "anker"
          },
          {
            "id": "pb-ugreen",
            "name": "Ugreen",
            "slug": "chargers",
            "brandQuery": "ugreen"
          },
          {
            "id": "pb-xiaomi",
            "name": "Xiaomi",
            "slug": "chargers",
            "brandQuery": "xiaomi"
          },
          {
            "id": "pb-lenovo",
            "name": "Lenovo",
            "slug": "chargers",
            "brandQuery": "lenovo"
          },
          {
            "id": "pb-ecoflow",
            "name": "EcoFlow",
            "slug": "chargers",
            "brandQuery": "ecoflow"
          },
          {
            "id": "pb-belkin",
            "name": "Belkin",
            "slug": "chargers",
            "brandQuery": "belkin"
          },
          {
            "id": "pb-samsung",
            "name": "Samsung",
            "slug": "chargers",
            "brandQuery": "samsung"
          }
        ]
      }
    ]
  },
  {
    "id": "tablets",
    "name": "ტაბები",
    "slug": "tablets",
    "icon": "Tablet",
    "children": [
      {
        "id": "tablet-brands",
        "name": "ბრენდები",
        "slug": "tablet-brands",
        "productCount": 50,
        "items": [
          {
            "id": "apple-ipads",
            "name": "Apple iPads",
            "slug": "ipads",
            "brandQuery": "apple",
            "productCount": 18
          },
          {
            "id": "samsung-galaxy-tab",
            "name": "Samsung Galaxy Tab",
            "slug": "android-tablets",
            "brandQuery": "samsung",
            "productCount": 20
          },
          {
            "id": "xiaomi-pad",
            "name": "Xiaomi Pad & Redmi Pad",
            "slug": "android-tablets",
            "brandQuery": "xiaomi",
            "productCount": 12
          }
        ]
      },
      {
        "id": "tablet-accessories",
        "name": "ტაბის ჩასადებები & სტილუსები",
        "slug": "tablet-accessories",
        "productCount": 35,
        "items": [
          {
            "id": "apple-pencil",
            "name": "Apple Pencil & Smart Keyboards",
            "slug": "tablet-accessories",
            "brandQuery": "apple",
            "productCount": 15
          },
          {
            "id": "tablet-cases",
            "name": "დამცავი ქეისები & შუშები",
            "slug": "tablet-accessories",
            "productCount": 20
          }
        ]
      }
    ]
  },
  {
    "id": "smartwatches",
    "name": "სმარტ საათები",
    "slug": "smartwatches",
    "icon": "Watch",
    "children": [
      {
        "id": "watch-brands",
        "name": "ბრენდები",
        "slug": "watch-brands",
        "productCount": 65,
        "items": [
          {
            "id": "apple-watch-main",
            "name": "Apple Watch Series & Ultra",
            "slug": "smartwatches",
            "brandQuery": "apple",
            "productCount": 24
          },
          {
            "id": "galaxy-watch-main",
            "name": "Samsung Galaxy Watch",
            "slug": "smartwatches",
            "brandQuery": "samsung",
            "productCount": 18
          },
          {
            "id": "xiaomi-band-main",
            "name": "Xiaomi Smart Band & Watch",
            "slug": "smartwatches",
            "brandQuery": "xiaomi",
            "productCount": 15
          },
          {
            "id": "garmin-main",
            "name": "Garmin & Huawei Watch",
            "slug": "smartwatches",
            "brandQuery": "garmin",
            "productCount": 8
          }
        ]
      },
      {
        "id": "watch-straps",
        "name": "საათის სამაჯურები & დამტენები",
        "slug": "watch-straps",
        "productCount": 40,
        "items": [
          {
            "id": "silicone-straps",
            "name": "სილიკონის & სპორტული სამაჯურები",
            "slug": "smartwatches",
            "productCount": 25
          },
          {
            "id": "watch-chargers",
            "name": "უსადენო დამტენი კაბელები",
            "slug": "smartwatches",
            "productCount": 15
          }
        ]
      }
    ]
  },
  {
    "id": "laptops",
    "name": "ლეპტოპები | IT",
    "slug": "laptops",
    "icon": "Laptop",
    "children": [
      {
        "id": "laptop-brands",
        "name": "ბრენდები",
        "slug": "laptop-brands",
        "productCount": 95,
        "items": [
          {
            "id": "macbooks-main",
            "name": "Apple MacBook Air & Pro",
            "slug": "macbooks",
            "brandQuery": "apple",
            "productCount": 25
          },
          {
            "id": "asus-laptops",
            "name": "ASUS ROG & TUF Gaming",
            "slug": "gaming-laptops",
            "brandQuery": "asus",
            "productCount": 30
          },
          {
            "id": "lenovo-laptops",
            "name": "Lenovo Legion & IdeaPad",
            "slug": "gaming-laptops",
            "brandQuery": "lenovo",
            "productCount": 22
          },
          {
            "id": "dell-laptops",
            "name": "Dell XPS & Latitude",
            "slug": "ultrabooks",
            "brandQuery": "dell",
            "productCount": 18
          }
        ]
      },
      {
        "id": "laptop-accs",
        "name": "ლეპტოპის აქსესუარები",
        "slug": "laptop-accs",
        "productCount": 45,
        "items": [
          {
            "id": "laptop-bags-main",
            "name": "ლეპტოპის ჩანთები & შალითები",
            "slug": "laptop-bags",
            "productCount": 25
          },
          {
            "id": "usb-hubs",
            "name": "Type-C ჰაბები & სადგურები",
            "slug": "laptop-bags",
            "productCount": 20
          }
        ]
      }
    ]
  },
  {
    "id": "audio-systems",
    "name": "აუდიო სისტემა",
    "slug": "audio-systems",
    "icon": "Headphones",
    "children": [
      {
        "id": "audio-brands",
        "name": "ბრენდები",
        "slug": "audio-brands",
        "productCount": 120,
        "items": [
          {
            "id": "brand-apple",
            "name": "Apple",
            "slug": "audio-systems",
            "brandQuery": "apple"
          },
          {
            "id": "brand-samsung",
            "name": "Samsung",
            "slug": "audio-systems",
            "brandQuery": "samsung"
          },
          {
            "id": "brand-xiaomi",
            "name": "Xiaomi",
            "slug": "audio-systems",
            "brandQuery": "xiaomi"
          },
          {
            "id": "brand-jbl",
            "name": "JBL",
            "slug": "audio-systems",
            "brandQuery": "jbl"
          },
          {
            "id": "brand-sony",
            "name": "Sony",
            "slug": "audio-systems",
            "brandQuery": "sony"
          },
          {
            "id": "brand-bose",
            "name": "Bose",
            "slug": "audio-systems",
            "brandQuery": "bose"
          },
          {
            "id": "brand-beats",
            "name": "Beats",
            "slug": "audio-systems",
            "brandQuery": "beats"
          },
          {
            "id": "brand-realme",
            "name": "Realme",
            "slug": "audio-systems",
            "brandQuery": "realme"
          },
          {
            "id": "brand-marshall",
            "name": "Marshall",
            "slug": "audio-systems",
            "brandQuery": "marshall"
          }
        ]
      },
      {
        "id": "headphones-sub",
        "name": "ყურსასმენები",
        "slug": "headphones",
        "productCount": 95,
        "items": [
          {
            "id": "head-headphones",
            "name": "Headphones",
            "slug": "headphones"
          },
          {
            "id": "head-buds",
            "name": "Buds",
            "slug": "headphones"
          },
          {
            "id": "head-earphones",
            "name": "Earphones",
            "slug": "headphones"
          },
          {
            "id": "head-gaming",
            "name": "Gaming",
            "slug": "headphones"
          },
          {
            "id": "head-sport",
            "name": "სპორტული",
            "slug": "headphones"
          },
          {
            "id": "head-kids",
            "name": "საბავშვო",
            "slug": "headphones"
          }
        ]
      },
      {
        "id": "audio-equipment",
        "name": "აუდიო ტექნიკა",
        "slug": "audio-equipment",
        "productCount": 75,
        "items": [
          {
            "id": "eq-portable",
            "name": "პორტატული დინამიკები",
            "slug": "audio-equipment"
          },
          {
            "id": "eq-home",
            "name": "სახლის დინამიკები",
            "slug": "audio-equipment"
          },
          {
            "id": "eq-turntables",
            "name": "ფირსაკრავები",
            "slug": "audio-equipment"
          },
          {
            "id": "eq-smart",
            "name": "სმარტ ასისტენტები",
            "slug": "audio-equipment"
          },
          {
            "id": "eq-soundbar",
            "name": "Soundbar",
            "slug": "audio-equipment"
          }
        ]
      },
      {
        "id": "microphones",
        "name": "მიკროფონები",
        "slug": "microphones",
        "productCount": 50,
        "items": [
          {
            "id": "mic-streaming",
            "name": "სტრიმინგ მიკროფონები",
            "slug": "microphones"
          },
          {
            "id": "mic-gaming",
            "name": "გეიმინგ მიკროფონები",
            "slug": "microphones"
          },
          {
            "id": "mic-lavalier",
            "name": "ლაველური მიკროფონები",
            "slug": "microphones"
          },
          {
            "id": "mic-wireless",
            "name": "უსადენო მიკროფონები",
            "slug": "microphones"
          },
          {
            "id": "mic-camera",
            "name": "ფოტოაპარატის მიკროფონები",
            "slug": "microphones"
          }
        ]
      },
      {
        "id": "audio-accessories",
        "name": "აქსესუარები",
        "slug": "audio-accessories",
        "productCount": 65,
        "items": [
          {
            "id": "acc-powerbanks",
            "name": "Power Banks",
            "slug": "accessories"
          },
          {
            "id": "acc-extensions",
            "name": "დენის დამაგრძელებლები",
            "slug": "accessories"
          },
          {
            "id": "acc-cables",
            "name": "კაბელები",
            "slug": "accessories"
          },
          {
            "id": "acc-wireless-chargers",
            "name": "უსადენო დამტენები",
            "slug": "accessories"
          }
        ]
      },
      {
        "id": "charging-adapters",
        "name": "დამტენი ადაპტერი",
        "slug": "charging-adapters",
        "productCount": 80,
        "items": [
          {
            "id": "ad-apple",
            "name": "Apple Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-samsung",
            "name": "Samsung Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-anker",
            "name": "Anker Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-spigen",
            "name": "Spigen Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-belkin",
            "name": "Belkin Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-ugreen",
            "name": "Ugreen Adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-xiaomi",
            "name": "Xiaomi adapter",
            "slug": "chargers"
          },
          {
            "id": "ad-baseus",
            "name": "Baseus Adapter",
            "slug": "chargers"
          }
        ]
      }
    ]
  },
  {
    "id": "gaming",
    "name": "Gaming",
    "slug": "gaming",
    "icon": "Gamepad2",
    "children": [
      {
        "id": "gaming-consoles-sub",
        "name": "სათამაშო კონსოლები",
        "slug": "gaming-consoles-sub",
        "productCount": 45,
        "items": [
          {
            "id": "ps5-main",
            "name": "PlayStation 5 Slim & Digital",
            "slug": "playstation",
            "brandQuery": "sony",
            "productCount": 18
          },
          {
            "id": "xbox-main",
            "name": "Xbox Series X & Series S",
            "slug": "xbox",
            "brandQuery": "microsoft",
            "productCount": 12
          },
          {
            "id": "nintendo-main",
            "name": "Nintendo Switch OLED",
            "slug": "nintendo",
            "brandQuery": "nintendo",
            "productCount": 15
          }
        ]
      },
      {
        "id": "gaming-accessories",
        "name": "გეიმინგ აქსესუარები",
        "slug": "gaming-accessories",
        "productCount": 70,
        "items": [
          {
            "id": "dualsense-main",
            "name": "DualSense & Xbox Controllers",
            "slug": "gamepads",
            "productCount": 30
          },
          {
            "id": "steelseries-headsets",
            "name": "SteelSeries & Razer Headsets",
            "slug": "gamepads",
            "productCount": 40
          }
        ]
      }
    ]
  },
  {
    "id": "tv-monitors",
    "name": "TV | მონიტორები",
    "slug": "tv-monitors",
    "icon": "Tv",
    "children": [
      {
        "id": "televisions",
        "name": "ტელევიზორები",
        "slug": "televisions",
        "productCount": 50,
        "items": [
          {
            "id": "samsung-tv",
            "name": "Samsung QLED & Neo QLED TV",
            "slug": "monitors",
            "brandQuery": "samsung",
            "productCount": 20
          },
          {
            "id": "lg-tv",
            "name": "LG OLED 4K Smart TV",
            "slug": "monitors",
            "brandQuery": "lg",
            "productCount": 18
          },
          {
            "id": "xiaomi-tv",
            "name": "Xiaomi TV Max & A Pro",
            "slug": "monitors",
            "brandQuery": "xiaomi",
            "productCount": 12
          }
        ]
      },
      {
        "id": "gaming-monitors",
        "name": "გეიმინგ მონიტორები",
        "slug": "gaming-monitors",
        "productCount": 40,
        "items": [
          {
            "id": "odyssey-monitors",
            "name": "Samsung Odyssey 240Hz",
            "slug": "monitors",
            "brandQuery": "samsung",
            "productCount": 15
          },
          {
            "id": "dell-monitors",
            "name": "Dell XPS & Alienware Monitors",
            "slug": "monitors",
            "brandQuery": "dell",
            "productCount": 15
          },
          {
            "id": "asus-monitors",
            "name": "ASUS ROG Swift Gaming Monitors",
            "slug": "monitors",
            "brandQuery": "asus",
            "productCount": 10
          }
        ]
      }
    ]
  },
  {
    "id": "photo-video",
    "name": "ფოტო | ვიდეო",
    "slug": "photo-video",
    "icon": "Camera",
    "children": [
      {
        "id": "drones-cams",
        "name": "დრონები & კამერები",
        "slug": "drones-cams",
        "productCount": 40,
        "items": [
          {
            "id": "dji-drones-all",
            "name": "DJI Neo, Mini 4 Pro & Air 3",
            "slug": "mini-drones",
            "brandQuery": "dji",
            "productCount": 15
          },
          {
            "id": "action-cameras-all",
            "name": "GoPro Hero & Insta360 X4",
            "slug": "action-cams",
            "brandQuery": "gopro",
            "productCount": 15
          },
          {
            "id": "sony-alpha",
            "name": "Sony Alpha Mirrorless Cameras",
            "slug": "action-cams",
            "brandQuery": "sony",
            "productCount": 10
          }
        ]
      },
      {
        "id": "gimbals-accessories",
        "name": "სტაბილიზატორები & აქსესუარები",
        "slug": "gimbals-accessories",
        "productCount": 35,
        "items": [
          {
            "id": "osmo-pocket",
            "name": "DJI Osmo Pocket 3 & Mobile 6",
            "slug": "gimbals",
            "brandQuery": "dji",
            "productCount": 15
          },
          {
            "id": "tripods-lighting",
            "name": "შტატივები & განათების სინათლე",
            "slug": "camera-accessories",
            "productCount": 20
          }
        ]
      }
    ]
  },
  {
    "id": "scooters",
    "name": "სკუტერები",
    "slug": "scooters",
    "icon": "Sparkles",
    "children": [
      {
        "id": "electric-scooters",
        "name": "ელექტრო სკუტერები",
        "slug": "electric-scooters",
        "productCount": 25,
        "items": [
          {
            "id": "ninebot-scooters",
            "name": "Ninebot Segway MAX & F-Series",
            "slug": "electric-scooters",
            "brandQuery": "ninebot",
            "productCount": 12
          },
          {
            "id": "xiaomi-scooters",
            "name": "Xiaomi Electric Scooter 4 Pro",
            "slug": "electric-scooters",
            "brandQuery": "xiaomi",
            "productCount": 8
          },
          {
            "id": "dualtron-scooters",
            "name": "Dualtron & Kaabo High Power",
            "slug": "electric-scooters",
            "brandQuery": "dualtron",
            "productCount": 5
          }
        ]
      },
      {
        "id": "scooter-accs",
        "name": "ჩაფხუტები & დამცავები",
        "slug": "scooter-accs",
        "productCount": 20,
        "items": [
          {
            "id": "helmets",
            "name": "უსაფრთხოების ჩაფხუტები & საკეტები",
            "slug": "electric-scooters",
            "productCount": 20
          }
        ]
      }
    ]
  },
  {
    "id": "smart-home",
    "name": "ჭკვიანი სახლი",
    "slug": "smart-home",
    "icon": "Home",
    "children": [
      {
        "id": "vacuums",
        "name": "მტვერსასრუტები",
        "slug": "vacuums",
        "productCount": 35,
        "items": [
          {
            "id": "dreame-vacuums",
            "name": "Dreame L20 & L10 Ultra",
            "slug": "robot-vacuums",
            "brandQuery": "dreame",
            "productCount": 12
          },
          {
            "id": "dyson-vacuums",
            "name": "Dyson V15 Detect & Gen5",
            "slug": "cordless-vacuums",
            "brandQuery": "dyson",
            "productCount": 13
          },
          {
            "id": "roborock-vacuums",
            "name": "Roborock S8 & Q Revo",
            "slug": "robot-vacuums",
            "brandQuery": "roborock",
            "productCount": 10
          }
        ]
      },
      {
        "id": "home-appliances",
        "name": "საყოფაცხოვრებო ჭკვიანი ტექნიკა",
        "slug": "home-appliances",
        "productCount": 40,
        "items": [
          {
            "id": "coffee-makers",
            "name": "Ariete Espresso Coffee Machines",
            "slug": "coffee-machines",
            "brandQuery": "ariete",
            "productCount": 15
          },
          {
            "id": "philips-hue",
            "name": "Philips Hue Smart Lighting",
            "slug": "smart-lighting",
            "brandQuery": "philips",
            "productCount": 25
          }
        ]
      }
    ]
  },
  {
    "id": "beauty",
    "name": "Beauty",
    "slug": "beauty",
    "icon": "Sparkles",
    "children": [
      {
        "id": "hair-styler",
        "name": "თმის მოვლა & სტაილერი",
        "slug": "hair-styler",
        "productCount": 30,
        "items": [
          {
            "id": "dyson-airwrap",
            "name": "Dyson Airwrap Multi-styler",
            "slug": "beauty",
            "brandQuery": "dyson",
            "productCount": 12
          },
          {
            "id": "dyson-supersonic",
            "name": "Dyson Supersonic Hair Dryer",
            "slug": "beauty",
            "brandQuery": "dyson",
            "productCount": 10
          },
          {
            "id": "philips-straighteners",
            "name": "Philips MoistureProtect Straightener",
            "slug": "beauty",
            "brandQuery": "philips",
            "productCount": 8
          }
        ]
      },
      {
        "id": "personal-care",
        "name": "პირადი ჰიგიენა & მოვლა",
        "slug": "personal-care",
        "productCount": 25,
        "items": [
          {
            "id": "braun-shavers",
            "name": "Braun Series 9 Shavers & Trimmers",
            "slug": "beauty",
            "brandQuery": "braun",
            "productCount": 15
          },
          {
            "id": "philips-sonicare",
            "name": "Philips Sonicare Toothbrushes",
            "slug": "beauty",
            "brandQuery": "philips",
            "productCount": 10
          }
        ]
      }
    ]
  },
  {
    "id": "car-accessories",
    "name": "მანქანის აქსესუარები",
    "slug": "car-accessories",
    "icon": "Sparkles",
    "children": [
      {
        "id": "car-electronics",
        "name": "ავტო ელექტრონიკა",
        "slug": "car-electronics",
        "productCount": 45,
        "items": [
          {
            "id": "dvr-cameras",
            "name": "70mai & Xiaomi DVR ვიდეორეგისტრატორები",
            "slug": "car-accessories",
            "brandQuery": "xiaomi",
            "productCount": 20
          },
          {
            "id": "fm-transmitters",
            "name": "Baseus FM ტრანსმიტერები & დამტენები",
            "slug": "car-accessories",
            "brandQuery": "baseus",
            "productCount": 25
          }
        ]
      },
      {
        "id": "car-holders-cleaners",
        "name": "ავტო ჰოლდერები & მტვერსასრუტები",
        "slug": "car-holders-cleaners",
        "productCount": 30,
        "items": [
          {
            "id": "baseus-holders",
            "name": "Baseus MagSafe Car Mounts",
            "slug": "car-accessories",
            "brandQuery": "baseus",
            "productCount": 18
          },
          {
            "id": "car-vacuums",
            "name": "პორტატული ავტო მტვერსასრუტები",
            "slug": "car-accessories",
            "productCount": 12
          }
        ]
      }
    ]
  },
  {
    "id": "accessories",
    "name": "აქსესუარები",
    "slug": "accessories",
    "icon": "Sparkles",
    "children": [
      {
        "id": "daily-accessories",
        "name": "ყოველდღიური აქსესუარები",
        "slug": "daily-accessories",
        "productCount": 50,
        "items": [
          {
            "id": "backpacks",
            "name": "Thule & Baseus ლეპტოპის ზურგჩანთები",
            "slug": "accessories",
            "productCount": 25
          },
          {
            "id": "wallets-organizers",
            "name": "საფულეები & საკაბელო ორგანაიზერები",
            "slug": "accessories",
            "productCount": 25
          }
        ]
      }
    ]
  }
];

async function main() {
  console.log("🌱 Starting MySQL Database Seed for Spilo.ge...");

  // 1. Seed Featured Brands
  const brandsData = [
    { id: "dji", name: "DJI", slug: "dji", logo: "https://veli.store/media-cdn/__sized__/brand/dji_logo-thumbnail-100x100-95.png" },
    { id: "apple", name: "Apple", slug: "apple", logo: "https://veli.store/media-cdn/__sized__/brand/apple_logo-thumbnail-100x100-95.png" },
    { id: "samsung", name: "Samsung", slug: "samsung", logo: "https://veli.store/media-cdn/__sized__/brand/samsung_logo-thumbnail-100x100-95.png" },
    { id: "sony", name: "Sony", slug: "sony", logo: "https://veli.store/media-cdn/__sized__/brand/sony_logo-thumbnail-100x100-95.png" },
    { id: "asus", name: "ASUS", slug: "asus", logo: "https://veli.store/media-cdn/__sized__/brand/asus_logo-thumbnail-100x100-95.png" },
    { id: "marshall", name: "Marshall", slug: "marshall", logo: "https://veli.store/media-cdn/__sized__/brand/marshall_logo-thumbnail-100x100-95.png" },
    { id: "jbl", name: "JBL", slug: "jbl", logo: "https://veli.store/media-cdn/__sized__/brand/jbl_logo-thumbnail-100x100-95.png" },
    { id: "xiaomi", name: "Xiaomi", slug: "xiaomi", logo: "https://veli.store/media-cdn/__sized__/brand/xiaomi_logo-thumbnail-100x100-95.png" },
  ];

  for (const b of brandsData) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: { name: b.name, slug: b.slug, logo: b.logo },
      create: b,
    });
  }
  console.log("✅ Seeded Brands");

  // 2. Seed Main Categories from SEED_CATEGORIES
  for (const c of SEED_CATEGORIES) {
    await prisma.category.upsert({
      where: { id: c.id },
      update: { 
        name: c.name, 
        slug: c.slug, 
        icon: c.icon, 
        childrenJson: c.children ? JSON.stringify(c.children) : null 
      },
      create: {
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        childrenJson: c.children ? JSON.stringify(c.children) : null,
      },
    });
  }

  console.log("✅ Seeded Categories");


  console.log("✅ Seeded Categories");

  // 3. Seed Products
  const productsData = [
    {
      id: "dji-neo",
      title: "დრონი DJI Neo Drone Gray",
      slug: "dji-neo-drone-gray",
      sku: "DJI-NEO-001",
      description: "პორტატული და ულტრა-მსუბუქი დრონი 4K Ultra HD ვიდეო გადაღებით და AI სმარტ თრექინგით.",
      price: 799,
      discountPrice: 699,
      discountPercentage: 12,
      monthlyInstallment: 28,
      stock: 15,
      categoryId: "photo-video",
      brandId: "dji",
      images: ["https://veli.store/media-cdn/__sized__/product/DJI_Neo_Drone-1-thumbnail-200x200-95.jpeg"],
      isFeatured: true,
      isFlashDeal: true,
    },
    {
      id: "iphone-16-pro-max",
      title: "სმარტფონი Apple iPhone 16 Pro Max 256GB Desert Titanium",
      slug: "apple-iphone-16-pro-max-256gb-desert-titanium",
      sku: "APL-IP16PM-256",
      description: "ფლაგმანური iPhone 16 Pro Max ტიტანის კორპუსით, A18 Pro ჩიპით და კამერის მართვის ინოვაციური ღილაკით.",
      price: 4599,
      discountPrice: 4299,
      discountPercentage: 6,
      monthlyInstallment: 172,
      stock: 8,
      categoryId: "mobiles",
      brandId: "apple",
      images: ["https://veli.store/media-cdn/__sized__/product/iPhone_16_Pro_Max_Desert_Titanium_PDP_Image_Position_1__en-US_1-thumbnail-200x200-95.jpg"],
      isFeatured: true,
      isFlashDeal: true,
    },
  ];

  for (const p of productsData) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }

  // Load additional products from zoommer_100_smartphones.json if exists
  const jsonPath = path.join(process.cwd(), "zoommer_100_smartphones.json");
  if (fs.existsSync(jsonPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));
      for (const item of items) {
        const brandSlug = (item.brandName || "generic").toLowerCase().replace(/[^a-z0-9]/g, "-");
        const brandName = item.brandName || "Generic";
        await prisma.brand.upsert({
          where: { slug: brandSlug },
          update: { name: brandName, logo: item.brandLogo || null },
          create: { id: brandSlug, name: brandName, slug: brandSlug, logo: item.brandLogo || null },
        });

        const categoryId = item.categorySlug || "mobiles";
        const productId = `prod-${item.externalId || item.sku || Math.random().toString(36).substring(7)}`;

        await prisma.product.upsert({
          where: { slug: item.slug },
          update: {
            title: item.title,
            sku: item.sku,
            description: item.description,
            price: Number(item.price) || 0,
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            discountPercentage: item.discountPercentage ? Number(item.discountPercentage) : null,
            monthlyInstallment: item.monthlyInstallment ? Number(item.monthlyInstallment) : null,
            stock: item.stock || 10,
            categoryId: categoryId,
            brandId: brandSlug,
            images: item.images || [],
            specs: item.specs || null,
            isFeatured: true,
            isFlashDeal: Boolean(item.discountPrice),
          },
          create: {
            id: productId,
            title: item.title,
            slug: item.slug,
            sku: item.sku,
            description: item.description,
            price: Number(item.price) || 0,
            discountPrice: item.discountPrice ? Number(item.discountPrice) : null,
            discountPercentage: item.discountPercentage ? Number(item.discountPercentage) : null,
            monthlyInstallment: item.monthlyInstallment ? Number(item.monthlyInstallment) : null,
            stock: item.stock || 10,
            categoryId: categoryId,
            brandId: brandSlug,
            images: item.images || [],
            specs: item.specs || null,
            isFeatured: true,
            isFlashDeal: Boolean(item.discountPrice),
          },
        });
      }
    } catch (e) {
      console.warn("Could not import zoommer_100_smartphones.json:", e);
    }
  }
  console.log("✅ Seeded Products");

  // 4. Seed Admin Users
  await prisma.adminUser.upsert({
    where: { email: "admin@spilo.ge" },
    update: { password: "admin123" },
    create: {
      name: "Admin User",
      email: "admin@spilo.ge",
      password: "admin123",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "beka@spilo.ge" },
    update: { password: "admin123" },
    create: {
      name: "Beka Papiashvili",
      email: "beka@spilo.ge",
      password: "admin123",
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("✅ Seeded Admin Users");

  // 5. Seed Installment Options
  const installmentOptions = [
    { bankName: "თიბისი ბანკი", bankCode: "TBC_INST_9921", months: 12, ratePercent: 0, isActive: true },
    { bankName: "საქართველოს ბანკი (BOG)", bankCode: "BOG_INST_4402", months: 12, ratePercent: 0, isActive: true },
    { bankName: "კრედო ბანკი", bankCode: "CREDO_INST_1109", months: 12, ratePercent: 0, isActive: true },
    { bankName: "Space Bank", bankCode: "SPACE_TOP_CARD_882", months: 12, ratePercent: 0, isActive: true },
  ];

  for (const inst of installmentOptions) {
    await prisma.installmentOption.upsert({
      where: { bankCode: inst.bankCode },
      update: inst,
      create: inst,
    });
  }
  console.log("✅ Seeded Installment Options");

  // 6. Seed Delivery Zones
  const deliveryZones = [
    { id: "del-tb", title: "თბილისი - სტანდარტული მიწოდება", price: 5, estimatedDays: "1 სამუშაო დღე", isActive: true },
    { id: "del-reg", title: "რეგიონები - საკურიერო მიწოდება", price: 10, estimatedDays: "2-3 სამუშაო დღე", isActive: true },
  ];

  for (const del of deliveryZones) {
    await prisma.deliveryZone.upsert({
      where: { id: del.id },
      update: del,
      create: del,
    });
  }
  console.log("✅ Seeded Delivery Zones");

  // 7. Seed Reviews
  const reviewsData = [
    {
      id: "rev-1",
      productId: "dji-neo",
      author: "გიორგი მაისურაძე",
      rating: 5,
      comment: "შესანიშნავი დრონია! ძალიან მარტივი სამართავია და გადაღების ხარისხი 4K-ში უმაღლესია.",
      verifiedPurchase: true,
      likes: 12,
    },
    {
      id: "rev-2",
      productId: "iphone-16-pro-max",
      author: "ნინო ჩხეიძე",
      rating: 5,
      comment: "Desert Titanium ფერი ულამაზესია. ელემენტი მთელი 2 დღე ძლებს, კამერა საოცრებაა!",
      verifiedPurchase: true,
      likes: 24,
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.upsert({
      where: { id: rev.id },
      update: rev,
      create: rev,
    });
  }
  console.log("✅ Seeded Reviews");

  // 8. Seed Product Variants
  const variantsData = [
    {
      id: "var-ip16pm-desert-256",
      productId: "iphone-16-pro-max",
      name: "ფერი",
      type: "color",
      label: "Desert Titanium",
      value: "desert-titanium",
      colorHex: "#D4B996",
      priceModifier: 0,
      stock: 5,
      sku: "IP16PM-DT-256",
    },
    {
      id: "var-ip16pm-black-256",
      productId: "iphone-16-pro-max",
      name: "ფერი",
      type: "color",
      label: "Black Titanium",
      value: "black-titanium",
      colorHex: "#3C3B37",
      priceModifier: 0,
      stock: 3,
      sku: "IP16PM-BT-256",
    },
    {
      id: "var-ip16pm-natural-512",
      productId: "iphone-16-pro-max",
      name: "მეხსიერება",
      type: "text",
      label: "512 GB",
      value: "512gb",
      priceModifier: 600,
      stock: 4,
      sku: "IP16PM-NT-512",
    },
  ];

  for (const v of variantsData) {
    await prisma.productVariant.upsert({
      where: { id: v.id },
      update: v,
      create: v,
    });
  }
  console.log("✅ Seeded Product Variants");

  // 9. Seed System Settings
  const defaultSettings = [
    { key: "storeName", value: "Spilo E-Commerce" },
    { key: "contactEmail", value: "info@spilo.ge" },
    { key: "contactPhone", value: "+995 32 2 00 00 00" },
    { key: "address", value: "თბილისი, ჭავჭავაძის გამზირი #34" },
    { key: "freeShippingThreshold", value: "100" },
    { key: "standardDeliveryFee", value: "5" },
    { key: "expressDeliveryFee", value: "15" },
    { key: "regionsDeliveryFee", value: "10" },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Seeded System Settings");

  // 10. Seed Granular Storefront Sections
  await prisma.storefrontSection.deleteMany();

  const granularSections = [
    {
      key: "hero_banner",
      type: "HERO_BANNER",
      title: "Hero Banner Carousel (მთავარი ბანერები)",
      subtitle: "სლაიდერი აქციებისა და შეთავაზებებისთვის",
      isEnabled: true,
      sortOrder: 0,
      config: {
        autoplay: true,
        interval: 5000,
        heroSlides: [
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
        ],
      },
    },
    {
      key: "categories_grid",
      type: "CATEGORY_GRID",
      title: "Category Cards Carousel (კატეგორიები)",
      subtitle: "სწრაფი ნავიგაციის კატეგორიების ბარათები",
      isEnabled: true,
      sortOrder: 1,
      config: { limit: 8 },
    },
    {
      key: "dji_products",
      type: "PRODUCT_CAROUSEL",
      title: "DJI ტექნიკა & აქსესუარები",
      subtitle: "პროფესიონალური დრონები და სტაბილიზატორები",
      isEnabled: true,
      sortOrder: 2,
      config: { brand: "dji", categoryId: "photo-video", limit: 8, targetLink: "/catalog?category=photo-video" },
    },
    {
      key: "promo_cards",
      type: "PROMO_CAROUSEL",
      title: "სპეციალური შეთავაზებები (Promo Cards)",
      subtitle: "აქციები და ფასდაკლების ბარათები",
      isEnabled: true,
      sortOrder: 3,
      config: {
        promoCards: [
          {
            id: "pc-1",
            title: "ტანსაცმელი & ფეხსაცმელი",
            badge: "40%-მდე",
            bgColor: "#FFC5E3",
            bgImageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
            link: "/catalog",
          },
          {
            id: "pc-2",
            title: "აუდიოტექნიკა",
            badge: "40%-მდე",
            bgColor: "#E2D9FF",
            bgImageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&q=80",
            link: "/catalog?category=audio",
          },
          {
            id: "pc-3",
            title: "ქართული ბრენდები",
            badge: "40%-მდე",
            bgColor: "#FFE6C7",
            bgImageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
            link: "/catalog",
          },
        ],
      },
    },
    {
      key: "mobile_products",
      type: "PRODUCT_CAROUSEL",
      title: "სმარტფონები & აქსესუარები",
      subtitle: "უახლესი ფლაგმანური სმარტფონები ოფიციალური გარანტიით",
      isEnabled: true,
      sortOrder: 4,
      config: { categoryId: "mobiles", limit: 8, targetLink: "/catalog?category=mobiles" },
    },
    {
      key: "apple_promo_banner",
      type: "BANNER",
      title: "iPhone 16 Pro Series",
      subtitle: "ტიტანის კორპუსი, A18 Pro ჩიპი და ინოვაციური კამერის მართვა. 0%-იანი ონლაინ განვადებით.",
      isEnabled: true,
      sortOrder: 5,
      config: {
        tagText: "Apple Flagship",
        buttonText: "ყიდვა",
        bannerUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=1400&q=80",
        link: "/catalog",
      },
    },
    {
      key: "laptop_products",
      type: "PRODUCT_CAROUSEL",
      title: "ლეპტოპები & კომპიუტერები",
      subtitle: "სამუშაო და გეიმინგ ლეპტოპები საუკეთესო ფასად",
      isEnabled: true,
      sortOrder: 6,
      config: { categoryId: "laptops", limit: 8, targetLink: "/catalog?category=laptops" },
    },
    {
      key: "ps5_promo_banner",
      type: "BANNER",
      title: "PlayStation 5 Slim & DualSense",
      subtitle: "ჩაერთე გეიმინგის ახალ ეპოქაში. 4K 120Hz გრაფიკა და ულტრა-სწრაფი SSD.",
      isEnabled: true,
      sortOrder: 7,
      config: {
        tagText: "Next-Gen Gaming",
        buttonText: "კონსოლების ნახვა",
        bannerUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1400&q=80",
        link: "/catalog",
      },
    },
    {
      key: "brands_carousel",
      type: "BRAND_GRID",
      title: "ოფიციალური ბრენდები",
      subtitle: "მსოფლიო დონის მწარმოებლები ოფიციალური გარანტიით",
      isEnabled: true,
      sortOrder: 8,
      config: {},
    },
    {
      key: "recently_viewed",
      type: "RECENTLY_VIEWED",
      title: "Recently Viewed (ბოლოს ნანახი)",
      subtitle: "მომხმარებლის მიერ ბოლოს დათვალიერებული ნივთები",
      isEnabled: true,
      sortOrder: 9,
      config: {},
    },
    {
      key: "trust_strip",
      type: "TRUST_STRIP",
      title: "Spilo გარანტია & სერვისები",
      subtitle: "სწრაფი მიწოდება, ოფიციალური გარანტია, 0% განვადება და სასაჩუქრე შეფუთვა",
      isEnabled: true,
      sortOrder: 10,
      config: {
        trustItems: [
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
        ],
      },
    },
  ];

  for (const sec of granularSections) {
    await prisma.storefrontSection.create({
      data: {
        key: sec.key,
        type: sec.type,
        title: sec.title,
        subtitle: sec.subtitle,
        isEnabled: sec.isEnabled,
        sortOrder: sec.sortOrder,
        config: sec.config,
      },
    });
  }
  console.log("✅ Seeded Granular Storefront Sections");

  console.log("🎉 MySQL Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
