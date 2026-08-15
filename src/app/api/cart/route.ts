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
      return NextResponse.json({ success: false, message: "productId required" }, { status: 400 });
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

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
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
