import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "./CheckoutForm";

export const metadata = {
  title: "Checkout - DropShoes",
  description: "Checkout pesanan Anda",
};

export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/checkout");
  }

  // Ambil data cart user
  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // Hitung total
  const total = cart.items.reduce(
    (acc, item) => acc + item.quantity * item.product.price,
    0
  );

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Checkout
          </h1>

          <div className="mt-12">
            <div className="divide-y divide-gray-200">
              {/* Order summary */}
              <div className="py-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Ringkasan Pesanan
                </h2>
                <div className="mt-4 space-y-4">
                  {cart.items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}`}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <h3 className="text-sm text-gray-800">
                          {item.product.name}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Size: {item.size}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        Rp {item.product.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between">
                    <p className="text-base font-medium text-gray-900">Total</p>
                    <p className="text-base font-medium text-gray-900">
                      Rp {total.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping form */}
              <div className="py-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Alamat Pengiriman
                </h2>
                <div className="mt-6">
                  <CheckoutForm cartItems={cart.items} total={total} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
