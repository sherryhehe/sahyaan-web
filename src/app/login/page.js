"use client";
import React, { useState } from "react";
import bg from "@/assets/images/login_bg.png";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { loginSeller } from "./login";
import Link from "next/link";
import Loading from "@/components/Loading";
function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginSeller(email, password);
      // Redirect to dashboard or home page after successful login
        
            router.push("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err.message);
    }
    setLoading(false);
  };
  return (
    <div
      style={{
        backgroundImage: `url(${bg.src})`,
        backgroundRepeat: "repeat",
        width: "100vw",
        height: "100vh",
        backgroundSize: "contain",
      }}
      className="flex justify-end"
    >
      <div className=" flex flex-col px-32 py-28 min-w-[45%] bg-bg rounded-tl-3xl items-center justify-center ">
        <h1 className=" font-bold text-xl">Login</h1>
        <form className="flex flex-col gap-1 w-[50%]" onSubmit={handleSubmit}>
          <p className=" text-sm font-light text-red-600">{error && error}</p>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" font-thin text-base   mt-1 block p-1 w-full border border-gray-500 rounded-lg h-8 shadow-sm ring-0 focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" font-thin text-base   mt-1 block p-1 w-full border border-gray-500 rounded-lg h-8 shadow-sm ring-0 focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
          {!loading ? (
            <button
              type="submit"
              className="w-full mt-5 bg-primary text-bg py-2 px-4 rounded-md shadow-sm hover:bg-secondary duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign In
            </button>
          ) : (
            <div className="w-full mt-5 bg-primary text-bg flex flex-row items-center justify-center  px-4 rounded-md shadow-sm  ">
              <Loading className={"w-10"} />
            </div>
          )}
          <div className="text-center text-sm text-gray-600 mb-8">
            <a
              href="#"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Forgot your password?
            </a>
          </div>
          <Link href={"/signup"} className="font-thin text-center text-sm">
            New seller? Create a new
          </Link>
        </form>
      </div>
    </div>
  );
}

export default page;
