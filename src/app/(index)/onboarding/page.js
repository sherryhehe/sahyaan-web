"use client";
import { auth, db } from "@/firebase/firebase";
import { useForm } from "@tanstack/react-form";
import { updateProfile } from "firebase/auth";
import { Check, CreditCard, Store } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { updateSeller } from "./updateSeller";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Stripe configuration
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

// Countries
const COUNTRIES = [
  { value: "india", label: "India" },
  { value: "pakistan", label: "Pakistan" },
  { value: "bangladesh", label: "Bangladesh" },
  { value: "other", label: "Other" },
];

function FieldInfo({ field }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-red-500">{field.state.meta.errors.join(", ")}</em>
      ) : null}
    </>
  );
}

// Stripe Payment Form Component
const StripePaymentForm = ({ user, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      // Create token for the card

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: elements.getElement(CardElement),
      });
      if (error) {
        setError(error.message);
        setProcessing(false);
        return;
      }

      // Send token to your backend to create Stripe customer
      const response = await fetch("/api/create-customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          email: user.email,
          name: user.displayName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create customer");
      }

      // Save customer ID to Firestore
      await setDoc(
        doc(db, "seller", user.uid),
        {
          stripeCustomerId: data.customerId,
          stripePMId: data.paymentMethodId,
          onboarding: true,
        },
        { merge: true },
      );

      onPaymentSuccess();
      setProcessing(false);
    } catch (err) {
      setError(err.message);
      console.error(err);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CardElement
        options={{
          style: {
            base: {
              fontSize: "16px",
              color: "#424770",
              "::placeholder": {
                color: "#aab7c4",
              },
            },
            invalid: {
              color: "#9e2146",
            },
          },
        }}
      />
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-black text-white py-2 rounded-md"
      >
        {processing ? "Processing..." : "Save Payment Method"}
      </button>
    </form>
  );
};

const BankDetailsForm = ({ user, onSuccess }) => {
  const bank_form = useForm({
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
      swiftCode: "",
      iban: "",
      bankAddress: "",
    },
    onSubmit: async ({ value }) => {
      if (!user) return;

      try {
        // Save bank information
        await setDoc(
          doc(db, "seller", user.uid),
          {
            bankInfo: value,
            onboarding: true,
            approved: true,
          },
          { merge: true },
        );

        onSuccess();
      } catch (error) {
        console.error("Error saving bank details:", error);
        bank_form.setState((prev) => ({
          ...prev,
          errors: [error.message],
        }));
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        bank_form.handleSubmit();
      }}
      className="flex flex-col gap-4 w-full"
    >
      {/* Bank Name Field */}
      <bank_form.Field
        name="bankName"
        validators={{
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: ({ value }) =>
            !value ? "Bank name is required" : undefined,
        }}
        children={(field) => (
          <div className="flex flex-col">
            <p className="font-semibold text-lg mb-2">Bank Name *</p>
            <FieldInfo field={field} />
            <input
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
              placeholder="Enter bank name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      {/* Account Number Field */}
      <bank_form.Field
        name="accountNumber"
        validators={{
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: ({ value }) =>
            !value ? "Account number is required" : undefined,
        }}
        children={(field) => (
          <div className="flex flex-col">
            <p className="font-semibold text-lg mb-2">Account Number *</p>
            <FieldInfo field={field} />
            <input
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
              placeholder="Enter account number"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      {/* Account Holder Field */}
      <bank_form.Field
        name="accountHolder"
        validators={{
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: ({ value }) =>
            !value ? "Account holder name is required" : undefined,
        }}
        children={(field) => (
          <div className="flex flex-col">
            <p className="font-semibold text-lg mb-2">Account Holder Name *</p>
            <FieldInfo field={field} />
            <input
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
              placeholder="Enter account holder name"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      {/* SWIFT/BIC Field */}
      <bank_form.Field
        name="swiftCode"
        // validators={{
        //   onChangeAsyncDebounceMs: 500,
        //   onChangeAsync: ({ value }) =>
        //     !value ? "SWIFT/BIC code is required" : undefined,
        // }}
        children={(field) => (
          <div className="flex flex-col">
            <p className="font-semibold text-lg mb-2">SWIFT/BIC Code </p>
            <FieldInfo field={field} />
            <input
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
              placeholder="Enter SWIFT/BIC code"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      {/* IBAN Field */}
      <bank_form.Field
        name="iban"
        // validators={{
        //   onChangeAsyncDebounceMs: 500,
        //   onChangeAsync: ({ value }) =>
        //     !value ? "IBAN is required" : undefined,
        // }}
        children={(field) => (
          <div className="flex flex-col">
            <p className="font-semibold text-lg mb-2">IBAN </p>
            <FieldInfo field={field} />
            <input
              className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
              placeholder="Enter IBAN"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
          </div>
        )}
      />

      {/* Bank Address Field */}
      <button
        type="submit"
        className="w-full px-6 rounded-md text-white hover:bg-gray-900 text-sm py-2 font-semibold bg-black mt-4"
      >
        Complete Setup
      </button>
    </form>
  );
};

const OnBoarding = () => {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState(0);

  // Phone number validation helper function
  const validatePhoneNumber = (country, phoneNumber) => {
    // Remove any non-digit characters
    const cleanedNumber = phoneNumber.replace(/\D/g, "");

    switch (country) {
      case "india":
        // Indian mobile numbers:
        // - Starts with 6, 7, 8, or 9
        // - Total 10 digits
        return /^[6-9]\d{9}$/.test(cleanedNumber)
          ? undefined
          : "Invalid Indian mobile number (10 digits, starts with 6-9)";

      case "pakistan":
        // Pakistani mobile numbers:
        // - Starts with 03
        // - Total 10 digits
        return /^(3\d{9})$/.test(cleanedNumber)
          ? undefined
          : "Invalid Pakistani mobile number (10 digits, starts with 3)";

      case "bangladesh":
        // Bangladeshi mobile numbers:
        // - Starts with 01
        // - Total 11 digits
        return /^(1\d{9})$/.test(cleanedNumber)
          ? undefined
          : "Invalid Bangladeshi mobile number (11 digits, starts with 1)";

      case "other":
        // Generic validation for other countries
        // Minimum 10 digits, maximum 15 digits
        return cleanedNumber.length >= 10 && cleanedNumber.length <= 15
          ? undefined
          : "Invalid mobile number (10-15 digits)";

      default:
        return "Please select a country first";
    }
  };

  // Check onboarding status
  useEffect(() => {
    async function getOnboardState() {
      if (!user) return;

      setLoading(true);
      try {
        const docSnap = await getDoc(doc(db, "seller", user.uid));
        if (docSnap.exists()) {
          // setOnBoarding(docSnap.data()["onboarding"] || false);
        }
      } catch (error) {
        console.error("Error fetching onboarding state:", error);
      }
      setLoading(false);
    }

    getOnboardState();
  }, [user]);

  // Store Information Form
  const store_form = useForm({
    defaultValues: {
      name: "",
      desc: "",
      contact_no: "",
      category: "",
      currency: "",
      country: "",
    },
    onSubmit: async ({ value }) => {
      if (!user) return;

      try {
        // Additional validation before submission
        const phoneValidation = validatePhoneNumber(
          value.country,
          value.contact_no,
        );
        if (phoneValidation) {
          throw new Error(phoneValidation);
        }

        // Update user profile
        await updateProfile(user, {
          displayName: value.name,
          phoneNumber: value.contact_no,
        });
        // Inside store_form onSubmit
        if (value.country === "pakistan") {
          value.currency = "PKR";
        } else if (value.country === "india") {
          value.currency = "INR";
        } else if (value.country === "bangladesh") {
          value.currency = "BDT";
        } else {
          value.currency = "USD";
        }

        // Save seller information
        await setDoc(doc(db, "seller", user.uid), value, { merge: true });

        // Move to next step
        setState(1);
      } catch (error) {
        // Handle validation errors
        console.error("Error updating seller information:", error);
        // You might want to set a form-level error here
        store_form.setState((prev) => ({
          ...prev,
          errors: [error.message],
        }));
      }
    },
  });
  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if already onboarded
  return (
    <div className="min-h-screen flex flex-col w-full items-center justify-center">
      <div className="flex flex-col px-16 py-8 border border-gray-300 rounded-md min-w-96 w-2/5  items-center gap-2">
        <h1 className="text-3xl font-bold">Welcome To Sahyaan</h1>
        <p className="text-sm">Let's setup your store</p>

        {/* Progress Indicators */}
        <div className="flex flex-row gap-20 items-center justify-center">
          <div className="flex flex-col gap-2 justify-center items-center mt-4">
            <div
              className={`p-2 ${state === 1 ? "bg-green-500" : "bg-black"} w-min rounded-full`}
            >
              {state === 0 ? (
                <Store className="h-5 w-5 text-white" />
              ) : (
                <Check className="h-5 w-5 text-white" />
              )}
            </div>
            <p className="text-sm">Store Information</p>
          </div>

          <div className="flex flex-col gap-2 justify-center items-center mt-4">
            <div className="p-2 bg-black w-min rounded-full">
              {state <= 1 ? (
                <CreditCard className="h-5 w-5 text-white" />
              ) : (
                <Check className="h-5 w-5 text-white" />
              )}
            </div>
            <p className="text-sm">Bank Information</p>
          </div>
        </div>

        {/* Store Information Form */}
        {state === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              store_form.handleSubmit();
            }}
            className="flex flex-col gap-4 w-full"
          >
            {/* Name Field */}
            <store_form.Field
              name="name"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Name is required"
                    : value.length < 3
                      ? "Min length 3"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg mb-2">Store Name *</p>
                  <FieldInfo field={field} />
                  <input
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
                    placeholder="Enter your store name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            />

            {/* Description Field */}
            <store_form.Field
              name="desc"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value
                    ? "Description is required"
                    : value.length < 20
                      ? "Min length 20"
                      : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg mb-2">
                    Store Description *
                  </p>
                  <FieldInfo field={field} />
                  <textarea
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
                    placeholder="Describe your store"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    rows={3}
                  />
                </div>
              )}
            />

            {/* Country Field */}
            <store_form.Field
              name="country"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value }) =>
                  !value ? "Country is required" : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg mb-2">Country *</p>
                  <FieldInfo field={field} />
                  <select
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((country) => (
                      <option key={country.value} value={country.value}>
                        {country.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            />

            {/* Contact Number Field */}
            <store_form.Field
              name="contact_no"
              validators={{
                onChangeAsyncDebounceMs: 500,
                onChangeAsync: ({ value, fieldApi }) => {
                  // Get the current country value
                  console.log(value);
                  console.log(fieldApi);
                  const country = fieldApi.form.getFieldValue("country");

                  console.log(country);
                  // If no country is selected, require country selection first
                  if (!country) {
                    return "Please select a country first";
                  }

                  // Use country-specific validation
                  const v = validatePhoneNumber(country, value);
                  console.log(v);
                  return v;
                  // return validatePhoneNumber(country, value);
                },
              }}
              children={(field) => {
                // Get the current country
                const country = store_form.getFieldValue("country");
                return (
                  <div className="flex flex-col">
                    <p className="font-semibold text-lg mb-2">
                      {country
                        ? `${country.charAt(0).toUpperCase() + country.slice(1)} `
                        : ""}
                      Contact Number *
                    </p>
                    <FieldInfo field={field} />
                    <div className="flex items-center">
                      {country === "india" && <span className="mr-2">+91</span>}
                      {country === "pakistan" && (
                        <span className="mr-2">+92</span>
                      )}
                      {country === "bangladesh" && (
                        <span className="mr-2">+880</span>
                      )}
                      {country === "other" && <span className="mr-2">+</span>}
                      <input
                        type="tel"
                        className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
                        placeholder={
                          country === "india"
                            ? "10 digit mobile number"
                            : country === "pakistan"
                              ? "3XXXXXXXX"
                              : country === "bangladesh"
                                ? "1XXXXXXXXX"
                                : country === "other"
                                  ? "Your mobile number"
                                  : "Select country first"
                        }
                        value={field.state.value}
                        onChange={(e) => {
                          field.handleChange(e.target.value);
                        }}
                        onBlur={field.handleBlur}
                        // disabled={!country}
                      />
                    </div>
                    {country && (
                      <p className="text-xs text-gray-500 mt-1">
                        {country === "india"
                          ? "Example: 9876543210"
                          : country === "pakistan"
                            ? "Example: 3XXXXXXXX"
                            : country === "other"
                              ? "Varies by country"
                              : ""}
                      </p>
                    )}
                  </div>
                );
              }}
            />

            {/* Category Field */}
            <store_form.Field
              name="category"
              validators={{
                onChangeAsync: ({ value }) =>
                  !value ? "Category is required" : undefined,
              }}
              children={(field) => (
                <div className="flex flex-col">
                  <p className="font-semibold text-lg mb-2">Store Category *</p>
                  <FieldInfo field={field} />
                  <select
                    className="bg-white border border-gray-300 rounded-md px-3 py-2 w-full outline-none"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  >
                    <option value="">Select Category</option>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="food">Food & Grocery</option>
                    <option value="books">Books</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
            />
          </form>
        )}

        {/* Stripe Payment Form */}
        {state === 1 && user && (
          <div className="w-full">
            <h2 className="text-xl font-bold mb-4">Bank Information</h2>
            <BankDetailsForm
              user={user}
              onSuccess={() => {
                router.replace("/");
              }}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex flex-row items-center justify-between w-full mt-3">
          {state === 1 && (
            <button
              onClick={() => setState(0)}
              className="px-6 rounded-md text-white hover:bg-gray-900 text-sm py-2 font-semibold bg-black"
            >
              Back
            </button>
          )}

          {state === 0 && (
            <button
              onClick={() => store_form.handleSubmit()}
              className="w-full px-6 rounded-md text-white hover:bg-gray-900 text-sm py-2 font-semibold bg-black"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnBoarding;
