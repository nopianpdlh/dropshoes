import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// GET /api/admin/categories
export async function GET() {
  try {
    console.log("API: Fetching categories...");

    // Fetch main categories (brands)
    const mainCategories = await prisma.category.findMany({
      where: {
        parentId: null,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    console.log("API: Main categories fetched:", mainCategories);

    // Fetch sub-categories
    const subCategories = await prisma.category.findMany({
      where: {
        NOT: {
          parentId: null,
        },
      },
      select: {
        id: true,
        name: true,
        parentId: true,
      },
    });

    console.log("API: Sub categories fetched:", subCategories);

    const response = {
      mainCategories,
      subCategories,
    };

    console.log("API: Sending response:", response);

    return new NextResponse(JSON.stringify(response), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("API Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch categories" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
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

    // Jika ini adalah kategori utama (brand), cek duplikasi nama
    if (!parentId) {
      const existingMainCategory = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          parentId: null,
        },
      });

      if (existingMainCategory) {
        return new NextResponse("Brand with this name already exists", {
          status: 400,
        });
      }
    } else {
      // Jika ini adalah sub-kategori, cek duplikasi nama dalam parent yang sama
      const existingSubCategory = await prisma.category.findFirst({
        where: {
          name: { equals: name, mode: "insensitive" },
          parentId: parentId,
        },
      });

      if (existingSubCategory) {
        return new NextResponse(
          "Category with this name already exists under the same brand",
          { status: 400 }
        );
      }

      // Validasi parent
      const parentExists = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentExists) {
        return new NextResponse("Parent category not found", { status: 404 });
      }
    }

    const category = await prisma.category.create({
      data: {
        name,
        parentId,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
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
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new NextResponse("Category with this name already exists", {
          status: 400,
        });
      }
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
