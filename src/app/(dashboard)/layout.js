"use client";
import DashboardDrawer from "@/components/DashboardDrawer";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import Loading from "@/components/Loading";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export default function RootLayout({ children }) {
  const [user, loading, error] = useAuthState(auth);
  const [userData, setUserData] = useState();
  const router = useRouter();
  async function getUserData() {
    const userData = await getDoc(doc(db, "seller", user.uid)).then((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
    console.log(userData);
    setUserData(userData);
  }

  useEffect(() => {
    if (user) getUserData();
  }, [user]);

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
  if (!user && !userData) {
    router.replace("/login");
  } else {
    if (userData && !userData.approved) {
      router.replace("/onboarding");
    } else {
      return (
        <QueryClientProvider client={queryClient}>
          <div className="flex flex-col md:flex-row h-screen">
            <DashboardDrawer />
            <div className="px-3 md:px-0 w-full">{children}</div>
            <Toaster />
          </div>
        </QueryClientProvider>
      );
    }
  }
}
