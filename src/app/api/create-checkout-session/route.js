// app/api/create-checkout-session/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { plan, product, currency, back_url, customerid, type } = body;
    // throw "temp";
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],

      customer: customerid,
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${plan.name} - ${product.name}`,
              description: `${plan.description} for ${product.name}`,
              metadata: { pid: product.id, plan: plan.id, type: type },
            },
            unit_amount: plan.price * 100, // Stripe expects amounts in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/success?session_id={CHECKOUT_SESSION_ID}&pid=${product.id}&type=${type}`,
      cancel_url: `${request.headers.get("origin")}/product/premium?pid=${back_url}`,
      // payment_intent_data: {
      //   setup_future_usage: "on_session",
      // },
    });
    // console.log(session);
    // throw "";
    // return NextResponse.redirect(session.url);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: "Error creating checkout session" },
      { status: 500 },
    );
  }
}
