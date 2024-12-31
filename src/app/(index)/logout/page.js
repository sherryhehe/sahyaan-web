"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";

const LogoutPage = () => {
  const router = useRouter();
  // const auth = getAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        router.push("/login"); // or wherever your login page is
      } catch (error) {
        console.error("Logout failed:", error);
        // You might want to show an error message to the user
        router.push("/"); // Redirect to home or another appropriate page on error
      }
    };

    handleLogout();
  }, [router, auth]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Logging out...
        </h1>
        <p className="text-gray-500">
          Please wait while we securely log you out.
        </p>
      </div>
    </div>
  );
};

export default LogoutPage;
