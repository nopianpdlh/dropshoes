import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CartClient from "./CartClient";

export const metadata = {
  title: "Keranjang Belanja - DropShoes",
  description: "Keranjang belanja Anda",
};

export default async function CartPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login?callbackUrl=/cart");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
      },
    },
  });

  const totalItems =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const subtotal =
    cart?.items.reduce(
      (acc, item) => acc + item.quantity * item.product.price,
      0
    ) || 0;

  return <CartClient cart={cart} totalItems={totalItems} subtotal={subtotal} />;
}
