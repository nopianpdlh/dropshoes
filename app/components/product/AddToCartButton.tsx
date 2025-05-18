"use client";

import { Product } from "@prisma/client";
import { useState } from "react";
import { useCartStore } from "@/app/store/cart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AddToCartButtonProps {
  product: Product;
  selectedSize?: string;
  quantity?: number;
}

export default function AddToCartButton({
  product,
  selectedSize,
  quantity = 1,
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { incrementCount } = useCartStore();
  const { data: session } = useSession();
  const router = useRouter();

  const addToCart = async () => {
    if (!session) {
      router.push(
        "/auth/login?callbackUrl=" +
          encodeURIComponent(window.location.pathname)
      );
      return;
    }

    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      incrementCount();
      toast.success("Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={addToCart}
      disabled={loading}
      className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent bg-black px-8 py-3 text-base font-medium text-white hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
    >
      {loading ? "Adding..." : "Add to Cart"}
    </button>
  );
}
