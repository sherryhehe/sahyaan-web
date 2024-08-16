import React from "react";
import getOrderDetails from "./fetch";
import { redirect } from "next/navigation";
import Link from "next/link";

import { Timestamp } from "firebase/firestore";
import UpdateStateBtn from "./UpdateStatBtn";
import { Banknote, Package, PackageCheck, SquareX, Truck } from "lucide-react";
async function page({ params }) {
  const { id } = params;
  const order = await getOrderDetails(id);
  console.log(order);
  return (
    <div className="py-6 sm:px-6 lg:px-10 bg-bg w-full">
      <p className="font-black text-2xl">Order Overview</p>
      <div className="flex flex-row justify-between">
        <p className="font-semiBold text-lg mt-4 ">{order.id}</p>
        <UpdateStateBtn init_val={order.status} oid={order.id} />
      </div>

      <p className="font-thin text-secondary/80">
        {new Timestamp(order.orderDate.seconds, order.orderDate.nanoseconds)
          .toDate()
          .toDateString()}
      </p>
      <div className="flex flex-col-reverse md:flex-row  mt-4 gap-10 w-full">
        <div className="flex flex-col gap-4 w-full 2xl:w-4/5 lg:w-3/5">
          <div className="flex flex-col border border-secondary/30 shadow-sm duration-300 hover:shadow-md rounded-md p-5">
            <p className="font-bold text-md">Products</p>
            <table className="border-separate border-spacing-y-3">
              <thead className="divide-x-2 divide-secondary-800">
                <tr>
                  <th className=" bg-bg-100  py-1 rounded-l-md">Item</th>
                  <th className=" bg-bg-100 border-l border-r border-bg-200 py-1">
                    varaints
                  </th>
                  <th className=" bg-bg-100 border-l border-bg-200 py-1">
                    Quantity
                  </th>
                  <th className=" bg-bg-100  py-1 rounded-r-md">Total Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-300 mt-4">
                {order.products.map((item, index) => (
                  <tr className="group" key={index}>
                    <td className="py-2 px-2 group-hover:bg-bg-100 w-min group-hover:cursor-pointer duration-150 rounded-l-md bg-bg text-center">
                      <Link
                        href={`/product/${item.id}`}
                        className=" flex flex-row items-center gap-4"
                      >
                        <img
                          src={item.thumbnail}
                          className="h-36 aspect-auto"
                        />
                        <div className="flex flex-col gap-2 items-start justify-start">
                          <p className="font-semibold">{item.name}</p>
                          <p className="font-thin text-sm text-nowrap text-ellipsis max-w-52 overflow-hidden">
                            {item.shortDescription}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer border-l border-bg-200 duration-150 bg-bg text-center">
                      {Object.entries(item.varaints).map(([key, value]) => {
                        return (
                          <p key={key}>
                            &#8226; {key}: {value}
                          </p>
                        );
                      })}
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer border-l border-r border-bg-200 duration-150 bg-bg text-center">
                      {item.amount}
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer duration-150 rounded-r-md bg-bg text-center">
                      {item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col border border-secondary/30 shadow-sm duration-300 hover:shadow-md rounded-md p-5">
            <p className="font-bold text-md">Timeline</p>
            <p className="font-thin">Track order logs</p>
            <table className="border-separate border-spacing-y-3">
              <tbody className="divide-y divide-secondary-300 mt-4">
                {order.timeline.map((item, index) => (
                  <tr className="group" key={index}>
                    <td className="py-2 px-2 group-hover:bg-bg-100 w-min group-hover:cursor-pointer duration-150 rounded-l-md bg-bg text-center">
                      <Link
                        href={`/product/${item.id}`}
                        className=" flex flex-row items-center gap-4"
                      >
                        <div className=" bg-primary p-3 rounded-md w-14 h-14">
                          {item.status == "confirmed" ? (
                            <Banknote color="white" className="w-full h-full" />
                          ) : item.status == "processing" ? (
                            <Package color="white" className="w-full h-full" />
                          ) : item.status == "shipped" ? (
                            <Truck color="white" className="w-full h-full" />
                          ) : item.status == "delivered" ? (
                            <PackageCheck
                              color="white"
                              className="w-full h-full"
                            />
                          ) : (
                            item.status == "cancled" && <SquareX />
                          )}
                        </div>
                        <div className="flex flex-col gap-2 items-start justify-start">
                          <p className="font-semibold">{item.status}</p>
                          <p className="font-thin text-sm text-nowrap text-ellipsis max-w-52 overflow-hidden">
                            {item.tagLine}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-2 group-hover:bg-bg-100 group-hover:cursor-pointer duration-150 rounded-r-md bg-bg text-center">
                      {new Timestamp(item.time.seconds, item.time.nanoseconds)
                        .toDate()
                        .toLocaleString("en-us", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          second: "numeric",
                          minute: "numeric",
                          hour: "numeric",
                        })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex flex-col gap-4 w-full  2xl:w-1/5 lg:w-2/5 h-screen">
          <div className="flex flex-col bg-bg  gap-3 border-secondary/30 border  rounded-md p-5 shadow-sm hover:shadow-md">
            <p>Payment</p>
            <div className="flex flex-col bg-bg-100 p-3 rounded-md">
              <div className="flex flex-row justify-between items-center">
                <p className="font-light text-sm">Type</p>{" "}
                <p className="font-light text-sm">{order.payment.type}</p>
              </div>

              <div className="flex flex-row justify-between items-center">
                <p className="font-light text-sm">Transaction ID</p>{" "}
                <p className="font-light text-sm">
                  {order.payment.TransectionID}
                </p>
              </div>

              <div className="flex flex-row justify-between items-center">
                <p className="font-light text-sm">Amount</p>{" "}
                <p className="font-light text-sm">{order.payment.amount} PKR</p>
              </div>

              <div className="flex flex-row justify-between items-center">
                <p className="font-light text-sm">Shipping Cost</p>{" "}
                <p className="font-light text-sm">
                  {order.payment.shipping} PKR
                </p>
              </div>
              <div className="flex flex-row justify-between items-center">
                <p className="font-semibold text-md">Total</p>{" "}
                <p className="font-semibold text-md">
                  {order.payment.shipping + order.payment.amount} PKR
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 flex-col border border-secondary/30 shadow-sm duration-300 hover:shadow-md rounded-md p-5 bg-bg">
            <p className="font-bold text-md">Customer Details</p>
            <div className="p-2 bg-bg-100 rounded-md flex flex-col gap-3">
              <p className="font-semiBold">Contact Info</p>
              <div className="pl-6">
                <p className="text-wrap font-thin">
                  Name: {order.customer.name}
                </p>
                <p className="text-wrap font-thin">
                  Email: {order.customer.email}
                </p>
                <p className="text-wrap font-thin">
                  Contact No.: {order.customer.phone}
                </p>
              </div>
            </div>

            <div className="p-2 bg-bg-100 rounded-md flex flex-col gap-3">
              <p className="font-semiBold">Shipping Address</p>
              <div className="pl-6">
                <div className="flex flex-row gap-1">
                  <p className="font-thin text-sm">Street: </p>
                  <p className="font-thin text-sm">
                    {" "}
                    {order.shippingAddress.street}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <p className="font-thin text-sm">City: </p>
                  <p className="font-thin text-sm">
                    {" "}
                    {order.shippingAddress.city}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <p className="font-thin text-sm">Country: </p>
                  <p className="font-thin text-sm">
                    {" "}
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div className="flex flex-row gap-1">
                  <p className="font-thin text-sm">Postal Code: </p>
                  <p className="font-thin text-sm">
                    {" "}
                    {order.shippingAddress.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
