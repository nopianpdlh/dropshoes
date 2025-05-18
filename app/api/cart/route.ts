import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { productId, size, quantity } = body;

    if (!productId || !size || !quantity) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Cek apakah user sudah memiliki cart
    let cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    // Jika belum ada cart, buat baru
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: session.user.id,
        },
      });
    }

    // Cek apakah produk sudah ada di cart dengan ukuran yang sama
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId,
        size,
      },
    });

    if (existingCartItem) {
      // Update quantity jika item sudah ada
      await prisma.cartItem.update({
        where: {
          id: existingCartItem.id,
        },
        data: {
          quantity: existingCartItem.quantity + quantity,
        },
      });
    } else {
      // Buat cart item baru
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size,
          quantity,
          color: "default", // Sesuaikan dengan kebutuhan
        },
      });
    }

    return new NextResponse("Product added to cart", { status: 200 });
  } catch (error) {
    console.error("[CART_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(cart);
  } catch (error) {
    console.error("[CART_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
