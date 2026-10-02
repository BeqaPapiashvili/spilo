export type HomeCategoryImage = {
  id: string;
  src: string;
  x: number;
  y: number;
  w: number;
  h: number;
  rotate: number;
};

export type HomeCategoryCard = {
  id: string;
  categoryId: string;
  slug: string;
  href?: string;
  label: string;
  row: 1 | 2;
  width?: number;
  height?: number;
  images: HomeCategoryImage[];
};

export const HOME_CATEGORY_STRIP_KEY = "home_category_strip";

function layer(
  id: string,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
  rotate = 0,
): HomeCategoryImage {
  return { id, src, x, y, w, h, rotate };
}

export const DEFAULT_HOME_CATEGORY_CARDS: HomeCategoryCard[] = [
  { id: "mobiles", categoryId: "", slug: "mobiles", label: "სმარტფონები", row: 1, width: 179, height: 100, images: [layer("mobiles-1", "/home/categories/smartphones.png", 109, 29, 88, 88)] },
  { id: "tablets", categoryId: "", slug: "tablets", label: "ტაბები", row: 1, width: 179, height: 100, images: [layer("tablets-1", "/home/categories/tablet.png", 106, 24, 81, 81)] },
  { id: "audio-systems", categoryId: "", slug: "audio-systems", label: "ყურსასმენები", row: 1, width: 155, height: 100, images: [layer("audio-1", "/home/categories/headphones.png", 84, 24, 78, 78)] },
  { id: "photo-video", categoryId: "", slug: "photo-video", label: "ფოტო &\nვიდეო", row: 1, width: 120, height: 100, images: [layer("photo-1", "/home/categories/camera.png", 42, 22, 88, 88)] },
  { id: "pets", categoryId: "", slug: "pets", label: "შინაური\nცხოველები", row: 1, width: 171, height: 100, images: [layer("pets-1", "/home/categories/pets.png", 88, 15, 99, 99)] },
  { id: "smart-home", categoryId: "", slug: "smart-home", label: "წვრილი საოჯახო\nტექნიკა", row: 1, width: 179, height: 100, images: [layer("home-1", "/home/categories/vacuum.png", 96, 22, 92, 92)] },
  { id: "smartwatches", categoryId: "", slug: "smartwatches", label: "სმარტ\nსაათები", row: 2, width: 179, height: 100, images: [layer("watch-1", "/home/categories/smartwatch.png", 72, 16, 118, 86)] },
  { id: "laptops", categoryId: "", slug: "laptops", label: "ლეპტოპები", row: 2, width: 179, height: 100, images: [layer("laptop-1", "/home/categories/laptop.png", 62, 18, 128, 90)] },
  { id: "gaming", categoryId: "", slug: "gaming", label: "Gaming &\nკონსოლები", row: 2, width: 161, height: 100, images: [layer("gaming-1", "/home/categories/gaming.png", 98, 28, 70, 78)] },
  { id: "tv-monitors", categoryId: "", slug: "tv-monitors", label: "TV &\nმონიტორები", row: 2, width: 172, height: 100, images: [layer("tv-1", "/home/categories/tv.png", 90, 20, 92, 88)] },
  { id: "scooters", categoryId: "", slug: "scooters", label: "სკუტერები", row: 2, width: 121, height: 100, images: [layer("scooter-1", "/home/categories/scooter.png", 62, 8, 64, 96)] },
  { id: "beauty", categoryId: "", slug: "beauty", label: "თავის\nმოვლა", row: 2, width: 133, height: 100, images: [layer("beauty-1", "/home/categories/beauty.png", 52, 22, 88, 88)] },
  { id: "car-accessories", categoryId: "", slug: "car-accessories", label: "მანქანის\nაქსესუარები", row: 2, width: 167, height: 100, images: [layer("car-1", "/home/categories/car.png", 78, 16, 100, 92)] },
];

export function homeCategoryCardWidth(label: string) {
  const longest = Math.max(...label.split("\n").map((line) => line.trim().length), 1);
  return Math.round(Math.min(190, Math.max(132, 56 + longest * 8)));
}

export function resolveHomeCategoryFrame(card: HomeCategoryCard) {
  const width = clamp(card.width, 110, 360) ?? homeCategoryCardWidth(card.label);
  const height = clamp(card.height, 72, 220) ?? 100;
  const images = (card.images || []).slice(0, 6).map((image, index) => ({
    id: image.id || `img-${index}`,
    src: image.src,
    x: clamp(image.x, -240, 420) ?? 40,
    y: clamp(image.y, -240, 420) ?? 12,
    w: clamp(image.w, 24, 320) ?? 88,
    h: clamp(image.h, 24, 320) ?? 88,
    rotate: clamp(image.rotate, -180, 180) ?? 0,
  }));
  return { width, height, images };
}

function clamp(value: number | undefined, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  return Math.round(Math.min(max, Math.max(min, value)));
}
