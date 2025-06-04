"use client";

import { loadStripe } from "@stripe/stripe-js";
import toast from "react-hot-toast";
import CartItems from "./CartItems";
import { Cart } from "@prisma/client";

// Pastikan environment variable tersedia
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartClientProps {
  cart:
    | (Cart & {
        items: Array<{
          id: string;
          quantity: number;
          size: string;
          product: {
            id: string;
            name: string;
            price: number;
            images: string[];
          };
        }>;
      })
    | null;
  totalItems: number;
  subtotal: number;
}

export default function CartClient({
  cart,
  totalItems,
  subtotal,
}: CartClientProps) {
  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error("Keranjang Anda kosong.");
      return;
    }

    try {
      const response = await fetch("/api/checkout/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart.items }),
      });

      const checkoutSession = await response.json();

      if (!response.ok || !checkoutSession.id) {
        toast.error(checkoutSession.error || "Gagal membuat sesi checkout.");
        return;
      }

      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: checkoutSession.id,
        });
        if (error) {
          console.error("Stripe redirect error:", error);
          toast.error(error.message || "Gagal mengarahkan ke Stripe.");
        }
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Terjadi kesalahan saat checkout.");
    }
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Keranjang Belanja
        </h1>

        <div className="mt-12">
          {!cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-lg font-medium text-gray-900">
                Keranjang belanja Anda kosong
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Mulai belanja untuk menambahkan produk ke keranjang
              </p>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
              <div className="lg:col-span-7">
                <CartItems items={cart.items} />
              </div>

              {/* Order summary */}
              <div className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                <h2 className="text-lg font-medium text-gray-900">
                  Ringkasan Pesanan
                </h2>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">Total Items</p>
                    <p className="text-sm font-medium text-gray-900">
                      {totalItems}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <p className="text-base font-medium text-gray-900">
                      Subtotal
                    </p>
                    <p className="text-base font-medium text-gray-900">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }).format(subtotal)}
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    className="w-full rounded-md border border-transparent bg-black px-4 py-3 text-base font-medium text-white shadow-sm hover:opacity-90"
                  >
                    Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
