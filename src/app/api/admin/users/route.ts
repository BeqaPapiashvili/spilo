import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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

import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, password, role, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "სახელი, ელ-ფოსტა და პაროლი აუცილებელია" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    const admin = await prisma.adminUser.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role || "STORE_MANAGER",
        status: status || "ACTIVE",
      },
    });

    // Also sync to User table for login compatibility
    await prisma.user.upsert({
      where: { email: cleanEmail },
      update: {
        name: name.trim(),
        password: hashedPassword,
        role: role || "STORE_MANAGER",
      },
      create: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: role || "STORE_MANAGER",
      },
    }).catch(() => {});

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ADMIN_USER_CREATE",
      entity: "AdminUser",
      target: `${admin.name} (${admin.email})`,
      details: `შეიქმნა ახალი ადმინისტრატორი როლით: ${admin.role}`,
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
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { id, name, email, status, role, password } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ადმინისტრატორის ID აუცილებელია" },
        { status: 400 }
      );
    }

    let hashedPassword: string | undefined = undefined;
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (status) updateData.status = status;
    if (role) updateData.role = role;
    if (hashedPassword) updateData.password = hashedPassword;

    const admin = await prisma.adminUser.update({
      where: { id },
      data: updateData,
    });

    // Also sync to User table
    if (admin.email) {
      await prisma.user.upsert({
        where: { email: admin.email },
        update: {
          name: admin.name,
          role: admin.role,
          ...(hashedPassword && { password: hashedPassword }),
        },
        create: {
          name: admin.name,
          email: admin.email,
          role: admin.role,
          password: hashedPassword || "admin123",
        },
      }).catch(() => {});
    }

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "ADMIN_USER_UPDATE",
      entity: "AdminUser",
      target: `${admin.name} (${admin.email})`,
      details: `განახლდა ადმინისტრატორის მონაცემები / როლი: ${admin.role}`,
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

export async function DELETE(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "ID აუცილებელია" },
        { status: 400 }
      );
    }

    const admin = await prisma.adminUser.findUnique({ where: { id } });
    if (admin) {
      await prisma.adminUser.delete({ where: { id } });
      if (admin.email) {
        await prisma.user.delete({ where: { email: admin.email } }).catch(() => {});
      }

      await recordAuditLog({
        userId: session?.userId,
        adminEmail: session?.email,
        adminName: session?.name,
        action: "ADMIN_USER_DELETE",
        entity: "AdminUser",
        target: `${admin.name} (${admin.email})`,
        details: "ადმინისტრატორი წაიშალა მონაცემთა ბაზიდან",
      });
    }

    return NextResponse.json({
      success: true,
      message: "ადმინისტრატორი წაიშალა MySQL ბაზიდან",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "ადმინისტრატორის წაშლა ვერ მოხერხდა" },
      { status: 500 }
    );
  }
}

