import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { quantity } = await req.json();

    if (typeof quantity !== "number" || quantity < 1) {
      return new NextResponse("Invalid quantity", { status: 400 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    if (cartItem.cart.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: params.itemId },
      data: { quantity },
    });

    return NextResponse.json(updatedCartItem);
  } catch (error) {
    console.error("[CART_ITEM_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: params.itemId },
      include: { cart: true },
    });

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    if (cartItem.cart.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.cartItem.delete({
      where: { id: params.itemId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CART_ITEM_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
