import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";
import { loadHomeCategoryOptions, loadHomeCategoryStrip, parseHomeCategoryCards } from "@/lib/homeCategoryStrip";
import { HOME_CATEGORY_STRIP_KEY } from "@/types/homeCategoryStrip";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { errorResponse } = await requireAdminSession(request);
  if (errorResponse) return errorResponse;

  try {
    const [items, categories] = await Promise.all([
      loadHomeCategoryStrip(),
      loadHomeCategoryOptions(),
    ]);
    return NextResponse.json({ success: true, data: { items, categories } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "ვერ ჩაიტვირთა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { session, errorResponse } = await requireAdminSession(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const rawItems = Array.isArray(body?.items) ? body.items : [];
    for (const entry of rawItems) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const label = String(item.label || "").trim() || "ბარათი";
      const layers = Array.isArray(item.images) ? item.images : [];
      const urls = layers
        .map((layer) => (layer && typeof layer === "object" ? String((layer as { src?: string }).src || "").trim() : ""))
        .filter(Boolean);
      const legacy = String(item.image || "").trim();
      const sources = urls.length > 0 ? urls : legacy ? [legacy] : [];
      if (sources.length === 0) {
        return NextResponse.json(
          { success: false, message: `ატვირთე სურათი: ${label.replace(/\n/g, " ")}` },
          { status: 400 }
        );
      }
      if (sources.length > 6) {
        return NextResponse.json(
          { success: false, message: `ბარათზე მაქსიმუმ 6 სურათია: ${label.replace(/\n/g, " ")}` },
          { status: 400 }
        );
      }
      const invalid = sources.find((src) => (
        !src.startsWith("/uploads/") &&
        !src.startsWith("/home/categories/") &&
        !src.startsWith("https://") &&
        !src.startsWith("http://")
      ));
      if (invalid) {
        return NextResponse.json(
          { success: false, message: `სურათის მისამართი არასწორია: ${label.replace(/\n/g, " ")}` },
          { status: 400 }
        );
      }
    }

    const parsed = parseHomeCategoryCards(body?.items);
    if (parsed.length === 0) {
      return NextResponse.json({ success: false, message: "საჭიროა მინიმუმ ერთი კატეგორია სურათით" }, { status: 400 });
    }

    const options = await loadHomeCategoryOptions();
    const byOption = new Map(options.map((option) => [option.id, option]));
    const seen = new Set<string>();
    const items = [];

    for (const card of parsed) {
      const option = byOption.get(card.categoryId);
      if (!option) {
        return NextResponse.json(
          { success: false, message: `აირჩიე არსებული კატეგორია: ${card.label.replace(/\n/g, " ")}` },
          { status: 400 }
        );
      }
      if (seen.has(option.id)) {
        return NextResponse.json({ success: false, message: "ერთი კატეგორია ორჯერ ვერ დაემატება" }, { status: 400 });
      }
      seen.add(option.id);
      items.push({
        ...card,
        categoryId: option.id,
        slug: option.slug,
        href: option.href,
      });
    }

    const value = JSON.stringify(items);
    await prisma.systemSetting.upsert({
      where: { key: HOME_CATEGORY_STRIP_KEY },
      update: { value },
      create: { key: HOME_CATEGORY_STRIP_KEY, value },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "HOME_CATEGORY_STRIP_UPDATE",
      entity: "SystemSetting",
      target: HOME_CATEGORY_STRIP_KEY,
      details: `მთავარი გვერდის კატეგორიების ზოლი განახლდა (${items.length})`,
    });

    revalidatePath("/");

    return NextResponse.json({ success: true, data: { items } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "შენახვა ვერ მოხერხდა";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
