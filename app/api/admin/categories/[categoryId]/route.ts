import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// PUT /api/admin/categories/[categoryId]
export async function PUT(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;
    const body = await req.json();
    const { name, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!existingCategory) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // If parentId is provided, validate it
    if (parentId) {
      // Check if parent category exists
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        return new NextResponse("Parent category not found", { status: 404 });
      }

      // Prevent setting parent to itself
      if (parentId === categoryId) {
        return new NextResponse("Category cannot be its own parent", {
          status: 400,
        });
      }

      // Prevent circular reference
      let currentParent = parentCategory;
      while (currentParent?.parentId) {
        const nextParent = await prisma.category.findUnique({
          where: { id: currentParent.parentId },
        });
        if (!nextParent) break;
        if (nextParent.id === categoryId) {
          return new NextResponse(
            "Cannot create circular reference in category hierarchy",
            { status: 400 }
          );
        }
        currentParent = nextParent;
      }
    }

    // Update the category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        parentId: parentId || null,
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

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("[CATEGORY_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/admin/categories/[categoryId]
export async function DELETE(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { categoryId } = params;

    // Check if category exists and get its relationships
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: true,
        products: {
          select: { id: true },
        },
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Check if category has children
    if (category.children.length > 0) {
      return new NextResponse(
        "Tidak dapat menghapus kategori yang memiliki sub-kategori. Harap hapus sub-kategori terlebih dahulu.",
        { status: 400 }
      );
    }

    // Check if category has products
    if (category.products.length > 0) {
      return new NextResponse(
        "Tidak dapat menghapus kategori yang memiliki produk. Harap pindahkan atau hapus produk terlebih dahulu.",
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Terjadi kesalahan saat menghapus kategori", {
      status: 500,
    });
  }
}

// Helper function to check circular reference
async function checkCircularReference(
  categoryId: string,
  parentId: string
): Promise<boolean> {
  const visited = new Set<string>();
  let currentId = parentId;

  while (currentId) {
    if (visited.has(currentId)) {
      return true;
    }
    visited.add(currentId);

    const category = await prisma.category.findUnique({
      where: { id: currentId },
    });

    if (!category?.parentId) {
      break;
    }

    if (category.parentId === categoryId) {
      return true;
    }

    currentId = category.parentId;
  }

  return false;
}
