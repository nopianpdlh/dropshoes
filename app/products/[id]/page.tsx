import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductDetail from "@/app/components/product/ProductDetail";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  return {
    title: product ? `${product.name} - SHOEZ` : "Produk Tidak Ditemukan",
    description: product?.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      sizes: true,
      colors: true,
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <ProductDetail product={product} />
    </div>
  );
}
