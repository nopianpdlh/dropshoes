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

      if (parentId === params.categoryId) {
        return new NextResponse("Category cannot be its own parent", {
          status: 400,
        });
      }

      const isCircular = await checkCircularReference(
        params.categoryId,
        parentId
      );
      if (isCircular) {
        return new NextResponse("Circular reference detected", { status: 400 });
      }
    }

    const updateData: Prisma.CategoryUpdateInput = {
      name,
      ...(parentId
        ? {
            parent: {
              connect: { id: parentId },
            },
          }
        : {
            parent: {
              disconnect: true,
            },
          }),
    };

    const updatedCategory = await prisma.category.update({
      where: {
        id: params.categoryId,
      },
      data: updateData,
    });

    // Fetch the updated category with its parent
    const categoryWithParent = await prisma.category.findUnique({
      where: { id: updatedCategory.id },
      include: { parent: true },
    });

    return NextResponse.json(categoryWithParent);
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

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: params.categoryId },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Check for products
    const productsCount = await prisma.product.count({
      where: {
        categoryId: params.categoryId,
      },
    });

    if (productsCount > 0) {
      return new NextResponse("Cannot delete category that has products", {
        status: 400,
      });
    }

    // Check for child categories
    const children = await prisma.category.findMany({
      where: {
        parent: {
          id: params.categoryId,
        },
      },
    });

    if (children.length > 0) {
      return new NextResponse("Cannot delete category that has subcategories", {
        status: 400,
      });
    }

    await prisma.category.delete({
      where: {
        id: params.categoryId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CATEGORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
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
