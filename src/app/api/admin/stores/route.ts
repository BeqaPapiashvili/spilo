import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";
import { slugifyStoreName, uniqueStoreSlug } from "@/lib/storeSlug";

function refreshStorefront(slug: string, previousSlug?: string) {
  revalidatePath("/stores");
  revalidatePath(`/stores/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/stores/${previousSlug}`);
  }
}

function emptyToNull(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

async function slugTaken(slug: string, exceptId?: string) {
  const existing = await prisma.store.findUnique({ where: { slug }, select: { id: true } });
  return Boolean(existing && existing.id !== exceptId);
}

export async function GET(request: Request) {
  try {
    const { errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const stores = await prisma.store.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true, merchants: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: stores.map((store) => ({
        ...store,
        productCount: store._count.products,
        merchantCount: store._count.merchants,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიების წამოღება ვერ მოხერხდა";
    console.error("GET /api/admin/stores error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const name = String(body.name || "").trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "მაღაზიის სახელი აუცილებელია" }, { status: 400 });
    }

    const requestedSlug = String(body.slug || "").trim() || slugifyStoreName(name);
    const slug = await uniqueStoreSlug(requestedSlug, (value) => slugTaken(value));

    const store = await prisma.store.create({
      data: {
        name,
        slug,
        logo: emptyToNull(body.logo),
        coverImage: emptyToNull(body.coverImage),
        description: emptyToNull(body.description),
        phone: emptyToNull(body.phone),
        address: emptyToNull(body.address),
        facebookUrl: emptyToNull(body.facebookUrl),
        instagramUrl: emptyToNull(body.instagramUrl),
        websiteUrl: emptyToNull(body.websiteUrl),
        city: emptyToNull(body.city),
        email: emptyToNull(body.email),
        workingHours: emptyToNull(body.workingHours),
        mapUrl: emptyToNull(body.mapUrl),
        pickupEnabled: Boolean(body.pickupEnabled),
        pickupNote: emptyToNull(body.pickupNote),
        sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
        isActive: body.isActive !== false,
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "STORE_CREATE",
      entity: "Store",
      target: `${store.name} (${store.slug})`,
      details: "შეიქმნა ახალი მაღაზია",
    });

    refreshStorefront(store.slug);

    return NextResponse.json({ success: true, data: store });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიის შექმნა ვერ მოხერხდა";
    console.error("POST /api/admin/stores error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const id = String(body.id || "").trim();
    if (!id) {
      return NextResponse.json({ success: false, error: "მაღაზიის ID აუცილებელია" }, { status: 400 });
    }

    const existing = await prisma.store.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    const name = String(body.name || existing.name).trim();
    const requestedSlug = String(body.slug || existing.slug).trim() || slugifyStoreName(name);
    const slug =
      requestedSlug === existing.slug
        ? existing.slug
        : await uniqueStoreSlug(requestedSlug, (value) => slugTaken(value, id));

    const store = await prisma.store.update({
      where: { id },
      data: {
        name,
        slug,
        logo: body.logo !== undefined ? emptyToNull(body.logo) : undefined,
        coverImage: body.coverImage !== undefined ? emptyToNull(body.coverImage) : undefined,
        description: body.description !== undefined ? emptyToNull(body.description) : undefined,
        phone: body.phone !== undefined ? emptyToNull(body.phone) : undefined,
        address: body.address !== undefined ? emptyToNull(body.address) : undefined,
        facebookUrl: body.facebookUrl !== undefined ? emptyToNull(body.facebookUrl) : undefined,
        instagramUrl: body.instagramUrl !== undefined ? emptyToNull(body.instagramUrl) : undefined,
        websiteUrl: body.websiteUrl !== undefined ? emptyToNull(body.websiteUrl) : undefined,
        city: body.city !== undefined ? emptyToNull(body.city) : undefined,
        email: body.email !== undefined ? emptyToNull(body.email) : undefined,
        workingHours: body.workingHours !== undefined ? emptyToNull(body.workingHours) : undefined,
        mapUrl: body.mapUrl !== undefined ? emptyToNull(body.mapUrl) : undefined,
        pickupEnabled: body.pickupEnabled !== undefined ? Boolean(body.pickupEnabled) : undefined,
        pickupNote: body.pickupNote !== undefined ? emptyToNull(body.pickupNote) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) || 0 : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "STORE_UPDATE",
      entity: "Store",
      target: `${store.name} (${store.slug})`,
      details: "მაღაზია განახლდა",
    });

    refreshStorefront(store.slug, existing.slug);

    return NextResponse.json({ success: true, data: store });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიის განახლება ვერ მოხერხდა";
    console.error("PUT /api/admin/stores error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || "";
    if (!id) {
      return NextResponse.json({ success: false, error: "მაღაზიის ID აუცილებელია" }, { status: 400 });
    }

    const existing = await prisma.store.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    await prisma.store.delete({ where: { id } });
    refreshStorefront(existing.slug);

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "STORE_DELETE",
      entity: "Store",
      target: `${existing.name} (${existing.slug})`,
      details: `წაიშალა მაღაზია. პროდუქტები: ${existing._count.products}`,
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიის წაშლა ვერ მოხერხდა";
    console.error("DELETE /api/admin/stores error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
