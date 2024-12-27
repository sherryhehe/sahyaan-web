// app/api/checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { error: "No session ID provided" },
      { status: 400 },
    );
  }

  try {
    // Retrieve the Checkout Session with expanded line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "line_items.data.price.product"],
    });

    return NextResponse.json({
      customer: session.customer_details,
      payment: session.payment_status,
      date: session.created,
      lineItems: session.line_items.data.map((item) => ({
        id: item.id,
        description: item.description,
        amount: item.amount_total / 100,
        currency: item.currency,
        quantity: item.quantity,
        metadata: item.price.product.metadata, // This is where you'll find the productId
      })),
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return NextResponse.json(
      { error: "Error retrieving checkout session" },
      { status: 500 },
    );
  }
}
