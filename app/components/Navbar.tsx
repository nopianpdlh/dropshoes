"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo dan Menu Desktop */}
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">SHOEZ</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/products"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Produk
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
              >
                Kategori
              </Link>
            </div>
          </div>

          {/* Tombol-tombol Desktop */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link href="/cart" className="text-gray-700 hover:text-indigo-600">
              <ShoppingCart className="h-6 w-6" />
            </Link>
            {session ? (
              <>
                {session.user.role === "ADMIN" && (
                  <Link
                    href="/admin/products"
                    className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium"
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Keluar
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Masuk
              </Link>
            )}
          </div>

          {/* Tombol Menu Mobile */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/products"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              Produk
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              Kategori
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              Keranjang
            </Link>
            {session?.user.role === "ADMIN" && (
              <Link
                href="/admin/products"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Admin Panel
              </Link>
            )}
            {session ? (
              <button
                onClick={() => signOut()}
                className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Keluar
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
