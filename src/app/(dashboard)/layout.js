"use client";
import DashboardDrawer from "@/components/DashboardDrawer";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  if (loading) {
    return <p>loading ...</p>;
  }
  if (!user) {
    router.replace("/login");
  } else {
    return (
      <html lang="en">
        <body className="flex flex-row h-screen">
          <DashboardDrawer />

          {children}
          <Toaster />
        </body>
      </html>
    );
  }
}
