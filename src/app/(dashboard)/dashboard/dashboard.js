"use client";
import React, { useEffect, useState } from "react";
import {
  HandCoins,
  Handshake,
  Coins,
  Package,
  ArrowUp,
  ArrowDown,
  Link,
} from "lucide-react";
import AreaGraph from "./graph"; // Assuming AreaGraph is in the same directory
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/firebase/firebase";
import { useRouter } from "next/navigation";
import { fetchSellerProducts, fetchSeller, fetchOrderData } from "./fetch";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [productsViews, setProductsViews] = useState();
  const [productsStock, setProductStocks] = useState();
  const [orderData, setOrderData] = useState();
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState(false);

  const [userData, setUserData] = useState(false);
  async function getUserData() {
    const userData = await getDoc(doc(db, "seller", user.uid)).then((snap) => ({
      id: snap.id,
      ...snap.data(),
    }));
    console.log(userData);
    setUserData(userData);
  }
  useEffect(() => {
    if (user) getUserData();
  }, [user]);
  const formatCurrency = (value, currency) => {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: currency,
    });
  };

  const calculateOrderMetrics = async (orders) => {
    console.log(orders);
    if (!orders || orders.length === 0) {
      const defaultMetrics = {
        revenue: 0,
        debt: 0,
        sales: 0,
      };

      await updateDoc(doc(db, "seller", user.uid), defaultMetrics);
      return defaultMetrics;
    }

    const completedOrders = orders.filter(
      (order) => order.status === "delivered",
    );

    const metrics = completedOrders.reduce(
      (acc, order) => {
        acc.revenue += order.payment.amount;
        acc.debt += order.payment.cut;
        return acc;
      },
      { revenue: 0, debt: 0 },
    );

    await updateDoc(doc(db, "seller", user.uid), {
      ...metrics,
      sales: completedOrders.length,
    });

    return {
      ...metrics,
      sales: completedOrders.length,
    };
  };

  async function fetchData() {
    setLoading(true);
    const u = await fetchSeller(user.uid);
    const prods = await fetchSellerProducts(u);
    const orders = await fetchOrderData(u);

    // Calculate metrics from completed orders
    const metrics = await calculateOrderMetrics(orders);

    const uncompleted_orders = orders.filter(
      (item) => item.status !== "delivered" && item.status !== "finished",
    );

    console.log(u.currency);
    const overview_data = [
      {
        title: "Revenue",
        value: formatCurrency(
          metrics.revenue ? metrics.revenue : 0,
          u.currency,
        ),
        icon: HandCoins,
      },
      {
        title: "Sales",
        value: metrics.sales ? metrics.sales : 0,
        icon: Handshake,
      },
      {
        title: "Debt",
        value: formatCurrency(metrics.debt ? metrics.debt : 0, u.currency),
        icon: Coins,
      },
      {
        title: "Pending Orders",
        value: uncompleted_orders ? uncompleted_orders.length : 0,
        icon: Package,
      },
    ];

    setOverview(overview_data);
    const order_sorted = orders.sort(
      (a, b) => b.orderDate.toDate() - a.orderDate.toDate(),
    );
    const prods_view = prods.sort((a, b) => a.views - b.views);
    setProductsViews(prods_view);
    const prod_stock = prods.sort((a, b) => b.stock - a.stock);
    setProductStocks(prod_stock);
    setOrderData(order_sorted);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
      <div className="flex flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-text">Overview</h1>
          <h2 className="text-xl font-thin text-text">
            Welcome, {user.displayName}
          </h2>
        </div>

        <div
          className="w-10 h-10 border border-primary rounded-md items-center justify-center flex duration-100 transition-all hover:bg-primary hover:text-bg hover:cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(
              `${process.env.NEXT_PUBLIC_HOME_URL}/${user.displayName}`,
            );
          }}
        >
          <Link size={18} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {overview &&
          overview.map((item, index) => (
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
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* <div className="mt-8 flex flex-col gap-5 ">
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
      </div> */}

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
                          Order ID
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-text"
                        >
                          Address
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
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      {orderData &&
                        orderData
                          .filter(
                            (item) =>
                              item.status !== "delivered" &&
                              item.status !== "finished" &&
                              item.status !== "cancelled",
                          )
                          .slice(0, orderData.length > 5 ? 5 : orderData.length)
                          .map((order, index) => (
                            <tr
                              key={index}
                              className="hover:bg-bg-100 duration-200 px-4"
                              onClick={() => {
                                router.push(`/order/${order.id}`);
                              }}
                            >
                              <td className="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-text sm:pl-0">
                                {order.id}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.country}{" "}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                                {userData.currency}
                                {order.payment.amount.toFixed(2)}
                              </td>
                              <td className="whitespace-nowrap px-3 py-3 text-sm text-text-400">
                                {order.status}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
                  {orderData && orderData.length > 5 && (
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
                <li className="py-4 sm:py-4 duration-200 px-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text truncate">
                        Product Name
                      </p>
                    </div>
                    <div className="inline-flex items-center text-base font-medium text-text">
                      Views
                    </div>
                  </div>
                </li>

                {productsViews && productsViews.length ? (
                  productsViews.map((item, index) => {
                    console.log(item);
                    return (
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
                    );
                  })
                ) : (
                  <p className="text-center">No products found</p>
                )}
              </ul>
              {productsViews && productsViews.length > 5 && (
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
                  {productsStock && productsStock.length ? (
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
                        {productsStock
                          .slice(
                            0,
                            productsStock.length > 5 ? 5 : productsStock.length,
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
                                {item.sales}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center">No Products found</p>
                  )}
                  {productsStock && productsStock.length > 5 && (
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
