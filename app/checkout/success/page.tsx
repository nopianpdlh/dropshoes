// app/checkout/success/page.tsx
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useCartStore } from "@/app/store/cart"; //

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { setCount } = useCartStore(); //

  useEffect(() => {
    // Anda bisa mengambil detail sesi dari backend jika perlu
    // dan mengosongkan keranjang di sini atau setelah webhook dikonfirmasi
    // Untuk CV, mungkin cukup tampilkan pesan sukses dan reset count keranjang di client
    if (sessionId) {
      // Idealnya, verifikasi sesi di backend dan baru lakukan aksi
      console.log("Checkout session ID:", sessionId);
      // Kosongkan keranjang setelah berhasil checkout
      setCount(0);
    }
  }, [sessionId, setCount]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        Pembayaran Berhasil!
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Terima kasih atas pesanan Anda. Kami akan segera memprosesnya.
      </p>
      <div className="mt-10">
        <Link
          href="/"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
