import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = (searchParams.get("q") || "").trim();
    const stores = await prisma.store.findMany({
      where: {
        isActive: true,
        ...(query
          ? {
              AND: query.split(/[\s,]+/).filter(Boolean).map((token) => ({
                OR: [
                  { name: { contains: token } },
                  { slug: { contains: token } },
                  { description: { contains: token } },
                  { city: { contains: token } },
                ],
              })),
            }
          : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: {
          select: {
            products: {
              where: { status: "PUBLISHED", isApproved: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: stores.length,
      data: stores.map((store) => ({
        id: store.id,
        name: store.name,
        slug: store.slug,
        logo: store.logo,
        coverImage: store.coverImage,
        description: store.description,
        phone: store.phone,
        address: store.address,
        facebookUrl: store.facebookUrl,
        instagramUrl: store.instagramUrl,
        websiteUrl: store.websiteUrl,
        city: store.city,
        email: store.email,
        workingHours: store.workingHours,
        mapUrl: store.mapUrl,
        pickupEnabled: store.pickupEnabled,
        pickupNote: store.pickupNote,
        productCount: store._count.products,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიების წამოღება ვერ მოხერხდა";
    console.error("GET /api/stores error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
