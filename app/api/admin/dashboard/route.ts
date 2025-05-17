import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      recentOrders,
      totalRevenue,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.category.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      }),
      prisma.order.aggregate({
        _sum: {
          total: true,
        },
        where: {
          status: "DELIVERED",
        },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalCategories,
      recentOrders,
      totalRevenue: totalRevenue._sum.total || 0,
    });
  } catch (error) {
    console.error("Error mengambil data dashboard:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data dashboard" },
      { status: 500 }
    );
  }
}
