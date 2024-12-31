// app/promote/page.js
"use client";

import { auth, db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { loadStripe } from "@stripe/stripe-js";
import { useSearchParams } from "next/navigation";
import { fetchProduct } from "../[id]/fetch";
import convertCurrency from "@/functions/convertion";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);
const promotionPlans = [
  {
    id: 1,
    name: "Silver Premium Listing",
    description: "30 days premium listing at the bottom of home page",
    price: 5000,
    duration: "30 days",
    type: 0,
  },

  {
    id: 2,
    name: "Gold Premium Listing",
    description: "30 days premium listing in the middle of home page",
    price: 10000,

    duration: "30 days",
    type: 0,
  },
  {
    id: 3,
    name: "Diamond Premium Listing",
    description: "30 days premium listing at the top of home page",
    price: 15000,
    duration: "30 days",

    type: 0,
  },

  {
    id: 4,
    name: "Silver Sponsered Listing",
    description: "7 days sponsered listing in search",
    price: 3000,
    duration: "7 days",

    type: 1,
  },

  {
    id: 5,
    name: "Gold Sponsered Listing",
    description: "14 days sponsered listing in search",
    price: 5000,
    duration: "14 days",

    type: 1,
  },
  {
    id: 6,
    name: "Diamond Sponsered Listing",
    description: "30 days sponsered listing in search",
    price: 9500,
    duration: "30 days",

    type: 1,
  },
];

// const fetchProduct = async () => {
//   // Simulated product data
//   return {
//     id: 1,
//     name: "Sample Product",
//     description:
//       "This is a sample product description that showcases the item details.",
//     price: 99.99,
//     coverImage:
//       "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23cccccc%22%2F%3E%3C%2Fsvg%3E",
//   };
// };

export default function PromotePage() {
  const [product, setProduct] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [user] = useAuthState(auth);
  const [activeType, setActiveType] = useState(0);
  const [sellerCurrency, setSellerCur] = useState();
  const [isLoading, setIsLoading] = useState(false);
  const [seller, setSeller] = useState();
  const searchParams = useSearchParams();
  const [cr, setCr] = useState();
  console.log(searchParams);

  useEffect(() => {
    async function calCR() {
      await getDoc(doc(db, "seller", user.uid)).then((snap) => {
        const data = snap.data();
        setSellerCur(data["currency"]);

        setSeller({ id: snap.id, ...data });
      });
      if (sellerCurrency != "PKR") {
        setCr(await convertCurrency(1, "PKR", sellerCurrency));
      } else {
        setCr(1);
      }
    }
    if (!cr && user) {
      calCR();
    }
  });
  // console.log(cr);

  useEffect(() => {
    const getProduct = async () => {
      const data = await fetchProduct(searchParams.get("pid"), user.uid);
      console.log(data);
      setProduct(data);
      setActiveType(!data.premium ? 0 : 1);
    };
    getProduct();
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleCheckout = async () => {
    if (!selectedPlan) return;

    try {
      setIsLoading(true);

      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: { ...selectedPlan, price: selectedPlan.price * cr },
          product: product,
          currency: sellerCurrency,
          back_url: searchParams.get("pid"),
          customerid: seller.stripeCustomerId,
          type: activeType === 0 ? "premium" : "sponsered",
        }),
      });

      const { sessionId, error } = await response.json();

      if (error) {
        console.error("Error:", error);
        return;
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
        // clientReferenceId: seller.stripeCustomerId,
      });

      if (stripeError) {
        console.error("Stripe error:", stripeError);
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!product || !sellerCurrency || !user)
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full md:w-48 h-48 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {product.name}
              </h1>
              <p className="text-secondary mb-4 line-clamp-2">
                {product.shortDescription}
              </p>
              <p className="text-primary font-bold text-xl">
                {product.price * cr} {sellerCurrency}
              </p>
            </div>
          </div>
        </div>
        <div className="border-b border-primary/50 mb-2 flex flex-row">
          <button
            disabled={product.premium}
            className={`text-xl border-t disabled:text-gray-500 hover:cursor-pointer font-semibold border-x border-primary w-fit px-6 py-2 ${activeType === 0 ? "bg-primary text-bg  " : "bg-bg text-primary  hover:bg-primary/80 hover:text-bg hover:cursor-pointer"} rounded-tl-md  duration-100 transition-all`}
            onClick={() => {
              setActiveType(0);
              setSelectedPlan(null);
            }}
          >
            Premium Lisiting
          </button>

          <button
            disabled={product.sponsered}
            className={`text-xl border-t disabled:text-gray-500  hover:cursor-pointer font-semibold border-x border-primary w-fit px-6 py-2 ${activeType === 1 ? "bg-primary text-bg  " : "bg-bg text-primary  hover:bg-primary/80 hover:text-bg hover:cursor-pointer"} rounded-tr-md  duration-100 transition-all`}
            onClick={() => {
              setActiveType(1);

              setSelectedPlan(null);
            }}
          >
            Sponsered Listing
          </button>
        </div>
        {/* Promotion Plans Section */}
        <h2 className="text-xl font-bold text-text mb-6">
          Select {activeType === 0 ? "PremiumShip" : "SponserShip"} Plan
        </h2>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {promotionPlans
            .filter((plan) => plan.type === activeType)
            .map((plan) => (
              <div
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 ${
                  selectedPlan?.id === plan.id
                    ? "ring-2 ring-primary transform scale-[1.02]"
                    : "hover:shadow-lg"
                }`}
              >
                <h3 className="text-lg font-semibold text-text mb-2">
                  {plan.name}
                </h3>
                <p className="text-secondary text-sm mb-4">
                  {plan.description}
                </p>
                <div className="flex justify-between items-end">
                  <span className="text-primary font-bold text-xl">
                    {plan.price * cr} {sellerCurrency}
                  </span>
                  <span className="text-secondary-400 text-sm">
                    {plan.duration}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* Checkout Button */}
        <button
          onClick={handleCheckout}
          disabled={!selectedPlan || isLoading}
          className={`w-full md:w-auto px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
            selectedPlan && !isLoading
              ? "bg-primary text-white hover:bg-primary-600"
              : "bg-secondary-200 text-secondary-400 cursor-not-allowed"
          }`}
        >
          {selectedPlan ? "Proceed to Checkout" : "Select a Plan to Continue"}
        </button>
      </div>
    </div>
  );
}
