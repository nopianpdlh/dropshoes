import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import OrderList from "./OrderList";

export const metadata = {
  title: "Pesanan Saya - DropShoes",
  description: "Daftar pesanan Anda",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    console.log("No session found, redirecting to login");
    redirect("/auth/login?callbackUrl=/orders");
  }

  console.log("Session found:", {
    userId: session.user.id,
    email: session.user.email,
  });

  try {
    const orders = await prisma.order.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Orders found:", {
      count: orders.length,
      orderIds: orders.map((o) => o.id),
    });

    return (
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Pesanan Saya
          </h1>
          <div className="mt-8">
            {!orders || orders.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-lg font-medium text-gray-900">
                  Belum ada pesanan
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Mulai belanja untuk membuat pesanan baru
                </p>
              </div>
            ) : (
              <OrderList orders={orders} />
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-medium text-gray-900">Terjadi kesalahan</h2>
        <p className="mt-2 text-sm text-gray-500">Gagal memuat data pesanan</p>
      </div>
    );
  }
}
