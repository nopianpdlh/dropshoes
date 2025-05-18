"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingCart, User, Search, LogIn, UserPlus } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.mainCategories || !data.subCategories) {
          console.error("Invalid data structure:", data);
          return;
        }

        const mainCategories = data.mainCategories;
        const subCategories = data.subCategories;

        const categoriesWithChildren = mainCategories.map((main: Category) => ({
          ...main,
          children: subCategories.filter(
            (sub: Category) => sub.parentId === main.id
          ),
        }));

        setCategories(categoriesWithChildren);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  // console.log("Current categories state:", categories);

  // Jika user adalah admin dan berada di halaman admin, jangan tampilkan navbar ini
  if (session?.user?.role === "ADMIN" && pathname.startsWith("/admin")) {
    return null;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors"
              >
                DropShoes
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center h-16 px-1 border-b-2 text-sm font-medium transition-colors ${
                  pathname === "/"
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                Home
              </Link>

              {/* Brand Categories with Dropdowns */}
              {categories.map((brand) => (
                <div
                  key={brand.id}
                  className="relative group flex items-center h-16"
                >
                  <Link
                    href={`/products?brand=${encodeURIComponent(brand.name)}`}
                    className={`inline-flex items-center px-1 border-b-2 text-sm font-medium transition-colors ${
                      pathname.includes(brand.name.toLowerCase())
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    {brand.name}
                  </Link>

                  {/* Dropdown Menu */}
                  {brand.children && brand.children.length > 0 && (
                    <div className="absolute left-0 top-16 w-48 bg-white rounded-md shadow-lg py-1 z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100">
                      {brand.children.map((subCategory) => (
                        <Link
                          key={subCategory.id}
                          href={`/products?brand=${encodeURIComponent(
                            brand.name
                          )}&category=${encodeURIComponent(subCategory.name)}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          {subCategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-1 pr-10 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
            </Link>

            {/* Profile/Auth Menu */}
            <div className="relative group">
              <button className="p-2 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <User className="h-6 w-6" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100">
                {session ? (
                  <>
                    {session.user.role === "ADMIN" ? (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Admin Dashboard
                      </Link>
                    ) : (
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                      >
                        Profile
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      Pesanan Saya
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Masuk
                    </Link>
                    <Link
                      href="/auth/register"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Daftar
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
