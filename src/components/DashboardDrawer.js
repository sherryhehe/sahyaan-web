"use client";
import React, { useEffect, useState } from "react";
import {
  Menu,
  Home,
  Settings,
  HelpCircle,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "boring-avatars";
import Link from "next/link";

function DashboardDrawer() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    console.log(user.uid);
  });

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Dashboard", pathname: "/dashboard" },
    { icon: <Package />, label: "Orders", pathname: "/order" },
    { icon: <HelpCircle />, label: "Help", pathname: "/help" },
  ];
  return (
    <>
      <div
        className={`relative h-full  ${isExpanded ? " lg:w-64" : " w-20"}`}
      ></div>
      <div
        className={`fixed flex flex-col gap-4 items-center   py-4 px-4  left-0 top-0 h-full bg-primary text-white transition-all duration-200 ease-in-out shadow-2xl rounded-r-lg ${
          isExpanded ? " lg:w-64 " : "w-min"
        }`}
      >
        <div
          className={`hover:bg-secondary-700 cursor-pointer  pl-2  w-12 h-12 transition-all duration-300 self-start flex items-center justify-start rounded-lg`}
          onClick={() => {
            setIsExpanded((prev) => !prev);
          }}
        >
          <Menu className="w-8 h-8 " />
        </div>
        <nav
          className="h-full w-full flex flex-col gap-1"
          // onMouseEnter={() => setIsExpanded(true)}
          // onMouseLeave={() => setIsExpanded(false)}
        >
          {menuItems.map((item, index) => (
            <Link
              href={item.pathname}
              key={index}
              className={`flex items-center  py-2  cursor-pointer transition-all duration-300 flex-row ease-in-out rounded-lg ${
                isExpanded
                  ? "w-full px-4 justify-start"
                  : "w-12 h-12 justify-center"
              } ${
                item.pathname == pathname
                  ? "bg-secondary"
                  : "bg-transparent hover:bg-secondary-700"
              } `}
            >
              {item.icon}
              <span
                className={`ml-4 whitespace-nowrap overflow-hidden  just ${
                  isExpanded
                    ? "opacity-100 max-w-[200px] visible"
                    : "opacity-0 max-w-0 hidden"
                }  `}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex w-full rounded-md  hover:bg-secondary-600 hover:cursor-pointer duration-300 p-2 flex-row items-center justify-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-500">
            {user.photoURL ? (
              <img src={user.photoURL} />
            ) : (
              <Avatar
                size={"100%"}
                name={user.displayName}
                variant="pixel"
                colors={[
                  "#181825",
                  "#45475a",
                  "#ffffff",
                  "#11111b",
                  "#050507",
                  "#0D0E12",
                  "#CCCCCC",
                  "#07070B",
                ]}
              />
            )}
          </div>
          {isExpanded && (
            <div>
              <p className="text-sm font-semiBold">{user.displayName}</p>
              <p className="text-sm font-thin">{user.email}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default DashboardDrawer;
