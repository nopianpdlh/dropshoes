"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Heart } from "lucide-react";
import { Size } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    sizes: Size[];
  };
}

const DEFAULT_SIZES = ["38", "39", "40", "41", "42", "43"];

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Gunakan sizes dari produk jika ada, jika tidak gunakan default sizes
  const availableSizes =
    product.sizes.length > 0
      ? product.sizes.map((size) => size.name)
      : DEFAULT_SIZES;

  const handleAddToCart = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Silakan pilih ukuran sepatu terlebih dahulu");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity: 1,
        }),
      });

      if (!response.ok) {
        throw new Error("Gagal menambahkan ke keranjang");
      }

      router.refresh();
      toast.success("Produk berhasil ditambahkan ke keranjang!", {
        icon: "🛍️",
        duration: 3000,
      });
    } catch (error) {
      toast.error("Gagal menambahkan produk ke keranjang");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!session) {
      router.push("/auth/login");
      return;
    }

    setIsFavorited(!isFavorited);
    // TODO: Implement favorite API
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Image Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
      >
        <div className="absolute top-4 left-4 bg-white px-2 py-1 rounded-full">
          <Star className="h-4 w-4 inline-block text-yellow-400" />
          <span className="ml-1 text-sm font-medium">Highly Rated</span>
        </div>
        <Image
          src={product.images[currentImageIndex]}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        {product.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {product.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full ${
                  currentImageIndex === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Product Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {product.name}
          </h1>
          <p className="text-xl font-semibold text-gray-900">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-medium text-gray-900">Pilih Ukuran</h2>
            <button
              onClick={() => setShowSizeGuide(true)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Size Guide
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`border rounded-md py-3 text-sm font-medium transition-colors
                  ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "hover:border-black"
                  }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Bag & Favorite */}
        <div className="space-y-4">
          <motion.button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            whileTap={{ scale: 0.95 }}
            className={`w-full bg-black text-white py-4 rounded-full hover:opacity-90 transition-opacity ${
              isAddingToCart ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isAddingToCart ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center"
              >
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Menambahkan...
              </motion.div>
            ) : selectedSize ? (
              "Add to Bag"
            ) : (
              "Pilih Ukuran"
            )}
          </motion.button>
          <motion.button
            onClick={handleToggleFavorite}
            whileTap={{ scale: 0.95 }}
            className={`w-full border py-4 rounded-full flex items-center justify-center space-x-2 transition-colors ${
              isFavorited
                ? "border-red-500 text-red-500"
                : "border-gray-300 hover:border-black"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500" : ""}`} />
            <span>{isFavorited ? "Favorited" : "Favorite"}</span>
          </motion.button>
        </div>

        {/* Shipping Info */}
        <div className="mt-8 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Pengiriman</h3>
            <p className="text-sm text-gray-600">
              Pilihan pengiriman akan ditampilkan saat checkout
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Pengambilan di Toko</h3>
            <button className="text-sm text-gray-900 underline">
              Cari Toko Terdekat
            </button>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8">
          <p className="text-sm text-gray-600">{product.description}</p>
        </div>
      </motion.div>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4"
            >
              <h2 className="text-xl font-bold mb-4">Panduan Ukuran</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-4 text-left">US</th>
                      <th className="py-2 px-4 text-left">UK</th>
                      <th className="py-2 px-4 text-left">EU</th>
                      <th className="py-2 px-4 text-left">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-4">7</td>
                      <td className="py-2 px-4">6</td>
                      <td className="py-2 px-4">40</td>
                      <td className="py-2 px-4">25</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4">8</td>
                      <td className="py-2 px-4">7</td>
                      <td className="py-2 px-4">41</td>
                      <td className="py-2 px-4">26</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4">9</td>
                      <td className="py-2 px-4">8</td>
                      <td className="py-2 px-4">42</td>
                      <td className="py-2 px-4">27</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button
                onClick={() => setShowSizeGuide(false)}
                className="mt-4 w-full bg-black text-white py-2 rounded-full hover:opacity-90"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
