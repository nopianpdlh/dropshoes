import { prisma } from "@/lib/prisma";
import ProductGrid from "../components/product/ProductGrid";
import { Metadata } from "next";
import { Prisma } from "@prisma/client";

export const metadata: Metadata = {
  title: "Products - SHOEZ",
  description: "Browse our collection of premium footwear",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; q?: string };
}) {
  const where: Prisma.ProductWhereInput = {
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
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div>
      <div className="bg-white">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Our Products
          </h2>
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
}
