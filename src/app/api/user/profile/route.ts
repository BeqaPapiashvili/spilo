import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  const prisma = getPrismaClient();
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");
    const id = searchParams.get("id");

    if (!email && !phone && !id) {
      return NextResponse.json(
        { success: false, error: "მომხმარებლის იდენტიფიკატორი მიუთითეთ" },
        { status: 400 }
      );
    }

    const whereConditions: any[] = [];
    if (id) whereConditions.push({ id });
    if (email) whereConditions.push({ email });
    if (phone) whereConditions.push({ phone });

    let user = await prisma.user.findFirst({
      where: { OR: whereConditions },
    });

    // If user not in User table, search in AdminUser and sync to User table
    if (!user && email) {
      const admin = await prisma.adminUser.findFirst({
        where: { email },
      });
      if (admin) {
        user = await prisma.user.upsert({
          where: { email: admin.email },
          update: { role: admin.role, name: admin.name },
          create: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            password: admin.password || "admin123",
            role: admin.role,
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // Fetch orders associated with this user
    const orderWhere: any[] = [{ userId: user.id }];
    if (user.phone) orderWhere.push({ contactPhone: user.phone });
    if (user.email) orderWhere.push({ customerName: user.name });

    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        where: { OR: orderWhere },
        include: { items: true },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.warn("Could not fetch orders for user profile:", err);
    }

    const fullName = user.name || "";
    const splitName = fullName.split(" ");
    const computedFirstName = user.firstName || splitName[0] || "";
    const computedLastName = user.lastName || splitName.slice(1).join(" ") || "";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email || "",
        phone: user.phone || "",
        name: user.name || "",
        firstName: computedFirstName,
        lastName: computedLastName,
        role: user.role,
        isGeorgianCitizen: user.isGeorgianCitizen ?? true,
        idNumber: user.idNumber || "",
        address: user.address || "",
        smsNotify: user.smsNotify ?? true,
        emailNotify: user.emailNotify ?? true,
      },
      orders: orders.map((o: any) => ({
        id: o.orderNumber || o.id,
        date: new Date(o.createdAt).toLocaleDateString("ka-GE", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        status:
          o.status === "DELIVERED" || o.status === "ჩაბარებულია"
            ? "ჩაბარებულია"
            : o.status === "SHIPPED" || o.status === "გზაშია"
            ? "გზაშია"
            : o.status === "CANCELLED" || o.status === "გაუქმებულია"
            ? "გაუქმებულია"
            : "მუშავდება",
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        address: o.shippingAddress,
        items: (o.items || []).map((i: any) => ({
          id: i.productId,
          title: i.title,
          price: i.price,
          image: i.image || "https://veli.store/media-cdn/__sized__/product/iphone16pro-thumbnail-200x200-95.jpg",
          quantity: i.quantity,
        })),
      })),
    });
  } catch (error: any) {
    console.error("GET /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პროფილის წამოღების შეცდომა" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const prisma = getPrismaClient();
  try {
    const body = await request.json();
    const {
      id,
      email,
      phone,
      firstName,
      lastName,
      name,
      isGeorgianCitizen,
      idNumber,
      address,
      smsNotify,
      emailNotify,
    } = body;

    if (!email && !phone && !id) {
      return NextResponse.json(
        { success: false, error: "მომხმარებლის იდენტიფიკატორი მიუთითეთ" },
        { status: 400 }
      );
    }

    const computedName =
      name || (firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : undefined);

    let existingUser = id ? await prisma.user.findUnique({ where: { id } }) : null;

    if (!existingUser) {
      const whereConditions: any[] = [];
      if (email) whereConditions.push({ email });
      if (phone) whereConditions.push({ phone });
      existingUser = await prisma.user.findFirst({
        where: { OR: whereConditions },
      });
    }

    // If user not in User table yet, search in AdminUser table and sync
    if (!existingUser && email) {
      const admin = await prisma.adminUser.findFirst({
        where: { email },
      });
      if (admin) {
        existingUser = await prisma.user.upsert({
          where: { email: admin.email },
          update: { role: admin.role, name: admin.name },
          create: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            password: admin.password || "admin123",
            role: admin.role,
          },
        });
      }
    }

    // If still not found, create new User record in MySQL
    if (!existingUser) {
      const targetEmail = email || `user_${Date.now()}@spilo.ge`;
      existingUser = await prisma.user.create({
        data: {
          email: targetEmail,
          phone: phone || null,
          name: computedName || "მომხმარებელი",
          role: "CUSTOMER",
        },
      });
    }

    const updateData: any = {};
    if (computedName !== undefined) updateData.name = computedName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (isGeorgianCitizen !== undefined) updateData.isGeorgianCitizen = Boolean(isGeorgianCitizen);
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (address !== undefined) updateData.address = address;
    if (smsNotify !== undefined) updateData.smsNotify = Boolean(smsNotify);
    if (emailNotify !== undefined) updateData.emailNotify = Boolean(emailNotify);

    let updatedUser: any;

    try {
      updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: updateData,
      });
    } catch (err: any) {
      console.warn("Prisma update fallback, using direct SQL update:", err?.message);
      await prisma.$executeRawUnsafe(
        `UPDATE User SET name = ?, email = ?, phone = ?, address = ?, firstName = ?, lastName = ?, idNumber = ?, isGeorgianCitizen = ?, smsNotify = ?, emailNotify = ? WHERE id = ?`,
        computedName || existingUser.name || null,
        email !== undefined ? email : existingUser.email,
        phone !== undefined ? phone : existingUser.phone,
        address !== undefined ? address : existingUser.address || null,
        firstName !== undefined ? firstName : existingUser.firstName || null,
        lastName !== undefined ? lastName : existingUser.lastName || null,
        idNumber !== undefined ? idNumber : existingUser.idNumber || null,
        isGeorgianCitizen !== undefined ? (isGeorgianCitizen ? 1 : 0) : (existingUser.isGeorgianCitizen ? 1 : 0),
        smsNotify !== undefined ? (smsNotify ? 1 : 0) : (existingUser.smsNotify ? 1 : 0),
        emailNotify !== undefined ? (emailNotify ? 1 : 0) : (existingUser.emailNotify ? 1 : 0),
        existingUser.id
      ).catch((sqlErr) => console.warn("Raw SQL update error:", sqlErr));

      updatedUser = await prisma.user.findUnique({
        where: { id: existingUser.id },
      });
    }

    const finalAddress = updatedUser?.address || address || "";
    const splitName = (updatedUser?.name || "").split(" ");

    return NextResponse.json({
      success: true,
      message: "პროფილის მონაცემები წარმატებით განახლდა ბაზაში",
      user: {
        id: existingUser.id,
        email: updatedUser?.email || email || "",
        phone: updatedUser?.phone || phone || "",
        name: updatedUser?.name || computedName || "",
        firstName: updatedUser?.firstName || firstName || splitName[0] || "",
        lastName: updatedUser?.lastName || lastName || splitName.slice(1).join(" ") || "",
        role: updatedUser?.role || "CUSTOMER",
        isGeorgianCitizen: updatedUser?.isGeorgianCitizen ?? true,
        idNumber: updatedUser?.idNumber || idNumber || "",
        address: finalAddress,
        smsNotify: updatedUser?.smsNotify ?? true,
        emailNotify: updatedUser?.emailNotify ?? true,
      },
    });
  } catch (error: any) {
    console.error("PUT /api/user/profile error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "პროფილის განახლების შეცდომა" },
      { status: 500 }
    );
  }
}
