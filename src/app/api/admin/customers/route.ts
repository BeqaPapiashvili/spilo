import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get("role");

    // 1. Fetch all users from User table in MySQL
    const users = await prisma.user.findMany({
      include: {
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // 2. Fetch admin users to ensure all admins/managers exist
    const adminUsers = await prisma.adminUser.findMany();
    const adminMap = new Map(adminUsers.map((a) => [a.email?.toLowerCase(), a]));

    const userEmailSet = new Set(users.map((u) => u.email?.toLowerCase()));

    // 3. Map User table records, prioritizing AdminUser role if present
    const formattedUsers = users.map((c) => {
      const activeOrders = c.orders.filter((o) => o.status !== "CANCELLED");
      const totalSpent = activeOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const adminRecord = c.email ? adminMap.get(c.email.toLowerCase()) : null;
      const effectiveRole = adminRecord?.role || c.role || "CUSTOMER";

      return {
        id: c.id,
        name: c.name || adminRecord?.name || c.email?.split("@")[0] || "მომხმარებელი",
        email: c.email || "",
        phone: c.phone || "",
        address: c.address || "",
        role: effectiveRole,
        registeredAt: c.createdAt.toISOString().split("T")[0],
        ordersCount: c.orders.length,
        totalSpent,
      };
    });

    // 4. Add any AdminUsers that aren't in User table yet
    const adminEntries = adminUsers
      .filter((a) => a.email && !userEmailSet.has(a.email.toLowerCase()))
      .map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        phone: "",
        address: "",
        role: a.role || "SUPER_ADMIN",
        registeredAt: a.createdAt.toISOString().split("T")[0],
        ordersCount: 0,
        totalSpent: 0,
      }));

    let allUsers = [...formattedUsers, ...adminEntries];

    // Filter by role if requested
    if (roleFilter && roleFilter !== "ALL") {
      if (roleFilter === "STAFF") {
        allUsers = allUsers.filter((u) => u.role !== "CUSTOMER");
      } else if (roleFilter === "CUSTOMERS") {
        allUsers = allUsers.filter((u) => u.role === "CUSTOMER");
      } else {
        allUsers = allUsers.filter((u) => u.role === roleFilter);
      }
    }

    return NextResponse.json({
      success: true,
      count: allUsers.length,
      data: allUsers,
    });
  } catch (error: any) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

import { requireAdminSession } from "@/lib/jwt";
import { recordAuditLog } from "@/lib/audit";

import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, email, phone, address, role = "CUSTOMER", password = "password123" } = body;

    if (!email || !name) {
      return NextResponse.json(
        { success: false, error: "სახელი და ელ-ფოსტა აუცილებელია" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(password.trim() || "password123", 10);

    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ამ ელ-ფოსტით უკვე არსებობს" },
        { status: 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        address: address ? address.trim() : null,
        role: role || "CUSTOMER",
        password: hashedPassword,
      },
    });

    const isAdminRole = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER"].includes(role);
    if (isAdminRole) {
      await prisma.adminUser.upsert({
        where: { email: cleanEmail },
        update: { role, name: name.trim() },
        create: {
          name: name.trim(),
          email: cleanEmail,
          role,
          password: hashedPassword,
        },
      });
    }

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "USER_CREATE",
      entity: "User",
      target: cleanEmail,
      details: `ადმინმა შექმნა ახალი მომხმარებელი/ადმინი (როლი: ${role})`,
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "მომხმარებელი წარმატებით შეიქმნა",
    });
  } catch (error: any) {
    console.error("POST /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { session, errorResponse } = await requireAdminSession(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { userId, email, role, name, phone, address, password } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "მომხმარებლის ID ან ელ-ფოსტა აუცილებელია" },
        { status: 400 }
      );
    }

    // Find existing user
    let existing = null;
    if (userId) {
      existing = await prisma.user.findUnique({ where: { id: userId } });
    }
    if (!existing && email) {
      existing = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (address !== undefined) updateData.address = address.trim();
    if (role !== undefined) updateData.role = role;
    if (password && password.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    let updatedUser = null;
    if (existing) {
      updatedUser = await prisma.user.update({
        where: { id: existing.id },
        data: updateData,
      });
    }

    // Sync AdminUser table in MySQL
    const targetEmail = email || existing?.email;
    const targetRole = role || existing?.role || "CUSTOMER";
    const targetName = name || existing?.name || targetEmail?.split("@")[0] || "Admin";

    if (targetEmail) {
      const isAdminRole = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER"].includes(targetRole);

      if (isAdminRole) {
        const adminData: any = { role: targetRole, name: targetName };
        if (updateData.password) adminData.password = updateData.password;

        await prisma.adminUser.upsert({
          where: { email: targetEmail.toLowerCase() },
          update: adminData,
          create: {
            name: targetName,
            email: targetEmail.toLowerCase(),
            role: targetRole,
            password: updateData.password || "admin123",
          },
        }).catch(() => {});
      } else {
        await prisma.adminUser.delete({
          where: { email: targetEmail.toLowerCase() },
        }).catch(() => {});
      }
    }

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "USER_UPDATE",
      entity: "User",
      target: targetEmail || userId,
      details: `მომხმარებლის მონაცემები განახლდა (როლი: ${targetRole})`,
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "მომხმარებლის მონაცემები წარმატებით განახლდა",
    });
  } catch (error: any) {
    console.error("PUT /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user" },
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
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { success: false, error: "ID ან ელ-ფოსტა აუცილებელია წასაშლელად" },
        { status: 400 }
      );
    }

    // Find User
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          id ? { id } : undefined,
          email ? { email } : undefined,
        ].filter(Boolean) as any,
      },
    });

    const targetEmail = email || user?.email;
    const targetUserId = id || user?.id;

    // Atomic cascading delete of all user records
    await prisma.$transaction(async (tx) => {
      if (targetUserId) {
        // 1. Delete cart & cart items
        const cart = await tx.cart.findUnique({ where: { userId: targetUserId } });
        if (cart) {
          await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
          await tx.cart.delete({ where: { id: cart.id } });
        }

        // 2. Delete reviews, price alerts, addresses
        await tx.review.deleteMany({ where: { userId: targetUserId } });
        await tx.priceAlert.deleteMany({ where: { userId: targetUserId } });
        await tx.address.deleteMany({ where: { userId: targetUserId } });

        // 3. Delete support tickets & messages
        const tickets = await tx.supportTicket.findMany({ where: { customerId: targetUserId } });
        for (const t of tickets) {
          await tx.supportMessage.deleteMany({ where: { ticketId: t.id } });
          await tx.supportTicket.delete({ where: { id: t.id } });
        }

        // 4. Unlink orders from userId (keep orders with customer name for accounting)
        await tx.order.updateMany({
          where: { userId: targetUserId },
          data: { userId: null },
        });

        // 5. Unlink audit logs
        await tx.auditLog.updateMany({
          where: { userId: targetUserId },
          data: { userId: null },
        });

        // 6. Delete user
        await tx.user.delete({ where: { id: targetUserId } }).catch(() => {});
      }

      // Delete from AdminUser table if exists
      if (targetEmail) {
        await tx.adminUser.deleteMany({ where: { email: targetEmail.toLowerCase() } }).catch(() => {});
      }
    });

    await recordAuditLog({
      userId: session?.userId,
      adminEmail: session?.email,
      adminName: session?.name,
      action: "USER_DELETE",
      entity: "User",
      target: targetEmail || targetUserId || "User",
      details: "მომხმარებელი სრულად წაიშალა მონაცემთა ბაზიდან",
    });

    return NextResponse.json({
      success: true,
      message: "მომხმარებელი წარმატებით წაიშალა",
    });
  } catch (error: any) {
    console.error("DELETE /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}

