import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, shippingAddress } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "No items provided" }, { status: 400 });
    }

    // Format alamat untuk metadata
    const formattedAddress = `${shippingAddress.address}, ${shippingAddress.city} ${shippingAddress.postalCode}`;

    // Buat line items untuk Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "idr",
        product_data: {
          name: item.product.name,
          images: item.product.images,
        },
        unit_amount: item.product.price * 100, // Konversi ke sen
      },
      quantity: item.quantity,
    }));

    // Pastikan URL memiliki skema yang benar (http untuk localhost, https untuk produksi)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "localhost:3000";
    const isLocalhost = appUrl.includes("localhost");
    const baseUrl = appUrl.startsWith("http")
      ? appUrl
      : `${isLocalhost ? "http" : "https"}://${appUrl}`;

    // Buat checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      metadata: {
        address: formattedAddress,
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
      },
      shipping_address_collection: {
        allowed_countries: ["ID"],
      },
      client_reference_id: session.user.id,
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
