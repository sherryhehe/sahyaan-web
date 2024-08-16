"use client";
import { auth } from "@/firebase/firebase";
import { Search } from "lucide-react";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchCatelog } from "./fetch";

export default function page() {
  const [user] = useAuthState(auth);
  function searchCatelog(search) {
    const q = search.get("search");
    console.log(q);
  }
  useEffect(() => {
    //console.log("init");
    async function init() {
      const prods = await fetchCatelog(user.uid);
      console.log(prods);
    }
    init();
  }, []);
  return (
    <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
      <p className="font-black text-2xl">Product Catelog</p>
      <div className="flex flex-row w-full justify-center h-10 items-center">
        <form
          action={searchCatelog}
          className="bg-bg-200 w-3/5 h-full rounded-lg flex flex-row items-center px-4"
        >
          <Search />
          <input
            placeholder="Search Catelog"
            name="search"
            className="h-full w-full bg-transparent ring-0 outline-none px-2"
          />
        </form>

        <div></div>
      </div>
    </div>
  );
}
