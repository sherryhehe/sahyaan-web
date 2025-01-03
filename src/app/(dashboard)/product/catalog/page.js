"use client";
import { auth } from "@/firebase/firebase";
import { Search } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { fetchCatelog } from "./fetch";
import Link from "next/link";
import Loading from "@/components/Loading";
export default function page() {
  const [user] = useAuthState(auth);

  async function searchCatalog(search) {
    const q = search
      .get("search")
      .split(":")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (q.length == 0) {
      setCatelog(backupCatelog);
      return;
    }
    const filteredCatalog = catalog.filter((prod) => {
      if (q.length < 2)
        return (
          prod.name.includes(q) ||
          prod.shortDescription.includes(q) ||
          prod.keywords.includes(q)
        ); // If no proper filter is provided, include all products

      const [filterKey, filterValue] = q;
      const filterValues = filterValue
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);

      if (
        filterKey === "title" ||
        filterKey === "name" ||
        filterKey === "desc" ||
        filterKey === "keywords"
      ) {
        return filterValues.some(
          (val) =>
            prod["name"].toLowerCase().includes(val.toLowerCase()) ||
            prod["shortDescription"]
              .toLowerCase()
              .includes(val.toLowerCase()) ||
            prod["keywords"].some((keyword) =>
              keyword.toLowerCase().includes(val.toLowerCase()),
            ),
        );
      } else {
        const filterKeys = Object.keys(prod).filter((key) =>
          key.toLowerCase().includes(filterKey.toLowerCase()),
        );
        return filterKeys.some((key) =>
          filterValues.some((val) =>
            String(prod[key]).toLowerCase().includes(val.toLowerCase()),
          ),
        );
      }
    });

    setCatelog(filteredCatalog);
  }

  const [backupCatelog, setBackCatelog] = useState();
  const [catalog, setCatelog] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    //console.log("init");
    async function init() {
      setLoading(true);
      await fetchCatelog(user.uid)
        .then((prods) => {
          setCatelog(prods);
          setBackCatelog(prods);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    init();
  }, []);
  console.log(catalog);
  if (loading) {
    return (
      <div className="flex w-full h-full bg-bg items-center justify-center">
        <div className="w-40 h-40">
          <Loading className="text-text w-32" />
        </div>
      </div>
    );
  }
  return (
    <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
      <p className="font-black text-2xl">Product Catelog</p>
      <div className="flex flex-row w-full justify-center h-10 items-center">
        <form
          action={searchCatalog}
          className="bg-bg-200 w-3/5 h-full rounded-lg flex flex-row items-center px-4"
        >
          <Search />
          <input
            placeholder="Search Catelog"
            name="search"
            className="h-full w-full bg-transparent ring-0 outline-none px-2"
          />
        </form>
      </div>

      <div className="grid gap-3 lg:grid-cols-4 grid-cols-2 2xl:grid-cols-6 my-6">
        {catalog && catalog.length ? (
          catalog.map((item, index) => (
            <Link
              key={index}
              href={`/product/${item.id}`}
              className=" shadow-sm hover:shadow-md duration-300 hover:cursor-pointer overflow-hidden flex flex-col gap-2 w-fit h-fit p-2 md:p-4 bg-bg border border-secondary/20 rounded-sm md:rounded-md"
            >
              <div className="aspect-auto bg-bg-300 w-32 h-32 md:w-48 md:h-48 relative overflow-hidden">
                <img
                  src={item.images[0]}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="font-thin text-xs">{item.category[0]}</p>
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="font-thin text-sm">{item.price} PKR</p>
                <p className="font-thin text-sm">Stock 30</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="font-thin">No products found</p>
        )}
      </div>
    </div>
  );
}
