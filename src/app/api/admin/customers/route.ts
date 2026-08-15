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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, email, role } = body;

    if (!userId && !email) {
      return NextResponse.json(
        { success: false, error: "მომხმარებლის ID ან ელ-ფოსტა აუცილებელია" },
        { status: 400 }
      );
    }

    if (!role) {
      return NextResponse.json(
        { success: false, error: "როლი აუცილებელია" },
        { status: 400 }
      );
    }

    // Update User table in MySQL
    let updatedUser = null;
    if (userId) {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role },
      }).catch(() => null);
    } else if (email) {
      updatedUser = await prisma.user.update({
        where: { email },
        data: { role },
      }).catch(() => null);
    }

    // Sync AdminUser table in MySQL
    const targetEmail = email || updatedUser?.email;
    if (targetEmail) {
      const isAdminRole = ["SUPER_ADMIN", "STORE_MANAGER", "SUPPORT_AGENT", "CATALOG_MANAGER"].includes(role);

      if (isAdminRole) {
        await prisma.adminUser.upsert({
          where: { email: targetEmail },
          update: { role, name: updatedUser?.name || targetEmail.split("@")[0] },
          create: {
            name: updatedUser?.name || targetEmail.split("@")[0],
            email: targetEmail,
            role,
            password: updatedUser?.password || "admin123",
          },
        }).catch(() => {});
      } else {
        await prisma.adminUser.delete({
          where: { email: targetEmail },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      message: `მომხმარებლის როლი შეიცვალა: ${role}`,
    });
  } catch (error: any) {
    console.error("PUT /api/admin/customers error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user role" },
      { status: 500 }
    );
  }
}
