"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { StarIcon } from "@heroicons/react/20/solid";

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
}

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Air Max 270",
    brand: "Nike",
    price: 2499000,
    rating: 4.5,
    image: "/products/nike-1.jpg",
  },
  {
    id: "2",
    name: "Ultra Boost 21",
    brand: "Adidas",
    price: 2899000,
    rating: 4.8,
    image: "/products/adidas-1.jpg",
  },
  {
    id: "3",
    name: "Fresh Foam X",
    brand: "New Balance",
    price: 1899000,
    rating: 4.3,
    image: "/products/nb-1.jpg",
  },
  {
    id: "4",
    name: "ZoomX Vaporfly",
    brand: "Nike",
    price: 3499000,
    rating: 4.9,
    image: "/products/nike-2.jpg",
  },
];

export default function ProductGrid() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8"
        >
          Featured Products
        </motion.h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/products/${product.id}`} className="group">
                <div className="aspect-square relative overflow-hidden rounded-lg mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <h3 className="font-medium text-gray-900">{product.name}</h3>
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-1 text-sm text-gray-500">
                      {product.rating}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">
                    Rp {product.price.toLocaleString("id-ID")}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="inline-block bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-900 transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
