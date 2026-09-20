import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

function slugify(text: string): string {
  const geMap: Record<string, string> = {
    "ა": "a", "ბ": "b", "გ": "g", "დ": "d", "ე": "e", "ვ": "v", "ზ": "z", "თ": "t",
    "ი": "i", "კ": "k", "ლ": "l", "მ": "m", "ნ": "n", "ო": "o", "პ": "p", "ჟ": "zh",
    "რ": "r", "ს": "s", "ტ": "t", "უ": "u", "ფ": "f", "ქ": "k", "ღ": "gh", "ყ": "q",
    "შ": "sh", "ჩ": "ch", "ც": "ts", "ძ": "dz", "წ": "ts", "ჭ": "ch", "ხ": "kh", "ჯ": "j", "ჰ": "h"
  };

  const transliterated = text
    .split("")
    .map((char) => geMap[char] || char)
    .join("");

  return transliterated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || `item-${Date.now()}`;
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const products = Array.isArray(body.products) ? body.products : [];

    if (products.length === 0) {
      return NextResponse.json({ success: false, error: "დასაიმპორტებელი პროდუქტების სია ცარიელია" }, { status: 400 });
    }

    // Cache existing categories & brands to reduce DB queries
    const existingCategories = await prisma.category.findMany();
    const existingBrands = await prisma.brand.findMany();

    const categoryMap = new Map<string, string>(); // name/slug -> id
    existingCategories.forEach((c) => {
      categoryMap.set(c.id.toLowerCase(), c.id);
      categoryMap.set(c.name.toLowerCase().trim(), c.id);
      categoryMap.set(c.slug.toLowerCase().trim(), c.id);
    });

    const brandMap = new Map<string, string>(); // name/slug -> id
    existingBrands.forEach((b) => {
      brandMap.set(b.id.toLowerCase(), b.id);
      brandMap.set(b.name.toLowerCase().trim(), b.id);
      brandMap.set(b.slug.toLowerCase().trim(), b.id);
    });

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (let idx = 0; idx < products.length; idx++) {
      const item = products[idx];
      const title = (item.title || "").trim();
      if (!title) {
        errors.push(`ხაზი #${item.rowIndex || idx + 1}: სათაური აკლია`);
        continue;
      }

      const price = Number(item.price);
      if (isNaN(price) || price <= 0) {
        errors.push(`პროდუქტი "${title}": ფასი არასწორია (${item.price})`);
        continue;
      }

      const sku = (item.sku || "").trim() || `SKU-${Date.now()}-${idx}`;
      const categoryName = (item.categoryName || "სხვა").trim();
      const brandName = (item.brandName || "Generic").trim();

      // Resolve Category
      let categoryId = categoryMap.get(categoryName.toLowerCase());
      if (!categoryId) {
        const catSlug = slugify(categoryName);
        categoryId = categoryMap.get(catSlug);
      }
      if (!categoryId) {
        const catSlug = `${slugify(categoryName)}-${Date.now().toString().slice(-4)}`;
        try {
          const newCat = await prisma.category.create({
            data: {
              name: categoryName,
              slug: catSlug,
              icon: "Tag",
            },
          });
          categoryId = newCat.id;
          categoryMap.set(categoryName.toLowerCase(), categoryId);
          categoryMap.set(catSlug, categoryId);
        } catch {
          // Fallback to first available category
          categoryId = existingCategories[0]?.id || "mobiles";
        }
      }

      // Resolve Brand
      let brandId = brandMap.get(brandName.toLowerCase());
      if (!brandId) {
        const bSlug = slugify(brandName);
        brandId = brandMap.get(bSlug);
      }
      if (!brandId) {
        const bSlug = `${slugify(brandName)}-${Date.now().toString().slice(-4)}`;
        try {
          const newBrand = await prisma.brand.create({
            data: {
              name: brandName,
              slug: bSlug,
            },
          });
          brandId = newBrand.id;
          brandMap.set(brandName.toLowerCase(), brandId);
          brandMap.set(bSlug, brandId);
        } catch {
          brandId = existingBrands[0]?.id || "apple";
        }
      }

      // Format Images
      let images: string[] = [];
      if (Array.isArray(item.allImages) && item.allImages.length > 0) {
        images = item.allImages.filter((img: string) => typeof img === "string" && img.trim().length > 0);
      } else if (Array.isArray(item.images) && item.images.length > 0) {
        images = item.images.filter((img: string) => typeof img === "string" && img.trim().length > 0);
      } else if (item.mainImage) {
        images = [item.mainImage.trim()];
      }
      if (images.length === 0) {
        images = ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80"];
      }

      const costPrice = item.costPrice !== undefined && item.costPrice !== null && item.costPrice !== "" ? Number(item.costPrice) : null;
      const stock = item.stock !== undefined && item.stock !== null && !isNaN(Number(item.stock)) ? Math.max(0, parseInt(String(item.stock), 10)) : 10;
      const description = (item.description || "").trim() || `${title} - დეტალური ინფორმაცია და მახასიათებლები.`;
      const colorName = (item.colorName || "").trim() || null;
      const specs = item.specs || null;

      // Check if product with this SKU already exists
      const existingProduct = await prisma.product.findUnique({
        where: { sku },
      });

      if (existingProduct) {
        // Update existing product
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            title,
            price,
            costPrice: costPrice !== null && !isNaN(costPrice) ? costPrice : existingProduct.costPrice,
            stock,
            categoryId,
            brandId,
            images,
            specs: specs || existingProduct.specs,
            description,
            colorName: colorName || existingProduct.colorName,
          },
        });
        updatedCount++;
      } else {
        // Create new product
        const baseSlug = slugify(title);
        const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}-${idx}`;

        await prisma.product.create({
          data: {
            title,
            slug: uniqueSlug,
            sku,
            description,
            price,
            costPrice: costPrice !== null && !isNaN(costPrice) ? costPrice : null,
            stock,
            categoryId,
            brandId,
            images,
            specs: specs || null,
            colorName: colorName || null,
            isFeatured: false,
            status: "PENDING_REVIEW",
            isApproved: false,
          },
        });
        createdCount++;
      }
    }

    // Record audit log
    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "PRODUCT_BULK_IMPORT",
      entity: "Product",
      target: `ექსელის იმპორტი (${createdCount} ახალი, ${updatedCount} განახლებული)`,
      details: `ადმინისტრაციამ გადაამოწმა და დაამტკიცა ${createdCount + updatedCount} პროდუქტი. შეცდომები: ${errors.length}`,
    });

    return NextResponse.json({
      success: true,
      createdCount,
      updatedCount,
      totalProcessed: createdCount + updatedCount,
      errors,
    });
  } catch (error: any) {
    console.error("POST /api/products/bulk-import error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "იმპორტის დროს დაფიქსირდა შეცდომა" },
      { status: 500 }
    );
  }
}
