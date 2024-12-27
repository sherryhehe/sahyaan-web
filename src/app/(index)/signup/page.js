"use client";
import React, { useState } from "react";
import bg from "@/assets/images/login_bg.png";
import { useRouter } from "next/navigation";
import { googleSignin, signupWithEmail } from "./signup";
import Link from "next/link";
import Loading from "@/components/Loading";
import axios from "axios";

function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await signupWithEmail(username, email, password, country);
      console.log(user);
      // Redirect to dashboard or home page after successful login
      router.push("/onboarding");
    } catch (err) {
      console.log(error);
      setError(err.message);
    }
    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    // Implement Google signup logic here
    // const response = await axios.get("http://ip-api.com/json/");
    // const country = response.data.countryCode.toLowerCase();

    try {
      const user = await googleSignin("");
      console.log(user);
      router.push("/");
    } catch (err) {
      console.log(err);
      setError(err.message);
      // //  // console.log(err);
      // ToastAndroid.show(err.message, ToastAndroid.SHORT);
    }
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
      <div className=" flex flex-col px-32 py-32 min-w-[45%] bg-bg rounded-tl-3xl items-center justify-center ">
        <h1 className=" font-bold text-xl">Sign Up</h1>
        <form className="flex flex-col gap-1 w-[50%]" onSubmit={handleSubmit}>
          <p className=" text-sm font-light text-red-600">{error && error}</p>
          <div>
            <label
              htmlFor="Username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="username"
              id="username"
              name="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className=" font-thin text-base   mt-1 block p-1 w-full border border-gray-500 rounded-lg h-8 shadow-sm ring-0 focus:border-primary focus:ring-primary sm:text-sm"
            />
          </div>
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

          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700"
            >
              Country
            </label>
            <select
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 block p-1 w-full border border-gray-500 rounded-lg h-8 font-thin "
              required
            >
              <option className="font-thin" value="pk">
                Pakistan
              </option>
              <option className="font-thin" value="in">
                India
              </option>
              <option className="font-thin" value="bd">
                Bangladesh
              </option>
            </select>
          </div>
          {!loading ? (
            <button
              type="submit"
              className="w-full mt-5 bg-primary text-bg py-2 px-4 rounded-md shadow-sm hover:bg-secondary duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign Up
            </button>
          ) : (
            <div className="w-full mt-5 bg-primary text-bg flex flex-row items-center justify-center  px-4 rounded-md shadow-sm hover:bg-secondary duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Loading className={"w-10"} />
            </div>
          )}

          {!loading ? (
            <button
              onClick={() => {
                handleGoogleSignup();
              }}
              className="w-full mt-5 bg-blue-500 text-bg py-2 px-4 rounded-md shadow-sm hover:bg-blue-400 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Sign Up with Google
            </button>
          ) : (
            <div className="w-full mt-5 bg-blue-500 text-bg py-2 px-4 rounded-md shadow-sm hover:bg-blue-400 duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <Loading className={"w-10"} />
            </div>
          )}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Have an account?
          </Link>
        </form>
      </div>
    </div>
  );
}

export default page;
