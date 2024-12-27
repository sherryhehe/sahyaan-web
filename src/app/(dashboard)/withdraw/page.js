"use client";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";

export default function WithdrawPage() {
  const [user] = useAuthState(auth);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [seller, setSeller] = useState();
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  const formatCurrency = (value, currency) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: currency || "USD",
    });
  };

  // const fetchWithdrawalHistory = async (userId) => {
  //   const withdrawalsRef = collection(db, "withdrawals");
  //   const q = query(
  //     withdrawalsRef,
  //     where("sellerId", "==", userId),
  //     orderBy("date", "desc"),
  //   );
  //   const querySnapshot = await getDocs(q);
  //   return querySnapshot.docs.map((doc) => ({
  //     id: doc.id,
  //     ...doc.data(),
  //   }));
  // };

  async function fetchData() {
    if (!user) return;
    try {
      const sellerDoc = await getDoc(doc(db, "seller", user.uid));
      if (!sellerDoc.exists()) {
        throw new Error("Seller profile not found");
      }
      const data = sellerDoc.data();
      setSeller({ id: sellerDoc.id, ...data });
      setBalance(data.revenue - data.debt);

      // const history = await fetchWithdrawalHistory(user.uid);
      const history = data.withdrawal;
      setWithdrawalHistory(history);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchData();
  }, [user]);

  const handleWithdraw = async () => {
    if (!user || balance <= 0) return;
    try {
      setProcessing(true);
      const response = await fetch("/api/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: user.uid,
          amount: balance,
          currency: seller.currency || "USD",
          email: user.email,
          sellerName: user.displayName || "User",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Refresh withdrawal history after successful withdrawal
      // const history = data.withdrawal;
      // setWithdrawalHistory(history);
      // setBalance(0);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading || !seller) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-text">Loading balance...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-4xl mx-auto">
        {/* Balance and Withdrawal Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-2xl font-bold text-text mb-6">Withdraw Funds</h1>
          <div className="mb-6">
            <p className="text-secondary mb-2">Available Balance:</p>
            <p className="text-3xl font-bold text-text">
              {formatCurrency(balance, seller.currency)}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleWithdraw}
            disabled={processing || balance <= 0}
            className={`w-full py-2 px-4 rounded-md text-white transition-colors ${
              processing || balance <= 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-primary-600"
            }`}
          >
            {processing
              ? "Processing..."
              : balance <= 0
                ? "No Funds Available"
                : "Withdraw Funds"}
          </button>
        </div>

        {/* Withdrawal History Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-text mb-6">
            Withdrawal History
          </h2>
          {withdrawalHistory && withdrawalHistory.length ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Reference ID</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalHistory.map((withdrawal) => (
                    <tr key={withdrawal.id} className="border-b">
                      <td className="px-4 py-2">
                        {new Date(withdrawal.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {formatCurrency(withdrawal.amount, withdrawal.currency)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded-full text-sm ${
                            withdrawal.status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-sm">
                        {withdrawal.referenceId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No withdrawal history available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
