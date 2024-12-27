// app/api/get-balance/route.js
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { sellerId } = await request.json();

    // Get seller's Stripe account ID from Firestore
    const sellerDoc = await getDoc(doc(db, "seller", sellerId));
    if (!sellerDoc.exists()) {
      return NextResponse.json({ error: "Seller not found" }, { status: 404 });
    }

    const stripeAccountId = sellerDoc.data().stripeCustomerId;
    if (!stripeAccountId) {
      return NextResponse.json(
        { error: "Stripe account not found" },
        { status: 404 },
      );
    }

    // Get balance from Stripe
    // const balance = await stripe.balance.retrieve({
    //   stripeAccount: stripeAccountId,
    // });

    // Get available balance
    // const availableBalance = balance.available.reduce(
    //   (sum, { amount }) => sum + amount,
    //   0,
    // );

    return NextResponse.json({ availableBalance });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { error: "Error fetching balance" },
      { status: 500 },
    );
  }
}
