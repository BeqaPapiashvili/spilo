import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { recordAuditLog } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const prisma = getPrismaClient();
    if (prisma.storefrontSection) {
      const sections = await prisma.storefrontSection.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: sections,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/homepage error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();

    if (!prisma.storefrontSection) {
      return NextResponse.json(
        { success: false, message: "StorefrontSection model is initializing. Please refresh." },
        { status: 500 }
      );
    }

    // Check if body is creating a single new section
    if (body.action === "create" || (body.title && !body.sections && !Array.isArray(body))) {
      const newSec = await prisma.storefrontSection.create({
        data: {
          key: body.key || `custom_${Date.now()}`,
          type: body.type || "PRODUCT_CAROUSEL",
          title: body.title || "ახალი სექცია",
          subtitle: body.subtitle || "",
          isEnabled: body.isEnabled !== undefined ? Boolean(body.isEnabled) : true,
          sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 99,
          config: body.config || {},
        },
      });

      try {
        revalidatePath("/");
        revalidatePath("/api/storefront/sections");
      } catch {}

      const allSections = await prisma.storefrontSection.findMany({
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json({
        success: true,
        data: allSections,
        created: newSec,
        message: "New section created successfully",
      });
    }

    // Support bulk sections array
    const sectionsToUpdate: any[] = Array.isArray(body)
      ? body
      : Array.isArray(body.sections)
      ? body.sections
      : [body];

    if (!sectionsToUpdate || sectionsToUpdate.length === 0) {
      return NextResponse.json(
        { success: false, message: "No section data provided for update" },
        { status: 400 }
      );
    }

    for (let i = 0; i < sectionsToUpdate.length; i++) {
      const item = sectionsToUpdate[i];
      if (!item.id && !item.key) continue;

      const updateData: any = {};

      if (typeof item.isEnabled === "boolean") {
        updateData.isEnabled = item.isEnabled;
      } else if (typeof item.enabled === "boolean") {
        updateData.isEnabled = item.enabled;
      }

      if (typeof item.sortOrder === "number") {
        updateData.sortOrder = item.sortOrder;
      } else if (Array.isArray(body) || Array.isArray(body.sections)) {
        updateData.sortOrder = i;
      }

      if (item.type !== undefined) updateData.type = item.type;
      if (item.title !== undefined) updateData.title = item.title;
      if (item.subtitle !== undefined) updateData.subtitle = item.subtitle;
      if (item.config !== undefined) updateData.config = item.config;

      if (item.id && item.id.length > 5) {
        try {
          await prisma.storefrontSection.update({
            where: { id: item.id },
            data: updateData,
          });
        } catch {
          if (item.key) {
            await prisma.storefrontSection.create({
              data: {
                key: item.key,
                type: item.type || "PRODUCT_CAROUSEL",
                title: item.title || "",
                subtitle: item.subtitle || "",
                isEnabled: updateData.isEnabled !== undefined ? updateData.isEnabled : true,
                sortOrder: updateData.sortOrder !== undefined ? updateData.sortOrder : i,
                config: item.config || null,
              },
            });
          }
        }
      } else if (item.key) {
        await prisma.storefrontSection.create({
          data: {
            key: item.key,
            type: item.type || "PRODUCT_CAROUSEL",
            title: item.title || "",
            subtitle: item.subtitle || "",
            isEnabled: updateData.isEnabled !== undefined ? updateData.isEnabled : true,
            sortOrder: updateData.sortOrder !== undefined ? updateData.sortOrder : i,
            config: item.config || null,
          },
        });
      }
    }

    // Instantly purge Next.js cache across storefront
    try {
      revalidatePath("/");
      revalidatePath("/api/storefront/sections");
    } catch (e) {
      console.warn("revalidatePath error:", e);
    }

    // Retrieve full updated list sorted by sortOrder
    const allSections = await prisma.storefrontSection.findMany({
      orderBy: { sortOrder: "asc" },
    });

    try {
      await recordAuditLog({
        action: "HOMEPAGE_SECTIONS_UPDATE",
        entity: "StorefrontSection",
        target: "მთავარი გვერდის სექციები",
        details: `განახლდა ${allSections.length} სექციის კონფიგურაცია და პოზიციები`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      data: allSections,
      message: "Homepage sections updated successfully",
    });
  } catch (error: any) {
    console.error("POST /api/admin/homepage error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update homepage sections" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await request.json();
        id = body.id;
      } catch {}
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Section ID is required for deletion" },
        { status: 400 }
      );
    }

    const deletedSec = await prisma.storefrontSection.delete({
      where: { id },
    }).catch(() => null);

    try {
      revalidatePath("/");
      revalidatePath("/api/storefront/sections");
    } catch {}

    try {
      await recordAuditLog({
        action: "HOMEPAGE_SECTION_DELETE",
        entity: "StorefrontSection",
        target: deletedSec?.title || id,
        details: `სექცია წაიშალა მთავარი გვერდიდან (ID: ${id})`,
      });
    } catch {}

    const allSections = await prisma.storefrontSection.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: allSections,
      message: "Section deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/homepage error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete section" },
      { status: 500 }
    );
  }
}
