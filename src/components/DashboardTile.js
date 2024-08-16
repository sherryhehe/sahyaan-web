"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function DashboardTile({ item, isExpanded }) {
  //let subMenuOpen = false;
  //console.log(subMenuOpen);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isExpanded) {
      setSubmenuOpen(false);
    }
  }, [isExpanded]);
  return (
    <>
      <div
        onClick={() => {
          if (item.pathname) {
            router.push(item.pathname);
          } else if (isExpanded) {
            setSubmenuOpen((prev) => !prev);
          }
        }}
        className={`flex items-center  py-2  cursor-pointer transition-all duration-300 flex-row ease-in-out rounded-lg ${
          isExpanded ? "w-full px-4 justify-start" : "w-12 h-12 justify-center"
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
      </div>
      {submenuOpen &&
        item.submenu.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              if (item.pathname) {
                router.push(item.pathname);
              } else if (isExpanded) {
                setSubmenuOpen((prev) => !prev);
              }
            }}
            className={`flex items-center  py-2 pl-8  cursor-pointer transition-all duration-300 flex-row ease-in-out rounded-lg ${
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
          </div>
        ))}
    </>
  );
}
