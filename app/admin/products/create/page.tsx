"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
  } | null;
  subCategories?: Category[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/admin/categories");
        if (!response.ok) {
          throw new Error("Gagal mengambil data kategori");
        }
        const data = await response.json();

        // Organize categories by parent
        const mainCategories = data.mainCategories || [];
        const subCategories = data.subCategories || [];

        // Create a map of parent categories and their subcategories
        const categoryMap = new Map();
        mainCategories.forEach((cat: Category) => {
          categoryMap.set(cat.id, {
            ...cat,
            subCategories: [],
          });
        });

        // Add subcategories to their parents
        subCategories.forEach((subCat: Category) => {
          if (subCat.parentId && categoryMap.has(subCat.parentId)) {
            categoryMap.get(subCat.parentId).subCategories.push(subCat);
          }
        });

        // Convert map to array
        const organizedCategories = Array.from(categoryMap.values());
        setCategories(organizedCategories);
      } catch (error) {
        console.error("Error mengambil kategori:", error);
        setError("Gagal memuat kategori. Silakan coba lagi.");
        toast.error("Gagal memuat kategori");
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      stock: parseInt(formData.get("stock") as string),
      categoryId: formData.get("categoryId") as string,
      images: [
        (formData.get("image") as string) || "https://via.placeholder.com/500",
      ],
    };

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Gagal menambahkan produk");
      }

      toast.success("Produk berhasil ditambahkan!");
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      toast.error("Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        Tambah Produk Baru
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nama Produk
          </label>
          <input
            type="text"
            name="name"
            id="name"
            required
            placeholder="Masukkan nama produk"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Deskripsi
          </label>
          <textarea
            name="description"
            id="description"
            rows={4}
            required
            placeholder="Masukkan deskripsi produk"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="block text-sm font-medium text-gray-700"
          >
            Harga
          </label>
          <input
            type="number"
            name="price"
            id="price"
            required
            min="0"
            step="1000"
            placeholder="Masukkan harga produk"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="stock"
            className="block text-sm font-medium text-gray-700"
          >
            Stok
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            required
            min="0"
            placeholder="Masukkan jumlah stok"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="image"
            className="block text-sm font-medium text-gray-700"
          >
            URL Gambar
          </label>
          <input
            type="url"
            name="image"
            id="image"
            placeholder="https://example.com/gambar.jpg"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-medium text-gray-700"
          >
            Kategori
          </label>
          <select
            name="categoryId"
            id="categoryId"
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">Pilih Kategori</option>
            {categories.map((mainCategory) => (
              <optgroup key={mainCategory.id} label={mainCategory.name}>
                {mainCategory.subCategories?.map((subCategory: Category) => (
                  <option key={subCategory.id} value={subCategory.id}>
                    {mainCategory.name} - {subCategory.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}
