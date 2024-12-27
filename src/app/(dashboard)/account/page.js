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
import { auth, db } from "@/firebase/firebase";

const SettingsTile = ({ title, icon: Icon, isOpen, onToggle, children }) => (
  <div className="mb-4">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 bg-bg-100 hover:bg-bg-200 duration-100 transition-all rounded-t-lg border-b border-secondary-200"
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
const COUNTRIES = [
  { value: "india", label: "India", currency: "INR" },
  { value: "pakistan", label: "Pakistan", currency: "PKR" },
  { value: "bangladesh", label: "Bangladesh", currency: "BDT" },
  { value: "other", label: "Other", currency: "USD" },
];

const AccountSettings = () => {
  const user = auth.currentUser;

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    country: "",
    currency: "",
    notificationsEnabled: false,
    bankInfo: {
      accountHolder: "",
      accountNumber: "",
      bankName: "",
      iban: "",
      swiftCode: "",
    },
  });

  const [password, setPassword] = useState("");

  const [openSections, setOpenSections] = useState({
    profile: false,
    location: false,
    notifications: false,
    security: false,
    billing: false,
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "seller", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            fullName: user.displayName || "",
            email: user.email || "",
            country: data.country || "",
            currency: data.currency || "",
            phoneNo: data.contact_no || "",
            notificationsEnabled: data.notificationsEnabled || false,
            bankInfo: data.bankInfo || {
              accountHolder: "",
              accountNumber: "",
              bankAddress: "",
              bankName: "",
              iban: "",
              swiftCode: "",
            },
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, db]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      await updateProfile(user, {
        displayName: userData.fullName,
      });

      if (user.email !== userData.email) {
        await updateEmail(user, userData.email);
      }

      await updateDoc(doc(db, "seller", user.uid), {
        name: userData.fullName,
        contact_no: userData.phoneNo,
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
      const selectedCountry = COUNTRIES.find(
        (c) => c.value === userData.country,
      );
      const currency = selectedCountry ? selectedCountry.currency : "USD";

      await updateDoc(doc(db, "seller", user.uid), {
        country: userData.country,
        currency: currency,
      });

      setUserData((prev) => ({
        ...prev,
        currency: currency,
      }));

      toast.success("Location updated successfully");
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error("Failed to update location");
    }
  };

  const handleUpdatePassword = async () => {
    if (!user) return;

    try {
      await updatePassword(user, password);
      setPassword("");
      toast.success("Password updated successfully");
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  };

  const handleUpdateBankInfo = async () => {
    if (!user) return;

    try {
      await updateDoc(doc(db, "seller", user.uid), {
        bankInfo: userData.bankInfo,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-text-500 mb-8">
          Account Settings
        </h1>

        <SettingsTile
          title="Profile Information"
          icon={User}
          isOpen={openSections.profile}
          onToggle={() => {
            toggleSection("profile");
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={userData.fullName}
                onChange={(e) => {
                  // e.preventDefault();
                  setUserData((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }));
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-400 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={userData.email}
                onChange={(e) => {
                  e.preventDefault();
                  setUserData((prev) => ({ ...prev, email: e.target.value }));
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={userData.phoneNo}
                onChange={(e) => {
                  e.preventDefault();
                  setUserData((prev) => ({ ...prev, phoneNo: e.target.value }));
                }}
              />
            </div>
            <button
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
              <select
                className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={userData.country}
                onChange={(e) => {
                  e.preventDefault();
                  setUserData((prev) => ({ ...prev, country: e.target.value }));
                }}
              >
                <option value="">Select Country</option>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
            {userData.currency && (
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Currency
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md bg-secondary-50"
                  value={userData.currency}
                  disabled
                />
              </div>
            )}
            <button
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
              <input
                type="password"
                className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={password}
                onChange={(e) => {
                  e.preventDefault();
                  setPassword(e.target.value);
                }}
              />
            </div>
            <button
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
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={userData.bankInfo.bankName}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserData((prev) => ({
                      ...prev,
                      bankInfo: {
                        ...prev.bankInfo,
                        bankName: e.target.value,
                      },
                    }));
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Account Holder
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={userData.bankInfo.accountHolder}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserData((prev) => ({
                      ...prev,
                      bankInfo: {
                        ...prev.bankInfo,
                        accountHolder: e.target.value,
                      },
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={userData.bankInfo.accountNumber}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserData((prev) => ({
                      ...prev,
                      bankInfo: {
                        ...prev.bankInfo,
                        accountNumber: e.target.value,
                      },
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  Swift Code
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={userData.bankInfo.swiftCode}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserData((prev) => ({
                      ...prev,
                      bankInfo: {
                        ...prev.bankInfo,
                        swiftCode: e.target.value,
                      },
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-400 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-secondary-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={userData.bankInfo.iban}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserData((prev) => ({
                      ...prev,
                      bankInfo: {
                        ...prev.bankInfo,
                        iban: e.target.value,
                      },
                    }));
                  }}
                />
              </div>

              <button
                onClick={handleUpdateBankInfo}
                className="px-4 py-2 bg-primary-500 text-bg-50 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Save Bank Information
              </button>
            </div>
          </div>
        </SettingsTile>
      </div>
    </div>
  );
};

export default AccountSettings;
