"use client";
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  Bell,
  Shield,
  CreditCard,
} from "lucide-react";
import {
  getAuth,
  updatePassword,
  updateEmail,
  updateProfile,
} from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";
import { useForm } from "@tanstack/react-form";

import { useQuery } from "@tanstack/react-query";
const COUNTRIES = [
  { value: "india", label: "India", currency: "INR" },
  { value: "pakistan", label: "Pakistan", currency: "PKR" },
  { value: "bangladesh", label: "Bangladesh", currency: "BDT" },
  { value: "other", label: "Other", currency: "USD" },
];

const AccountSettings = () => {
  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);

  const [openSections, setOpenSections] = useState({
    profile: true,
    location: false,
    notifications: false,
    security: false,
    billing: false,
  });

  const fetchUserData = async () => {
    const userDoc = await getDoc(doc(db, "seller", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        fullName: user.displayName || "",
        email: user.email || "",
        country: data.country || "",
        currency: data.currency || "",
        notificationsEnabled: data.notificationsEnabled || false,
        password: "",
        bankInfo: data.bankInfo || {
          accountHolder: "",
          accountNumber: "",
          bankAddress: "",
          bankName: "",
          iban: "",
          swiftCode: "",
        },
      };
    }
  };

  const { data, status, error, isLoading } = useQuery({
    queryKey: ["data"],
    queryFn: async () => {
      return await fetchUserData();
    },
  });
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  const form = useForm({
    defaultValues: {
      fullName: data?.firstName ?? "",
      email: data?.email ?? "",
      country: data?.country ?? "",
      currency: data?.currency ?? "",
      password: data?.password ?? "",
      bankInfo: {
        accountHolder: data?.bankInfo.accountHolder ?? "",
        accountNumber: data?.bankInfo.accountNumber ?? "",
        bankName: data?.bankInfo.bankName ?? "",
        iban: data?.bankInfo.iban ?? "",
        swiftCode: data?.bankInfo.swiftCode ?? "",
      },
    },
  });

  // useEffect(() => {
  //
  //   fetchUserData();
  // }, [user, db]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const values = form.getFieldValue();
      await updateProfile(user, {
        displayName: values.fullName,
      });

      if (user.email !== values.email) {
        await updateEmail(user, values.email);
      }

      await updateDoc(doc(db, "seller", user.uid), {
        name: values.fullName,
      });

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleUpdateLocation = async () => {
    if (!user) return;

    try {
      const values = form.getValues();
      const selectedCountry = COUNTRIES.find((c) => c.value === values.country);
      const currency = selectedCountry ? selectedCountry.currency : "USD";

      await updateDoc(doc(db, "seller", user.uid), {
        country: values.country,
        currency: currency,
      });

      form.setValue("currency", currency);

      toast.success("Location updated successfully");
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    try {
      const values = form.getValues();
      await updatePassword(user, values.password);
      form.setValue("password", "");
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  };

  const handleUpdateBankInfo = async () => {
    if (!user) return;

    try {
      const values = form.getValues();
      await updateDoc(doc(db, "seller", user.uid), {
        bankInfo: values.bankInfo,
      });

      toast.success("Bank information updated successfully");
    } catch (error) {
      console.error("Error updating bank information:", error);
      toast.error("Failed to update bank information");
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const SettingsTile = ({ title, icon: Icon, isOpen, onToggle, children }) => (
    <div className="mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-bg-50 hover:bg-bg-100 rounded-t-lg border-b border-secondary-200"
      >
        <div className="flex items-center space-x-3">
          <Icon className="text-primary-500 w-5 h-5" />
          <span className="font-medium text-text-500">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="text-secondary-400 w-5 h-5" />
        ) : (
          <ChevronDown className="text-secondary-400 w-5 h-5" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 bg-bg-50 rounded-b-lg border-t border-secondary-200">
          {children}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text-500 mb-8">
          Account Settings
        </h1>

        <form>
          <SettingsTile
            title="Profile Information"
            icon={User}
            isOpen={openSections.profile}
            onToggle={() => toggleSection("profile")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Full Name
                </label>
                <form.Field name="fullName">
                  {(field) => (
                    <input
                      type="text"
                      className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={field.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </form.Field>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Email
                </label>
                <form.Field name="email">
                  {(field) => (
                    <input
                      type="email"
                      className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={field.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </form.Field>
              </div>
              <button
                type="button"
                onClick={handleUpdateProfile}
                className="px-4 py-2 bg-primary-500 text-bg-50 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Save Changes
              </button>
            </div>
          </SettingsTile>

          <SettingsTile
            title="Location"
            icon={MapPin}
            isOpen={openSections.location}
            onToggle={() => toggleSection("location")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Country
                </label>
                <form.Field name="country">
                  {(field) => (
                    <select
                      className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={field.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.value} value={country.value}>
                          {country.label}
                        </option>
                      ))}
                    </select>
                  )}
                </form.Field>
              </div>
              <form.Field name="currency">
                {(field) =>
                  field.value && (
                    <div>
                      <label className="block text-sm font-medium text-text-400 mb-1">
                        Currency
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md bg-secondary-50"
                        value={field.value}
                        disabled
                      />
                    </div>
                  )
                }
              </form.Field>
              <button
                type="button"
                onClick={handleUpdateLocation}
                className="px-4 py-2 bg-primary-500 text-bg-50 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Save Changes
              </button>
            </div>
          </SettingsTile>

          <SettingsTile
            title="Security"
            icon={Shield}
            isOpen={openSections.security}
            onToggle={() => toggleSection("security")}
          >
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  New Password
                </label>
                <form.Field name="password">
                  {(field) => (
                    <input
                      type="password"
                      className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={field.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  )}
                </form.Field>
              </div>
              <button
                type="button"
                onClick={handleUpdatePassword}
                className="px-4 py-2 bg-primary-500 text-bg-50 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Update Password
              </button>
            </div>
          </SettingsTile>

          <SettingsTile
            title="Billing Information"
            icon={CreditCard}
            isOpen={openSections.billing}
            onToggle={() => toggleSection("billing")}
          >
            <div className="space-y-4">
              <div className="flex flex-col space-y-4">
                <h4 className="text-sm font-medium text-text-500">
                  Bank Information
                </h4>

                <div>
                  <label className="block text-sm font-medium text-text-400 mb-1">
                    Bank Name
                  </label>
                  <form.Field name="bankInfo.bankName">
                    {(field) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                        value={field.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-400 mb-1">
                    Account Holder
                  </label>
                  <form.Field name="bankInfo.accountHolder">
                    {(field) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                        value={field.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-400 mb-1">
                    Account Number
                  </label>
                  <form.Field name="bankInfo.accountNumber">
                    {(field) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                        value={field.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-400 mb-1">
                    Swift Code
                  </label>
                  <form.Field name="bankInfo.swiftCode">
                    {(field) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                        value={field.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-400 mb-1">
                    IBAN
                  </label>
                  <form.Field name="bankInfo.iban">
                    {(field) => (
                      <input
                        type="text"
                        className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                        value={field.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    )}
                  </form.Field>
                </div>

                <button
                  type="button"
                  onClick={handleUpdateBankInfo}
                  className="px-4 py-2 bg-primary-500 text-bg-50 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
                >
                  Save Bank Information
                </button>
              </div>
            </div>
          </SettingsTile>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;
