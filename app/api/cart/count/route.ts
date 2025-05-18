import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ count: 0 });
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });

    const count =
      cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[CART_COUNT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
