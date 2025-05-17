"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Tags,
  Settings,
  LogOut,
  ChevronDown,
  Boxes,
  ShoppingCart,
  Palette,
  CreditCard,
} from "lucide-react";

const AdminNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Produk",
      href: "/admin/products",
      icon: Package,
    },
    {
      name: "Kategori",
      href: "/admin/categories",
      icon: Tags,
    },
    {
      name: "Ukuran",
      href: "/admin/sizes",
      icon: Boxes,
    },
    {
      name: "Pesanan",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Pembayaran",
      href: "/admin/payments",
      icon: CreditCard,
    },
    {
      name: "Pengguna",
      href: "/admin/users",
      icon: Users,
    },
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href="/admin"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
              >
                <ShoppingBag className="h-8 w-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">
                  Admin Panel
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-indigo-600 bg-indigo-50 rounded-md"
                        : "text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 mr-2 ${
                        isActive ? "text-indigo-500" : ""
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center">
            <div className="relative group">
              <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200">
                <Settings className="h-5 w-5 mr-2" />
                Pengaturan
                <ChevronDown className="h-4 w-4 ml-1 transform group-hover:rotate-180 transition-transform duration-200" />
              </button>

              <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-95 group-hover:scale-100">
                <Link
                  href="/admin/settings/general"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  Pengaturan Umum
                </Link>
                <Link
                  href="/admin/settings/security"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                >
                  Keamanan
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
