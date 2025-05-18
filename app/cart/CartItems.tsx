"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  size: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
}

interface CartItemsProps {
  items: CartItem[];
}

export default function CartItems({ items }: CartItemsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setLoading(itemId);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) {
        throw new Error("Failed to update quantity");
      }

      router.refresh();
    } catch (error) {
      console.error("Error updating quantity:", error);
    } finally {
      setLoading(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setLoading(itemId);

    try {
      const response = await fetch(`/api/cart/items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove item");
      }

      router.refresh();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <ul role="list" className="divide-y divide-gray-200 border-b border-t">
      {items.map((item) => (
        <li key={item.id} className="flex py-6">
          <div className="flex-shrink-0">
            <div className="relative h-24 w-24">
              <Image
                src={item.product.images[0]}
                alt={item.product.name}
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="ml-4 flex flex-1 flex-col sm:ml-6">
            <div className="flex justify-between">
              <div>
                <h4 className="font-medium text-gray-700">
                  {item.product.name}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Ukuran: {item.size}
                </p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  disabled={loading === item.id}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-gray-500">{item.quantity}</span>
                <button
                  disabled={loading === item.id}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="rounded-md p-1 text-gray-400 hover:text-gray-500 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                disabled={loading === item.id}
                onClick={() => removeItem(item.id)}
                className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
