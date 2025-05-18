"use client";

import Image from "next/image";
import Link from "next/link";
import { Product, Category } from "@prisma/client";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product & {
    category: Category | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={product.images[0]}
          alt={product.name}
          width={300}
          height={300}
          className="h-full w-full object-cover object-center group-hover:opacity-75"
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">{product.name}</h3>
          <p className="mt-1 text-sm text-gray-500">{product.category?.name}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
