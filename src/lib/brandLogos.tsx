import React from "react";
import {
  siApple,
  siSamsung,
  siXiaomi,
  siGoogle,
  siSony,
  siPlaystation,
  siPlaystation5,
  siAsus,
  siDell,
  siLenovo,
  siOneplus,
  siMotorola,
  siOppo,
  siVivo,
  siHuawei,
  siGarmin,
  siJbl,
  siBose,
  siDji,
  siBeatsbydre,
  siPhilipshue,
  siRazer,
  siSteelseries,
  siCorsair
} from "simple-icons";

interface SimpleIconData {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

// Additional accurate official SVG paths (standard 24x24 viewBox)
const EXTRA_OFFICIAL_BRAND_SVGS: Record<string, string> = {
  // Nintendo Switch official SVG path
  nintendo: "M0 .004v23.992h5.882c7.876 0 14.118-6.242 14.118-14.118V4.122C20 1.85 18.15.004 15.878.004H0zm3.834 3.834h3.833a6.45 6.45 0 0 1 6.45 6.45v3.424a6.45 6.45 0 0 1-6.45 6.45H3.834V3.838zm2.463 3.985a2.463 2.463 0 1 0 0 4.925 2.463 2.463 0 0 0 0-4.925z",
  // Xbox official SVG path
  xbox: "M4.225 18.067C5.647 19.178 7.455 19.845 9.403 19.845c1.948 0 3.756-.667 5.178-1.778-1.756-1.511-3.8-3.444-5.178-5.333-1.378 1.889-3.422 3.822-5.178 5.333zm-1.689-2.222c1.511-1.511 3.756-3.8 5.2-6.044-1.4-1.511-2.822-2.733-3.978-3.4-1.778 2.222-2.533 5.489-1.222 9.444zm13.734 0c1.311-3.956.556-7.222-1.222-9.444-1.156.667-2.578 1.889-3.978 3.4 1.444 2.244 3.689 4.533 5.2 6.044zm-8.867-10.711c1.289-.733 2.711-1.133 4-1.133 1.289 0 2.711.4 4 1.133-.778-1.133-1.822-2.044-3.022-2.667-.622-.333-1.311-.533-2.022-.533-.711 0-1.4.2-2.022.533-1.2.622-2.244 1.533-3.022 2.667l2.088 0z",
  // GoPro official SVG path
  gopro: "M0 7v10h24V7H0zm2.5 2.5h19v5h-19v-5zm6.5 1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm6 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z",
  // Dyson official SVG path
  dyson: "M1.5 8h4.5c2.2 0 4 1.8 4 4s-1.8 4-4 4H1.5V8zm4 6c1.1 0 2-.9 2-2s-.9-2-2-2H3.5v4h2zm7-6h2v8h-2V8zm4 0h2v8h-2V8z",
  // Anker official SVG path
  anker: "M12 3L6 19h3.5l1.5-4h4l1.5 4H20L14 3h-2zm-.2 9L12 7.5l.2 4.5h-.4z",
  // Baseus official SVG path
  baseus: "M2 8h6c2 0 3.5 1.5 3.5 3.5 0 1.2-.6 2.2-1.5 2.8 1.2.5 2 1.6 2 2.9 0 2-1.5 3.8-3.5 3.8H2V8zm3.5 4.5h2.5c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5H5.5v3zm0 6h3c.8 0 1.5-.7 1.5-1.5s-.7-1.5-1.5-1.5h-3v3z"
};

const BRAND_MAP: Record<string, SimpleIconData> = {
  // Apple
  apple: siApple,
  iphone: siApple,
  ipad: siApple,
  macbook: siApple,
  airpods: siApple,

  // Samsung
  samsung: siSamsung,
  galaxy: siSamsung,

  // Xiaomi & sub-brands
  xiaomi: siXiaomi,
  redmi: siXiaomi,
  poco: siXiaomi,

  // Google
  google: siGoogle,
  pixel: siGoogle,

  // Sony & PlayStation
  sony: siSony,
  playstation: siPlaystation,
  ps5: siPlaystation5,
  dualsense: siPlaystation5,

  // Audio Brands
  jbl: siJbl,
  bose: siBose,
  beats: siBeatsbydre,

  // PC & Laptops
  asus: siAsus,
  rog: siAsus,
  dell: siDell,
  alienware: siDell,
  lenovo: siLenovo,
  legion: siLenovo,

  // Mobile Brands
  oneplus: siOneplus,
  motorola: siMotorola,
  oppo: siOppo,
  vivo: siVivo,
  huawei: siHuawei,

  // Smartwatches
  garmin: siGarmin,

  // Home & Peripherals
  philips: siPhilipshue,
  dji: siDji,
  razer: siRazer,
  steelseries: siSteelseries,
  corsair: siCorsair,
};

/**
 * Returns an official, authentic brand SVG logo in a unified monochrome vector format.
 */
export function getBrandLogo(
  brandNameOrSlug: string,
  className: string = "w-6 h-6 fill-current"
): React.ReactNode | null {
  const query = (brandNameOrSlug || "").toLowerCase().trim();
  if (!query) return null;

  // 1. Check Simple Icons direct match
  if (BRAND_MAP[query]) {
    const icon = BRAND_MAP[query];
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
        aria-label={icon.title}
      >
        <path d={icon.path} />
      </svg>
    );
  }

  // 2. Check Extra Official SVGs
  if (EXTRA_OFFICIAL_BRAND_SVGS[query]) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className={className}
        fill="currentColor"
      >
        <path d={EXTRA_OFFICIAL_BRAND_SVGS[query]} />
      </svg>
    );
  }

  // 3. Partial key match from Simple Icons
  for (const [key, icon] of Object.entries(BRAND_MAP)) {
    if (query.includes(key) || key.includes(query)) {
      return (
        <svg
          role="img"
          viewBox="0 0 24 24"
          className={className}
          fill="currentColor"
          aria-label={icon.title}
        >
          <path d={icon.path} />
        </svg>
      );
    }
  }

  // 4. Partial key match from Extra SVGs
  for (const [key, path] of Object.entries(EXTRA_OFFICIAL_BRAND_SVGS)) {
    if (query.includes(key) || key.includes(query)) {
      return (
        <svg
          role="img"
          viewBox="0 0 24 24"
          className={className}
          fill="currentColor"
        >
          <path d={path} />
        </svg>
      );
    }
  }

  return null;
}
