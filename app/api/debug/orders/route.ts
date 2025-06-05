import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ambil semua order untuk debugging
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Ambil order spesifik user
    const userOrders = await prisma.order.findMany({
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

    // Ambil data user untuk memastikan ID benar
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      debug: {
        sessionUserId: session.user.id,
        userDetails: user,
        totalOrders: allOrders.length,
        userOrdersCount: userOrders.length,
      },
      allOrders,
      userOrders,
    });
  } catch (error) {
    console.error("[DEBUG_ORDERS_GET]", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
