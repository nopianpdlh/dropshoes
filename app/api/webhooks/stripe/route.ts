// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; //
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil", // Update to the expected API version,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Tangani event
  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout Session Completed:", session.id);

      // Dapatkan detail user dari client_reference_id
      const userId = session.client_reference_id;
      if (!userId) {
        console.error(
          "Webhook Error: Missing userId in session client_reference_id"
        );
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
      }

      try {
        // 1. Ambil item dari line_items Stripe (atau dari database berdasarkan metadata jika ada)
        // Stripe.checkout.sessions.listLineItems(session.id) bisa digunakan jika perlu mengambil detail lagi
        // Untuk demo CV, kita bisa asumsikan detail sudah cukup dari session atau client_reference_id
        // dan data keranjang user yang terakhir.

        // Contoh mengambil item dari cart user saat itu (asumsi keranjang belum dikosongkan)
        // Ini adalah penyederhanaan; idealnya, Anda menyimpan detail order saat membuat sesi Stripe atau mengambilnya dari line_items Stripe.
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
            `Webhook Error: No cart found for user ${userId} or cart is empty.`
          );
          // Kirim respons 200 agar Stripe tidak mengirim ulang, tapi catat errornya.
          return NextResponse.json({
            received: true,
            message: "Cart not found or empty, but webhook acknowledged.",
          });
        }

        // 2. Buat Order di database Anda
        const createdOrder = await prisma.order.create({
          data: {
            userId: userId,
            total: session.amount_total! / 100, // Stripe amount_total dalam sen, konversi ke Rupiah
            status: "PROCESSING", // Atau 'PAID'
            address:
              "Alamat dummy dari profil user atau form checkout (jika ada)", // Perlu ada mekanisme untuk ini
            // stripeCheckoutSessionId: session.id, // Simpan ID sesi Stripe
            // stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : undefined,
            items: {
              create: userCart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price, // Harga per unit
                size: item.size,
                color: item.color, //
              })),
            },
          },
        });
        console.log(`Order ${createdOrder.id} created for user ${userId}`);

        // 3. Kosongkan keranjang user setelah order berhasil dibuat
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id },
        });
        console.log(`Cart for user ${userId} cleared.`);

        // (Opsional) Kirim email konfirmasi, dll.
      } catch (dbError: any) {
        console.error("Webhook database error:", dbError);
        // Jika terjadi error saat memproses di sisi Anda, Stripe akan mencoba mengirim ulang webhook.
        // Pertimbangkan untuk mengirim status 500 agar Stripe tahu ada masalah.
        return NextResponse.json(
          { error: `Database Error: ${dbError.message}` },
          { status: 500 }
        );
      }
      break;

    case "payment_intent.succeeded":
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      console.log("PaymentIntent Succeeded:", paymentIntentSucceeded.id);
      // Jika Anda menggunakan Payment Intents secara langsung atau ingin tindakan tambahan
      break;

    case "payment_intent.payment_failed":
      const paymentIntentFailed = event.data.object as Stripe.PaymentIntent;
      console.log(
        "PaymentIntent Failed:",
        paymentIntentFailed.id,
        paymentIntentFailed.last_payment_error?.message
      );
      // Tangani pembayaran gagal, misal notifikasi user
      break;

    // ... tangani event lain jika perlu

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
