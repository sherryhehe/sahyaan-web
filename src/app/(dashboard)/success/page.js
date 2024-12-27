// app/success/page.js
"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

import { useMount } from "react-use";
export default function SuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  // const type = searchParams.get("type");
  const [status, setStatus] = useState("loading");
  const [productId, setProductId] = useState(null);

  const [hasUpdated, setHasUpdated] = useState(false);

  console.log(sessionId);
  useEffect(() => {
    const fetchSessionDetails = async () => {
      setHasUpdated(true); // Mark the update as complete
      if (!sessionId || hasUpdated) {
        setStatus("error");
        return;
      } else {
        try {
          const response = await fetch(
            `/api/checkout-session?session_id=${sessionId}`,
          );
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "Failed to fetch session details");
          }
          console.log(data);

          const extractedProductId = data.lineItems[0]?.metadata?.pid;
          const extractedPlanId = data.lineItems[0]?.metadata?.plan;
          const extractedtype = data.lineItems[0]?.metadata?.type;

          const extracteddate = data.date;

          if (extractedProductId) {
            // Update Firestore document
            await updateDoc(doc(db, "products", extractedProductId), {
              [extractedtype]: true,
            });

            console.log(hasUpdated);
            if (extractedtype === "premium") {
              console.log("prem");
              await updateDoc(doc(db, "promotions", "products"), {
                [extractedPlanId === "3"
                  ? "top"
                  : extractedPlanId === "2"
                    ? "middle"
                    : "bottom"]: arrayUnion({
                  id: extractedProductId,
                  expiry: new Date(
                    new Date(extracteddate).getTime() + 30,
                  ).getTime(),
                }),
              });
            } else {
              await updateDoc(doc(db, "promotions", "products"), {
                sponsered: arrayUnion({
                  id: extractedProductId,
                  expiry: new Date(
                    new Date(extracteddate).getTime() +
                      (extractedPlanId === 3
                        ? 30
                        : extractedPlanId === 2
                          ? 14
                          : 7),
                  ).getTime(),
                }),
              });
            }
            setProductId(extractedProductId);
            setStatus("success");
            // setHasUpdated(true); // Mark the update as complete
          } else {
            setStatus("error");
          }
        } catch (err) {
          console.error(err);
          setStatus("error");
        }
      }
    };

    console.log(hasUpdated);
    if (sessionId && !hasUpdated) fetchSessionDetails();
  }, [hasUpdated]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Verifying payment...</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-text mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-secondary mb-6">
            We couldn't verify your payment. Please contact support.
          </p>
          <Link
            href="/"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="text-green-500 text-5xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-text mb-4">
          Payment Successful!
        </h1>
        <p className="text-secondary mb-6">
          Your promotion plan for product {productId} has been successfully
          activated. You will receive a confirmation email shortly.
        </p>
        <Link
          href="/"
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

// export default SuccessPage;
