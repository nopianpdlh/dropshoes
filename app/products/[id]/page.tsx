import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/app/components/product/AddToCartButton";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: `${product.name} - SHOEZ`,
    description: product.description,
  };
}

export default async function ProductPage({
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
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">
          {/* Image gallery */}
          <div className="flex flex-col-reverse">
            <div className="aspect-h-1 aspect-w-1 w-full">
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className="h-full w-full object-cover object-center sm:rounded-lg"
              />
            </div>
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {product.name}
            </h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="space-y-6 text-base text-gray-700">
                {product.description}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.sizes.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase hover:bg-gray-50"
                  >
                    {size.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
              </div>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {product.colors.map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center justify-center rounded-md border py-3 px-3 text-sm font-medium uppercase hover:bg-gray-50"
                  >
                    {color.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
