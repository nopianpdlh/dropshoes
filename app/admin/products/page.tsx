"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { Pencil, Trash2, Loader2, RefreshCw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: {
    name: string;
  };
}

export default function AdminProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Fetch products
  const fetchProducts = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error("Gagal mengambil data produk");
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error mengambil produk:", error);
      toast.error("Gagal memuat daftar produk");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pathname]);

  // Delete product
  const handleDelete = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch(
        `/api/admin/products/${selectedProduct.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        toast.success("Produk berhasil dihapus!");
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        fetchProducts(true);
      } else {
        throw new Error("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error menghapus produk:", error);
      toast.error("Gagal menghapus produk");
    }
  };

  const handleRefresh = () => {
    fetchProducts(true);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Produk</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
              title="Perbarui data"
            >
              <RefreshCw
                className={`h-5 w-5 text-gray-500 ${
                  isRefreshing ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Total Produk: {isLoading ? "Memuat..." : products.length}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/admin/products/create"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Tambah Produk
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Memuat produk...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Belum ada produk yang ditambahkan</p>
          <Link
            href="/admin/products/create"
            className="mt-2 inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            Tambah produk pertama Anda
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative aspect-[4/3] w-full bg-gray-100">
                <Image
                  src={product.images[0] || "https://via.placeholder.com/500"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain p-2"
                  priority={false}
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src =
                      "https://via.placeholder.com/500?text=No+Image";
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <div className="flex space-x-2">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Pencil className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsDeleteModalOpen(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">
                  {product.category.name}
                </p>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-sm text-gray-600">
                    Stok: {product.stock}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">Hapus Produk</h2>
            <p className="text-gray-600 mb-4">
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isRefreshing}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  "Hapus"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
