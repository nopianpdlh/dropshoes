"use client";

import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Order, OrderItem } from "@prisma/client";

interface OrderListProps {
  orders: (Order & {
    items: (OrderItem & {
      product: {
        id: string;
        name: string;
        images: string[];
        price: number;
      };
    })[];
  })[];
}

export default function OrderList({ orders }: OrderListProps) {
  const getOrderStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Menunggu Pembayaran
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Diproses
          </span>
        );
      case "SHIPPED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            Dikirim
          </span>
        );
      case "DELIVERED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Dibatalkan
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white border rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{order.id.slice(-8)}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString("id-ID", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>{getOrderStatus(order.status)}</div>
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              {order.items.map((item) => (
                <div key={item.id} className="flex py-6 first:pt-0 last:pb-0">
                  <div className="flex-shrink-0">
                    <div className="relative h-24 w-24">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover object-center rounded-md"
                      />
                    </div>
                  </div>

                  <div className="ml-6 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-700">
                          {item.product.name}
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>{formatPrice(order.total)}</p>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Alamat: {order.address}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
