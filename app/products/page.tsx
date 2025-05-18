import { prisma } from "@/lib/prisma";
import ProductGrid from "../components/product/ProductGrid";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Products - DropShoes",
  description: "Browse our collection of premium footwear",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string; brand?: string };
}) {
  const where: Prisma.ProductWhereInput = {
    ...(searchParams.brand && {
      category: {
        OR: [
          { name: searchParams.brand },
          { parent: { name: searchParams.brand } },
        ],
      },
    }),
    ...(searchParams.category && {
      category: {
        name: searchParams.category,
      },
    }),
    ...(searchParams.q && {
      OR: [
        {
          name: {
            contains: searchParams.q,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
        {
          description: {
            contains: searchParams.q,
            mode: "insensitive" as Prisma.QueryMode,
          },
        },
      ],
    }),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: {
        include: {
          parent: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const pageTitle = searchParams.brand
    ? `Produk ${searchParams.brand}`
    : searchParams.category
    ? `Kategori ${searchParams.category}`
    : "Semua Produk";

  return (
    <div>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            {pageTitle}
          </h2>
          {products.length === 0 ? (
            <p className="mt-4 text-gray-500">
              Tidak ada produk yang ditemukan.
            </p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
}
