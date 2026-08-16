import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (!userId && !sessionId) {
      return NextResponse.json({ success: true, items: [] });
    }

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, items: cart?.items || [] });
  } catch (error: any) {
    return NextResponse.json({ success: true, items: [] });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { userId, sessionId, productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json({ success: false, error: "productId required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "პროდუქტი ვერ მოიძებნა" }, { status: 404 });
    }

    if (product.stock <= 0) {
      return NextResponse.json(
        { success: false, error: "პროდუქტი არ არის მარაგში (ამოწურულია)" },
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId, sessionId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const newQuantity = (existingItem?.quantity || 0) + Number(quantity);
    if (newQuantity > product.stock) {
      return NextResponse.json(
        { success: false, error: `მარაგში დარჩენილია მხოლოდ ${product.stock} ცალი` },
        { status: 400 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity: Number(quantity) || 1,
        },
      });
    }

    return NextResponse.json({ success: true, message: "დაემატა კალათაში" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const productId = searchParams.get("productId");
    const userId = searchParams.get("userId");
    const sessionId = searchParams.get("sessionId");

    if (itemId) {
      await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => {});
    } else if (productId) {
      const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id, productId },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
