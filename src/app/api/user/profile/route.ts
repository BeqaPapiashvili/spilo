import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/jwt";

export async function GET(request: Request) {
  try {
    // 1. Enforce verified session (IDOR prevention - ignore arbitrary query parameters)
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    // 2. Fetch authenticated user data strictly by session userId
    let user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user && session.email) {
      user = await prisma.user.findFirst({
        where: { email: session.email },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // 3. Fetch orders strictly belonging to this authenticated user
    let orders: any[] = [];
    try {
      orders = await prisma.order.findMany({
        where: { userId: user.id },
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
          image: i.image || "/placeholder.png",
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
  try {
    // 1. Enforce verified session (IDOR prevention)
    const session = await getAuthSession(request);
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "ავტორიზაცია აუცილებელია (Unauthorized)" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      name,
      phone,
      isGeorgianCitizen,
      idNumber,
      address,
      smsNotify,
      emailNotify,
    } = body;

    const computedName =
      name || (firstName || lastName ? `${firstName || ""} ${lastName || ""}`.trim() : undefined);

    // 2. Lookup authenticated user
    const existingUser = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "მომხმარებელი ვერ მოიძებნა" },
        { status: 404 }
      );
    }

    // 3. Construct update payload strictly allowing safe customer fields (no role escalation or ID tampering)
    const updateData: any = {};
    if (computedName !== undefined) updateData.name = computedName;
    if (phone !== undefined) updateData.phone = phone;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (isGeorgianCitizen !== undefined) updateData.isGeorgianCitizen = Boolean(isGeorgianCitizen);
    if (idNumber !== undefined) updateData.idNumber = idNumber;
    if (address !== undefined) updateData.address = address;
    if (smsNotify !== undefined) updateData.smsNotify = Boolean(smsNotify);
    if (emailNotify !== undefined) updateData.emailNotify = Boolean(emailNotify);

    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: updateData,
    });

    const splitName = (updatedUser.name || "").split(" ");

    return NextResponse.json({
      success: true,
      message: "პროფილის მონაცემები წარმატებით განახლდა",
      user: {
        id: updatedUser.id,
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        name: updatedUser.name || "",
        firstName: updatedUser.firstName || splitName[0] || "",
        lastName: updatedUser.lastName || splitName.slice(1).join(" ") || "",
        role: updatedUser.role || "CUSTOMER",
        isGeorgianCitizen: updatedUser.isGeorgianCitizen ?? true,
        idNumber: updatedUser.idNumber || "",
        address: updatedUser.address || "",
        smsNotify: updatedUser.smsNotify ?? true,
        emailNotify: updatedUser.emailNotify ?? true,
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
