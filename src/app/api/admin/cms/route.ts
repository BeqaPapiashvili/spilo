import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditLog } from "@/lib/audit";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");
    const id = searchParams.get("id");

    if (id) {
      const page = await prisma.cMSPage.findUnique({ where: { id } });
      return NextResponse.json({ success: true, data: page });
    }

    if (slug) {
      const page = await prisma.cMSPage.findUnique({ where: { slug } });
      return NextResponse.json({ success: true, data: page });
    }

    const pages = await prisma.cMSPage.findMany({
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ success: true, count: pages.length, data: pages });
  } catch (error: any) {
    console.error("GET /api/admin/cms error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, slug, content } = body;

    if (!title || !slug) {
      return NextResponse.json({ success: false, message: "Title and slug are required" }, { status: 400 });
    }

    let result;

    if (id) {
      result = await prisma.cMSPage.update({
        where: { id },
        data: {
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          content: (content || "").trim(),
          lastUpdated: new Date(),
        },
      });

      await recordAuditLog({
        action: "CMS_PAGE_UPDATE",
        entity: "CMSPage",
        target: `${result.title} (${result.slug})`,
        details: "განახლდა სტატიკური გვერდის შიგთავსი",
      });
    } else {
      result = await prisma.cMSPage.create({
        data: {
          title: title.trim(),
          slug: slug.trim().toLowerCase(),
          content: (content || "").trim(),
          lastUpdated: new Date(),
        },
      });

      await recordAuditLog({
        action: "CMS_PAGE_CREATE",
        entity: "CMSPage",
        target: `${result.title} (${result.slug})`,
        details: "შეიქმნა ახალი CMS გვერდი",
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("POST /api/admin/cms error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return POST(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });
    }

    const existing = await prisma.cMSPage.findUnique({ where: { id } });

    await prisma.cMSPage.delete({ where: { id } });

    if (existing) {
      await recordAuditLog({
        action: "CMS_PAGE_DELETE",
        entity: "CMSPage",
        target: `${existing.title} (${existing.slug})`,
        details: "CMS გვერდი წაიშალა მონაცემთა ბაზიდან",
      });
    }

    return NextResponse.json({ success: true, message: "გვერდი წაიშალა" });
  } catch (error: any) {
    console.error("DELETE /api/admin/cms error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
