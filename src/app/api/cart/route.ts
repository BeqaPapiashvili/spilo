import { NextResponse } from "next/server";
import { getPrismaClient } from "@/lib/prisma";
import { identityWhere, jsonWithIdentity, resolveIdentity } from "@/lib/identity";

export async function GET(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const cart = await prisma.cart.findFirst({
      where: identityWhere(identity),
      include: { items: { include: { product: true } } },
    });

    return jsonWithIdentity({ success: true, items: cart?.items || [] }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "კალათის წამოღება ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message, items: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return jsonWithIdentity({ success: false, error: "პროდუქტის ID აუცილებელია" }, identity, {
        status: 400,
      });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return jsonWithIdentity({ success: false, error: "პროდუქტი ვერ მოიძებნა" }, identity, {
        status: 404,
      });
    }

    if (product.stock <= 0) {
      return jsonWithIdentity(
        { success: false, error: "პროდუქტი არ არის მარაგში (ამოწურულია)" },
        identity,
        { status: 400 }
      );
    }

    let cart = await prisma.cart.findFirst({ where: identityWhere(identity) });
    if (!cart) {
      cart = await prisma.cart.create({
        data: identity.userId ? { userId: identity.userId } : { sessionId: identity.sessionId },
      });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    const newQuantity = (existingItem?.quantity || 0) + Number(quantity);
    if (newQuantity > product.stock) {
      return jsonWithIdentity(
        { success: false, error: `მარაგში დარჩენილია მხოლოდ ${product.stock} ცალი` },
        identity,
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

    return jsonWithIdentity({ success: true, message: "დაემატა კალათაში" }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "კალათაში დამატება ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const identity = await resolveIdentity(request);
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");
    const productId = searchParams.get("productId");

    if (itemId) {
      const item = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { cart: true },
      });
      const ownsCart =
        item &&
        ((identity.userId && item.cart.userId === identity.userId) ||
          (identity.sessionId && item.cart.sessionId === identity.sessionId));
      if (ownsCart) {
        await prisma.cartItem.delete({ where: { id: itemId } });
      }
    } else if (productId) {
      const cart = await prisma.cart.findFirst({ where: identityWhere(identity) });
      if (cart) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
      }
    }

    return jsonWithIdentity({ success: true }, identity);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "წაშლა ვერ მოხერხდა";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
