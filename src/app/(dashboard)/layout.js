"use client";
import DashboardDrawer from "@/components/DashboardDrawer";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Loading from "@/components/Loading";

export default function RootLayout({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  if (loading) {
    //    return <p>loading ...</p>;

    return (
      <div className="flex w-screen h-screen bg-bg items-center justify-center">
        <div className="w-40 h-40">
          <Loading className="text-text w-32" />
        </div>
      </div>
    );
  }
  if (!user) {
    router.replace("/login");
  } else {
    return (
      <html lang="en">
        <body className="flex flex-col md:flex-row h-screen">
          <DashboardDrawer />
          <div className="px-3 md:px-0 mt-24 md:mt-0 w-full">{children}</div>
          <Toaster />
        </body>
      </html>
    );
  }
}
