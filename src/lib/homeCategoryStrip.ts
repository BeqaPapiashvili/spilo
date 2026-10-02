import { prisma } from "@/lib/prisma";
import {
  DEFAULT_HOME_CATEGORY_CARDS,
  HOME_CATEGORY_STRIP_KEY,
  type HomeCategoryCard,
  type HomeCategoryImage,
} from "@/types/homeCategoryStrip";

export type HomeCategoryOption = {
  id: string;
  name: string;
  slug: string;
  parentName: string | null;
  href: string;
};

type NestedCategory = {
  id?: string;
  name?: string;
  slug?: string;
  brandQuery?: string;
  items?: NestedCategory[];
};

function isRow(value: unknown): value is 1 | 2 {
  return value === 1 || value === 2;
}

function bounded(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return undefined;
  return Math.round(Math.min(max, Math.max(min, value)));
}

function isSafeImage(value: string) {
  return (
    value.startsWith("/uploads/") ||
    value.startsWith("/home/categories/") ||
    value.startsWith("https://") ||
    value.startsWith("http://")
  );
}

function parseHref(value: unknown) {
  const href = String(value || "").trim();
  if (href.startsWith("/catalog?") || href.startsWith("/categories/")) return href.slice(0, 400);
  return undefined;
}

function nestedNode(value: unknown): NestedCategory | null {
  if (!value || typeof value !== "object") return null;
  const node = value as NestedCategory;
  const id = String(node.id || "").trim();
  const name = String(node.name || "").trim();
  if (!id || !name) return null;
  return node;
}

function parseImage(entry: unknown, index: number): HomeCategoryImage | null {
  if (!entry || typeof entry !== "object") return null;
  const image = entry as Record<string, unknown>;
  const src = String(image.src || "").trim();
  if (!isSafeImage(src)) return null;
  return {
    id: String(image.id || `img-${index}`),
    src,
    x: bounded(Number(image.x), -240, 420) ?? 40,
    y: bounded(Number(image.y), -240, 420) ?? 12,
    w: bounded(Number(image.w), 24, 320) ?? 88,
    h: bounded(Number(image.h), 24, 320) ?? 88,
    rotate: bounded(Number(image.rotate), -180, 180) ?? 0,
  };
}

export function parseHomeCategoryCards(raw: unknown): HomeCategoryCard[] {
  if (!Array.isArray(raw)) return [];
  const cards: HomeCategoryCard[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const item = entry as Record<string, unknown>;
    const slug = String(item.slug || "").trim();
    const label = String(item.label || "").trim();
    if (!slug || !label || !isRow(item.row)) continue;

    let images = Array.isArray(item.images)
      ? item.images.map(parseImage).filter((image): image is HomeCategoryImage => Boolean(image))
      : [];

    if (images.length === 0) {
      const legacy = parseImage({
        id: `${String(item.id || slug)}-1`,
        src: item.image,
        x: item.imageX,
        y: item.imageY,
        w: item.imageW,
        h: item.imageH,
        rotate: 0,
      }, 0);
      if (legacy) images = [legacy];
    }

    if (images.length === 0) continue;
    cards.push({
      id: String(item.id || slug),
      categoryId: String(item.categoryId || ""),
      slug,
      href: parseHref(item.href),
      label: label.slice(0, 80),
      row: item.row,
      width: bounded(Number(item.width), 110, 360),
      height: bounded(Number(item.height), 72, 220),
      images: images.slice(0, 6),
    });
    if (cards.length >= 20) break;
  }
  return cards;
}

export async function loadHomeCategoryOptions(): Promise<HomeCategoryOption[]> {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true, parentId: true, childrenJson: true },
    orderBy: { name: "asc" },
  });
  const names = new Map(categories.map((category) => [category.id, category.name]));
  const options: HomeCategoryOption[] = [];

  for (const category of categories) {
    const catalogSlug = category.slug;
    options.push({
      id: category.id,
      name: category.name,
      slug: catalogSlug,
      parentName: category.parentId ? names.get(category.parentId) || null : null,
      href: `/catalog?category=${encodeURIComponent(catalogSlug)}`,
    });

    let children: unknown[] = [];
    if (category.childrenJson) {
      try {
        const parsed = JSON.parse(category.childrenJson);
        if (Array.isArray(parsed)) children = parsed;
      } catch {
        children = [];
      }
    }

    for (const entry of children) {
      const sub = nestedNode(entry);
      if (!sub?.id || !sub.name) continue;
      const subSlug = String(sub.slug || sub.id).trim();
      options.push({
        id: `${category.id}::${sub.id}`,
        name: sub.name,
        slug: catalogSlug,
        parentName: category.name,
        href: `/categories/${encodeURIComponent(catalogSlug)}/${encodeURIComponent(subSlug)}`,
      });

      for (const itemEntry of Array.isArray(sub.items) ? sub.items : []) {
        const item = nestedNode(itemEntry);
        if (!item?.id || !item.name) continue;
        const brand = String(item.brandQuery || "").trim();
        const href = brand
          ? `/catalog?category=${encodeURIComponent(catalogSlug)}&brand=${encodeURIComponent(brand)}`
          : `/catalog?category=${encodeURIComponent(catalogSlug)}&q=${encodeURIComponent(item.name)}`;
        options.push({
          id: `${category.id}::${sub.id}::${item.id}`,
          name: item.name,
          slug: catalogSlug,
          parentName: `${category.name} / ${sub.name}`,
          href,
        });
      }
    }
  }

  return options.sort((a, b) => {
    const depthA = a.parentName ? a.parentName.split(" / ").length : 0;
    const depthB = b.parentName ? b.parentName.split(" / ").length : 0;
    if (depthA !== depthB) return depthA - depthB;
    const pathA = a.parentName ? `${a.parentName} / ${a.name}` : a.name;
    const pathB = b.parentName ? `${b.parentName} / ${b.name}` : b.name;
    return pathA.localeCompare(pathB, "ka");
  });
}

export async function loadHomeCategoryStrip(): Promise<HomeCategoryCard[]> {
  let stored: HomeCategoryCard[] | null = null;
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: HOME_CATEGORY_STRIP_KEY },
    });
    if (setting?.value) stored = parseHomeCategoryCards(JSON.parse(setting.value));
  } catch (error) {
    console.error("loadHomeCategoryStrip error:", error);
  }

  const source = stored && stored.length > 0 ? stored : DEFAULT_HOME_CATEGORY_CARDS;
  const [categories, options] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
    }),
    loadHomeCategoryOptions(),
  ]);
  const byId = new Map(categories.map((category) => [category.id, category]));
  const bySlug = new Map(categories.map((category) => [category.slug, category]));
  const optionById = new Map(options.map((option) => [option.id, option]));

  return source.flatMap((card) => {
    const option = card.categoryId ? optionById.get(card.categoryId) : undefined;
    if (option) {
      return [{
        ...card,
        categoryId: option.id,
        slug: option.slug,
        href: option.href,
      }];
    }
    const category = (card.categoryId && byId.get(card.categoryId)) || bySlug.get(card.slug);
    if (!category && card.categoryId) return [];
    return [{
      ...card,
      categoryId: category?.id || "",
      slug: category?.slug || card.slug,
    }];
  });
}
