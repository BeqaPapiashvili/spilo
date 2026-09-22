import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseImages(images: unknown): string[] {
  if (Array.isArray(images)) return images.filter((item): item is string => typeof item === "string" && item.length > 0);
  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [images];
    } catch {
      return images ? [images] : [];
    }
  }
  return [];
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: "PUBLISHED", isApproved: true },
          orderBy: { createdAt: "desc" },
          include: { brand: true },
        },
      },
    });

    if (!store || !store.isActive) {
      return NextResponse.json({ success: false, error: "მაღაზია ვერ მოიძებნა" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
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
        products: store.products.map((product) => {
          const images = parseImages(product.images);
          return {
            id: product.id,
            title: product.title,
            slug: product.slug,
            price: product.price,
            discountPrice: product.discountPrice || undefined,
            monthlyInstallment: product.monthlyInstallment || undefined,
            stock: product.stock,
            image: images[0] || "",
            images,
            brandName: product.brand?.name,
          };
        }),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "მაღაზიის წამოღება ვერ მოხერხდა";
    console.error("GET /api/stores/[slug] error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
