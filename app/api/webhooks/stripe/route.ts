// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; //
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    console.log("[Webhook] Received request");

    const body = await req.text();
    const signature = headers().get("stripe-signature");

    if (!signature) {
      console.error("[Webhook] No stripe signature found");
      return NextResponse.json(
        { error: "No stripe signature" },
        { status: 400 }
      );
    }

    if (!webhookSecret) {
      console.error("[Webhook] No webhook secret configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    console.log("[Webhook] Verifying signature");
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      console.log("[Webhook] Event verified:", event.type);
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Tangani event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("[Webhook] Processing completed checkout session:", {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        amountTotal: session.amount_total,
        metadata: session.metadata,
      });

      // Dapatkan detail user dari client_reference_id
      const userId = session.client_reference_id;
      if (!userId) {
        console.error(
          "[Webhook] Missing userId in session client_reference_id"
        );
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      try {
        console.log("[Webhook] Fetching cart for user:", userId);
        const userCart = await prisma.cart.findUnique({
          where: { userId },
          include: {
            items: {
              include: { product: true },
            },
          },
        });

        if (!userCart || userCart.items.length === 0) {
          console.error(
            `[Webhook] No cart found for user ${userId} or cart is empty.`
          );
          return NextResponse.json({
            received: true,
            message: "Cart not found or empty, but webhook acknowledged.",
          });
        }

        console.log("[Webhook] Cart found:", {
          cartId: userCart.id,
          itemCount: userCart.items.length,
          items: userCart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            price: item.product.price,
          })),
        });

        // Ambil alamat dari metadata
        const address = session.metadata?.address || "Alamat tidak tersedia";
        const fullName = session.metadata?.fullName || "Nama tidak tersedia";
        const phone = session.metadata?.phone || "Telepon tidak tersedia";

        console.log("[Webhook] Creating order with details:", {
          userId,
          address,
          fullName,
          phone,
          total: session.amount_total! / 100,
          itemCount: userCart.items.length,
        });

        // Buat order
        const createdOrder = await prisma.order.create({
          data: {
            userId: userId,
            total: session.amount_total! / 100,
            status: "PROCESSING",
            address: address,
            customerName: fullName,
            customerPhone: phone,
            items: {
              create: userCart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price,
                size: item.size,
                color: item.color || "",
              })),
            },
          },
          include: {
            items: true,
          },
        });

        console.log("[Webhook] Order created successfully:", {
          orderId: createdOrder.id,
          total: createdOrder.total,
          status: createdOrder.status,
          itemCount: createdOrder.items.length,
        });

        // Kosongkan keranjang
        console.log("[Webhook] Clearing cart for user:", userId);
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
        console.log("[Webhook] Cart cleared successfully");

        return NextResponse.json({
          received: true,
          orderId: createdOrder.id,
        });
      } catch (error) {
        console.error("[Webhook] Error processing webhook:", error);
        return NextResponse.json(
          { error: "Error processing order" },
          { status: 500 }
        );
      }
    }

    console.log("[Webhook] Event processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook] Unexpected error:", error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
