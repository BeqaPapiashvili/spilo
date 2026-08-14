import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const adminUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: adminUsers.length,
      data: adminUsers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch admin users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "სახელი, ელ-ფოსტა და პაროლი აუცილებელია" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.create({
      data: {
        name,
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role: role || "STORE_MANAGER",
        status: status || "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
      message: "ადმინისტრატორი შეიქმნა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("POST /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ადმინისტრატორის შექმნა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status, role, password } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ადმინისტრატორის ID აუცილებელია" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(role && { role }),
        ...(password && { password: password.trim() }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        status: admin.status,
      },
      message: "ადმინისტრატორი განახლდა MySQL ბაზაში",
    });
  } catch (error: any) {
    console.error("PUT /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ადმინისტრატორის განახლება ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}
