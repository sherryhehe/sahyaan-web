// app/api/create-customer/route.js
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const { paymentMethodId, email, name } = await request.json();

    // Create a customer
    const customer = await stripe.customers.create({
      email,
      name,
    });

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });

    // Set the payment method as the default for the customer
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    return Response.json({
      customerId: customer.id,
      paymentMethodId: paymentMethodId,
      message: "Customer and payment method created successfully",
    });
  } catch (error) {
    console.error("Stripe customer creation error:", error);
    return Response.json(
      {
        error: "Error creating Stripe customer",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
