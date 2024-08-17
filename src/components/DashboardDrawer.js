"use client";
import React, { useEffect, useState } from "react";
import {
  Menu,
  HelpCircle,
  LayoutDashboard,
  Package,
  Store,
  Boxes,
  PackagePlus,
} from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { usePathname, useRouter } from "next/navigation";
import Avatar from "boring-avatars";
import Link from "next/link";
import DashboardTile from "./DashboardTile";

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
    {
      icon: <Store />,
      label: "Products",
      submenu: [
        { icon: <Boxes />, label: "Catelog", pathname: "/product/catalog" },
        {
          icon: <PackagePlus />,
          label: "Add Product",
          pathname: "/product/add",
        },
      ],
    },
    { icon: <HelpCircle />, label: "Help", pathname: "/help" },
  ];
  return (
    <>
      <div
        className={` md:h-full  ${isExpanded ? " lg:w-64" : "h-20 w-10 md:w-20"}`}
      ></div>
      <div
        className={`fixed z-50 flex justify-between md:justify-start md:flex-col gap-4 items-center   py-4 px-4  left-0 top-0 md:h-full bg-primary text-white transition-all duration-200 ease-in-out shadow-2xl  md:rounded-r-lg ${
          isExpanded
            ? " flex-col w-full lg:w-64 h-full "
            : " flex-row h-20 w-full md:w-20"
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
          className={` lg:h-full ${isExpanded ? "visible" : "sm:hidden md:flex"} w-full  flex-col gap-1`}
          // onMouseEnter={() => setIsExpanded(true)}
          // onMouseLeave={() => setIsExpanded(false)}
        >
          {menuItems.map((item, index) => (
            <DashboardTile
              item={item}
              key={index}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
            />
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
