// app/checkout/cancel/page.tsx
"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <XCircle className="mx-auto h-16 w-16 text-red-500" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Pembayaran Dibatalkan
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Pesanan Anda belum selesai. Anda bisa mencoba lagi atau kembali ke
        keranjang.
      </p>
      <div className="mt-10 flex justify-center gap-x-6">
        <Link
          href="/cart"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Kembali ke Keranjang
        </Link>
        <Link
          href="/"
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Ke Beranda <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}
