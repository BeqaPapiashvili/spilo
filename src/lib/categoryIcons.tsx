import React from "react";
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Gamepad2,
  Tv,
  Monitor,
  Camera,
  Video,
  Home,
  Car,
  Bike,
  Zap,
  Sparkles,
  Mic,
  Speaker,
  Radio,
  Disc,
  Coffee,
  Plug,
  BatteryCharging,
  BatteryMedium,
  Shield,
  ShieldCheck,
  Cable,
  Usb,
  Sliders,
  Briefcase,
  Wallet,
  Wind,
  Flame,
  Smile,
  Heart,
  Scissors,
  Lock,
  Compass,
  Layers,
  Box,
  Navigation,
  Plane,
  Aperture,
  Music,
  HardHat,
  Mouse,
  Clock,
  Battery,
  Tag
} from "lucide-react";

/**
 * Returns an accurate, semantic Lucide icon for any category, subcategory, brand or model.
 * 100% consistent design language across the entire store.
 */
export function getCategoryIcon(
  item: { name?: string; slug?: string; icon?: string; brandQuery?: string; id?: string },
  className: string = "w-6 h-6 stroke-[1.8]"
): React.ReactNode {
  const name = (item.name || "").toLowerCase();
  const slug = (item.slug || "").toLowerCase();
  const icon = (item.icon || "").toLowerCase();
  const id = (item.id || "").toLowerCase();
  const brand = (item.brandQuery || "").toLowerCase();

  // 1. Power Banks & Batteries
  if (
    name.includes("power bank") ||
    slug.includes("power-bank") ||
    id.startsWith("pb-") ||
    name.includes("ბატარეა")
  ) {
    return <BatteryMedium className={className} />;
  }

  // 2. Wireless Chargers & Charging Adapters
  if (
    name.includes("უსადენო დამტენ") ||
    slug.includes("wireless-charger") ||
    id.startsWith("wc-")
  ) {
    return <BatteryCharging className={className} />;
  }

  if (
    name.includes("დამტენ") ||
    name.includes("ადაპტერ") ||
    slug.includes("charger") ||
    id.startsWith("ca-") ||
    id.startsWith("ad-")
  ) {
    return <Zap className={className} />;
  }

  // 3. Screen Protectors & Cases
  if (
    name.includes("ეკრანის დამცავ") ||
    slug.includes("screen") ||
    name.includes("შუშა")
  ) {
    return <ShieldCheck className={className} />;
  }

  if (
    name.includes("ჩასადებ") ||
    name.includes("ქეის") ||
    slug.includes("case") ||
    id.startsWith("mc-")
  ) {
    return <Shield className={className} />;
  }

  // 4. Cables, Hubs, Connectors
  if (
    name.includes("კაბელ") ||
    slug.includes("cable") ||
    name.includes("კონექტორ") ||
    name.includes("დამაგრძელებელ")
  ) {
    return <Cable className={className} />;
  }

  if (
    name.includes("ჰაბ") ||
    slug.includes("hub") ||
    name.includes("usb") ||
    name.includes("otg")
  ) {
    return <Usb className={className} />;
  }

  // 5. Headphones, Buds & Audio
  if (
    name.includes("airpod") ||
    name.includes("buds") ||
    name.includes("ყურსასმენ") ||
    slug.includes("earphone") ||
    slug.includes("headphone") ||
    slug.includes("buds") ||
    id.startsWith("eb-") ||
    id.startsWith("head-")
  ) {
    return <Headphones className={className} />;
  }

  if (
    name.includes("დინამიკ") ||
    name.includes("soundbar") ||
    name.includes("აკუსტიკ") ||
    slug.includes("speaker") ||
    slug.includes("soundbar") ||
    slug.includes("equipment")
  ) {
    return <Speaker className={className} />;
  }

  if (name.includes("მიკროფონ") || slug.includes("microphones") || id.startsWith("mic-")) {
    return <Mic className={className} />;
  }

  if (name.includes("ფირსაკრავ") || slug.includes("turntable")) {
    return <Disc className={className} />;
  }

  if (name.includes("სმარტ ასისტენტ") || name.includes("ტრანსმიტერ") || slug.includes("fm")) {
    return <Radio className={className} />;
  }

  if (slug === "audio-systems" || icon === "headphones" || name.includes("აუდიო")) {
    return <Headphones className={className} />;
  }

  // 6. Smartwatches & Bands
  if (
    name.includes("საათ") ||
    name.includes("watch") ||
    name.includes("band") ||
    slug.includes("smartwatch") ||
    slug.includes("watch") ||
    icon === "watch" ||
    id.startsWith("sw-")
  ) {
    if (name.includes("სამაჯურ") || slug.includes("strap")) {
      return <Clock className={className} />;
    }
    return <Watch className={className} />;
  }

  // 7. Tablets & iPads
  if (
    name.includes("ტაბ") ||
    name.includes("ipad") ||
    name.includes("tablet") ||
    slug === "tablets" ||
    slug.includes("tablet") ||
    slug.includes("ipad") ||
    icon === "tablet"
  ) {
    if (name.includes("pencil") || name.includes("სტილუს")) {
      return <Sliders className={className} />;
    }
    return <Tablet className={className} />;
  }

  // 8. Laptops & Computers
  if (
    name.includes("ლეპტოპ") ||
    name.includes("macbook") ||
    name.includes("laptop") ||
    slug === "laptops" ||
    slug.includes("laptop") ||
    slug.includes("macbook") ||
    icon === "laptop" ||
    id.startsWith("laptop-")
  ) {
    if (name.includes("ჩანთ") || slug.includes("bag")) {
      return <Briefcase className={className} />;
    }
    return <Laptop className={className} />;
  }

  // 9. Gaming & Consoles
  if (
    slug === "gaming" ||
    name.includes("gaming") ||
    name.includes("გეიმინგ") ||
    name.includes("კონსოლ") ||
    name.includes("playstation") ||
    name.includes("xbox") ||
    name.includes("nintendo") ||
    name.includes("dualsense") ||
    slug.includes("gamepad") ||
    icon === "gamepad2"
  ) {
    return <Gamepad2 className={className} />;
  }

  // 10. TV & Monitors
  if (
    slug === "tv-monitors" ||
    icon === "tv" ||
    name.includes("ტელევიზორ") ||
    name.includes("მონიტორ") ||
    slug.includes("televisions") ||
    slug.includes("monitors")
  ) {
    if (name.includes("მონიტორ") || slug.includes("monitor")) {
      return <Monitor className={className} />;
    }
    return <Tv className={className} />;
  }

  // 11. Photo, Video, Drones & Cameras
  if (
    slug === "photo-video" ||
    icon === "camera" ||
    name.includes("ფოტო") ||
    name.includes("ვიდეო") ||
    name.includes("კამერ") ||
    name.includes("დრონ") ||
    name.includes("gopro") ||
    name.includes("dji")
  ) {
    if (name.includes("დრონ") || slug.includes("drone")) {
      return <Plane className={className} />;
    }
    if (name.includes("სტაბილიზატორ") || slug.includes("gimbal") || slug.includes("pocket")) {
      return <Video className={className} />;
    }
    if (name.includes("შტატივ") || name.includes("განათებ")) {
      return <Aperture className={className} />;
    }
    return <Camera className={className} />;
  }

  // 12. Scooters & Mobility
  if (
    slug.includes("scooter") ||
    name.includes("სკუტერ") ||
    name.includes("ninebot") ||
    name.includes("segway")
  ) {
    if (name.includes("ჩაფხუტ") || name.includes("დამცავ") || name.includes("საკეტ")) {
      return <ShieldCheck className={className} />;
    }
    return <Bike className={className} />;
  }

  // 13. Smart Home & Appliances
  if (
    slug === "smart-home" ||
    icon === "home" ||
    name.includes("ჭკვიანი სახლ") ||
    name.includes("მტვერსასრუტ") ||
    name.includes("საყოფაცხოვრებო") ||
    name.includes("vacuum") ||
    name.includes("dreame") ||
    name.includes("roborock") ||
    name.includes("dyson")
  ) {
    if (name.includes("მტვერსასრუტ") || slug.includes("vacuum") || name.includes("dreame") || name.includes("roborock")) {
      return <Wind className={className} />;
    }
    if (name.includes("ყავ") || name.includes("coffee")) {
      return <Coffee className={className} />;
    }
    if (name.includes("განათებ") || name.includes("hue") || name.includes("smart-lighting")) {
      return <Zap className={className} />;
    }
    return <Home className={className} />;
  }

  // 14. Beauty & Personal Care
  if (
    slug === "beauty" ||
    name.includes("beauty") ||
    name.includes("თმის") ||
    name.includes("სტაილერ") ||
    name.includes("airwrap") ||
    name.includes("supersonic") ||
    name.includes("ჰიგიენა") ||
    name.includes("shaver") ||
    name.includes("საპარს")
  ) {
    if (name.includes("თმ") || name.includes("სტაილერ") || name.includes("airwrap") || name.includes("straightener")) {
      return <Flame className={className} />;
    }
    if (name.includes("საპარს") || name.includes("shaver") || name.includes("კბილ") || name.includes("toothbrush")) {
      return <Smile className={className} />;
    }
    return <Sparkles className={className} />;
  }

  // 15. Car Accessories
  if (
    slug.includes("car") ||
    name.includes("მანქან") ||
    name.includes("ავტო") ||
    slug.includes("auto")
  ) {
    if (name.includes("ვიდეორეგისტრატორ") || name.includes("dvr")) {
      return <Video className={className} />;
    }
    if (name.includes("ჰოლდერ") || name.includes("mount")) {
      return <Compass className={className} />;
    }
    if (name.includes("მტვერსასრუტ") || name.includes("vacuum")) {
      return <Wind className={className} />;
    }
    return <Car className={className} />;
  }

  // 16. Bags, Wallets & Daily Accessories
  if (
    slug.includes("accessories") ||
    name.includes("აქსესუარ") ||
    slug.includes("backpack") ||
    slug.includes("wallet")
  ) {
    if (name.includes("ჩანთ") || name.includes("ზურგჩანთ") || slug.includes("backpack")) {
      return <Briefcase className={className} />;
    }
    if (name.includes("საფულ") || slug.includes("wallet")) {
      return <Wallet className={className} />;
    }
    return <Box className={className} />;
  }

  // 17. Smartphone brands & default phones
  if (
    slug === "mobiles" ||
    icon === "smartphone" ||
    name.includes("მობილურ") ||
    name.includes("iphone") ||
    name.includes("android") ||
    id.startsWith("mob-") ||
    brand === "apple" ||
    brand === "samsung" ||
    brand === "xiaomi" ||
    brand === "poco" ||
    brand === "vivo" ||
    brand === "google" ||
    brand === "nothing" ||
    brand === "oneplus" ||
    brand === "realme" ||
    brand === "oppo" ||
    brand === "zte" ||
    brand === "motorola" ||
    brand === "blackview"
  ) {
    return <Smartphone className={className} />;
  }

  // Default fallback to Layers
  return <Layers className={className} />;
}
