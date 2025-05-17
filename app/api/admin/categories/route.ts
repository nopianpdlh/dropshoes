import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/admin/categories
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Pisahkan kategori utama dan sub-kategori
    const mainCategories = categories.filter((category) => !category.parent);
    const subCategories = categories.filter((category) => category.parent);

    return NextResponse.json({
      mainCategories,
      subCategories,
    });
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// POST /api/admin/categories
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return new NextResponse("Parent category not found", { status: 404 });
      }
    }

    const createData: Prisma.CategoryCreateInput = {
      name,
      ...(parentId && {
        parent: {
          connect: { id: parentId },
        },
      }),
    };

    const category = await prisma.category.create({
      data: createData,
      select: {
        id: true,
        name: true,
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
