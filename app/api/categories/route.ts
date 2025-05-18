import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch main categories (brands)
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    // Fetch sub-categories
    const subCategories = await prisma.category.findMany({
      where: {
        NOT: {
          parentId: null,
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    return NextResponse.json({
      mainCategories,
      subCategories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
