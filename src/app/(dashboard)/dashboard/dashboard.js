"use client";
import React from "react";
import {
  HandCoins,
  Handshake,
  Coins,
  Package,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import AreaGraph from "./graph"; // Assuming AreaGraph is in the same directory
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
const Dashboard = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const mockData = {
    overview: [
      { title: "Revenue", value: "RS 200,000", icon: HandCoins, change: 5.2 },
      { title: "Sales", value: "500", icon: Handshake, change: -2.1 },
      { title: "Debt", value: "PKR 8,000", icon: Coins },
      { title: "Pending Orders", value: "80", icon: Package },
    ],
    salesData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "No. of Sales",
          data: [1200, 500, 90, 5, 15, 3],
        },
      ],
    },
    revenueData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Revenue",
          data: [1000, 800, 150, 10, 50, 8],
        },
      ],
    },
    impressionData: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Impressions",
          data: [2000, 1800, 250, 20, 75, 12],
        },
      ],
    },
    orders: [
      { name: "Product A", amount: 5, price: 100, unitPrice: 20, id: "1" },
      { name: "Product B", amount: 3, price: 150, unitPrice: 50, id: "2" },
      { name: "Product C", amount: 2, price: 80, unitPrice: 40, id: "3" },
      { name: "Product C", amount: 2, price: 80, unitPrice: 40, id: "4" },
      { name: "Product C", amount: 2, price: 80, unitPrice: 40, id: "5" },
      { name: "Product A", amount: 5, price: 100, unitPrice: 20, id: "6" },
      { name: "Product A", amount: 5, price: 100, unitPrice: 20, id: "7" },
      { name: "Product C", amount: 2, price: 80, unitPrice: 40, id: "8" },
    ],
    inventory: [
      { name: "Product A", stock: 5, reorderLevel: 10 },
      { name: "Product B", stock: 3, reorderLevel: 5 },
      { name: "Product C", stock: 15, reorderLevel: 10 },
      { name: "Product C", stock: 15, reorderLevel: 10 },
      { name: "Product C", stock: 15, reorderLevel: 10 },
      { name: "Product C", stock: 15, reorderLevel: 10 },
      { name: "Product C", stock: 15, reorderLevel: 10 },
    ],
    productViews: [
      { name: "Product A", views: 1200 },
      { name: "Product B", views: 900 },
      { name: "Product C", views: 450 },
      { name: "Product C", views: 450 },
      { name: "Product C", views: 450 },
      { name: "Product C", views: 450 },
      { name: "Product C", views: 450 },
    ],
  };

  return (
    <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
      <h1 className="text-3xl font-black text-text">Overview</h1>
      <h2 className="text-xl font-thin text-text">
        Welcome, {user.displayName}
      </h2>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {mockData.overview.map((item, index) => (
          <div
            key={index}
            className="bg-bg-50 overflow-hidden hover:shadow-md duration-200 hover:cursor-pointer shadow rounded-lg border border-secondary/20"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon
                    className="h-6 w-6 text-secondary"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-text-400 truncate">
                      {item.title}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-text">
                        {item.value}
                      </div>
                      {item.change && (
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            item.change > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {item.change > 0 ? (
                            <ArrowUp
                              className="self-center flex-shrink-0 h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <ArrowDown
                              className="self-center flex-shrink-0 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          <span className="sr-only">
                            {item.change > 0 ? "Increased" : "Decreased"} by
                          </span>
                          {Math.abs(item.change)}%
                        </div>
                      )}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5 ">
        <p className="ml-8 font-bold text-lg">Analytics</p>
        <div className="bg-bg-50 border border-secondary/20 overflow-hidden hover:shadow-md hover:cursor-pointer shadow rounded-lg">
          <div className="py-4 px-3">
            <AreaGraph
              data={[
                {
                  name: "A",
                  sales: 4000,
                  impressions: 2400,
                  revenue: 2400,
                },
                {
                  name: "B",
                  sales: 3000,
                  impressions: 1398,
                  revenue: 2210,
                },
                {
                  name: "C",
                  sales: 2000,
                  impressions: 9800,
                  revenue: 2290,
                },
                {
                  name: "D",
                  sales: 2780,
                  impressions: 3908,
                  revenue: 2000,
                },
                {
                  name: "E",
                  sales: 1890,
                  impressions: 4800,
                  revenue: 2181,
                },
                {
                  name: "F",
                  sales: 2390,
                  impressions: 3800,
                  revenue: 2500,
                },
                { name: "G", sales: 3490, revenue: 2100 },
              ]}
              title="Sales"
            />
          </div>
        </div>
        {/* <div className="bg-bg-50 overflow-hidden hover:shadow-md hover:cursor-pointer shadow rounded-lg">
            <div className="py-4 px-3">
              <AreaGraph data={mockData.revenueData} title="Revenue" />
            </div>
          </div>
          <div className="bg-bg-50 overflow-hidden hover:shadow-md hover:cursor-pointer shadow rounded-lg">
            <div className="py-4 px-3">
              <AreaGraph data={mockData.impressionData} title="Impressions" />
            </div>
          </div> */}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3 ">
        <div className="bg-bg-50 overflow-hidden hover:shadow-md hover:cursor-pointer shadow  lg:col-span-2 border border-secondary-200 rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-text">
              Order Queue
            </h3>
            <div className="mt-5 flow-root">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="flex flex-col items-center min-w-full  py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text sm:pl-0"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Unit Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {mockData.orders
                        .slice(
                          0,
                          mockData.orders.length > 5
                            ? 5
                            : mockData.orders.length
                        )
                        .map((order, index) => (
                          <tr
                            key={index}
                            className="hover:bg-bg-100 duration-200 px-4"
                            onClick={() => {
                              router.push(`/order/${order.id}`);
                            }}
                          >
                            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-text sm:pl-0">
                              {order.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                              {order.amount}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                              ${order.price.toFixed(2)}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                              ${order.unitPrice.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {mockData.orders.length > 5 && (
                    <div className="hover:bg-bg-200 duration-200 px-4 py-3 rounded-md w-min">
                      <p className="text-center text-nowrap">Show More</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-bg-50 overflow-hidden hover:shadow-md hover:cursor-pointer shadow border border-secondary-200 rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-text">
              Product Views
            </h3>
            <div className="mt-5 flex flex-col items-center w-full">
              <ul role="list" className="divide-y divide-secondary-200 w-full">
                {mockData.productViews
                  .slice(
                    0,
                    mockData.productViews.length > 5
                      ? 5
                      : mockData.productViews.length
                  )
                  .map((item, index) => (
                    <li
                      key={index}
                      className="py-4 sm:py-4 hover:bg-bg-100 duration-200 px-4"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="inline-flex items-center text-base font-medium text-text">
                          {item.views}
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
              {mockData.productViews.length > 5 && (
                <div className="hover:bg-bg-200 duration-200 px-4 py-3 rounded-md w-min">
                  <p className="text-center text-nowrap">Show More</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 border border-secondary-200 rounded-lg">
        <div className="bg-bg-50 overflow-hidden hover:shadow-md hover:cursor-pointer shadow rounded-lg">
          <div className="p-5">
            <h3 className="text-lg leading-6 font-medium text-text">
              Inventory Overview
            </h3>
            <div className="mt-5 flow-root">
              <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="flex flex-col min-w-full py-2 align-middle sm:px-6 lg:px-8 items-center">
                  <table className="min-w-full divide-y divide-secondary-200">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-text sm:pl-0"
                        >
                          Product
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Stock
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Reorder Level
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {mockData.inventory
                        .slice(
                          0,
                          mockData.inventory.length > 5
                            ? 5
                            : mockData.inventory.length
                        )
                        .map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-bg-100 duration-200 px-4 "
                          >
                            <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-text sm:pl-0">
                              {item.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                              {item.stock}
                            </td>
                            <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                              {item.reorderLevel}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  {mockData.inventory.length > 5 && (
                    <div className="hover:bg-bg-200 duration-200 px-4 py-3 rounded-md w-min">
                      <p className="text-center text-nowrap">Show More</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
