import React from "react";
import getOrderDetails from "./fetch";
import { redirect } from "next/navigation";
import Link from "next/link";

async function page({ params }) {
  const { id } = params;
  const order = await getOrderDetails(id);
  console.log(order);
  return (
    <div className="py-6 sm:px-6 lg:px-10 bg-bg w-full">
      <p className="font-black text-2xl">Order Overview</p>
      <p className="font-semiBold text-lg mt-4 ">{order.id}</p>

      <div className="flex flex-row mt-4 gap-10 w-full">
        <div className="flex flex-col gap-4 w-4/5">
          <div className="flex flex-col border border-secondary/30 shadow-sm duration-300 hover:shadow-md rounded-md p-5">
            <p className="font-bold text-md">Products</p>
            <table className="border-separate border-spacing-y-3">
              <thead className="divide-x-2 divide-secondary-800">
                <tr>
                  <th className=" bg-bg-100  py-1 rounded-l-md">Item</th>
                  <th className=" bg-bg-100 border-l border-bg-200 py-1">
                    Quantity
                  </th>
                  <th className=" bg-bg-100 border-l border-r border-bg-200 py-1">
                    Price
                  </th>
                  <th className=" bg-bg-100  py-1 rounded-r-md">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-300 mt-4">
                {order.products.map((item, index) => (
                  <tr className="group " key={index}>
                    <td className="py-2 px-2 group-hover:bg-bg-100 group-hover:cursor-pointer duration-150 rounded-l-md bg-bg text-center">
                      <Link
                        href={`/product/${item.id}`}
                        className=" flex flex-row "
                      >
                        {item.name}
                      </Link>
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer border-l border-bg-200 duration-150 bg-bg text-center">
                      {item.amount}
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer border-l border-r border-bg-200 duration-150 bg-bg text-center">
                      {item.price}
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer duration-150 rounded-r-md bg-bg text-center">
                      2
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-4 bg-red-200 w-1/5 h-screen">
          <div className="flex gap-3 flex-col border border-secondary/30 shadow-sm duration-300 hover:shadow-md rounded-md p-5 bg-bg">
            <p className="font-bold text-md">Customer Details</p>
            <div className="p-2 bg-bg-100 rounded-md flex flex-col gap-3">
              <p className="font-semiBold">Contact Info</p>
              <div className="pl-6">
                <p className="text-wrap font-thin">Name: {}</p>
                <p className="text-wrap font-thin">Email: {}</p>
                <p className="text-wrap font-thin">
                  Contact No.: {order.contactNo}
                </p>
              </div>
              <p className="font-semiBold">Shipping Address</p>
              <div className="pl-6">
                <p className="text-wrap font-thin">Address: {order.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
