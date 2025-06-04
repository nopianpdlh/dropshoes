// app/api/checkout/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// Inisialisasi Stripe dengan API version yang benar
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

interface CartItemClient {
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

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items } = (await req.json()) as { items: CartItemClient[] };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Keranjang kosong" }, { status: 400 });
    }

    // Pastikan harga dalam format sen/paisa untuk Stripe
    const line_items = items.map((item) => ({
      price_data: {
        currency: "idr",
        product_data: {
          name: `${item.product.name} (Size: ${item.size})`,
          images: item.product.images,
          metadata: {
            productId: item.product.id,
            size: item.size,
          },
        },
        unit_amount: Math.round(item.product.price * 100), // Konversi ke sen (1 Rupiah = 100 sen)
      },
      quantity: item.quantity,
    }));

    const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/cart`,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ id: checkoutSession.id });
  } catch (error: any) {
    console.error("Stripe session creation error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal membuat sesi checkout Stripe" },
      { status: 500 }
    );
  }
}
