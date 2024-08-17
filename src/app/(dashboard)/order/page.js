"use client";
import React, { useEffect, useState } from "react";
import { fetchOrders, getProductData } from "./fetch";
import { auth } from "@/firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

function Page() {
  const [user] = useAuthState(auth);
  const [orderData, setOrders] = useState();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  async function init() {
    setLoading(true);
    await fetchOrders(user.uid).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }
  useEffect(() => {
    if (user) {
      init();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex w-screen h-screen bg-bg items-center justify-center">
        <div className="w-40 h-40">
          <Loading className="text-text w-32" />
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="bg-bg min-h-screen w-full  py-6 sm:px-6 lg:px-10">
        <h1 className="text-3xl font-black text-text">Pending Orders</h1>
        <div className="w-full overflow-x-auto">
          <table className="w-full border-collapse mt-6 border-spacing-y-2 ">
            <thead>
              <tr className="bg-primary text-bg rounded-md overflow-hidden">
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">Order Date</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {orderData &&
                orderData.map((order, index) => (
                  <tr
                    key={index}
                    className={`hover:bg-bg-200 duration-200 hover:cursor-pointer ${
                      index % 2 === 0 ? "bg-bg-100" : "bg-bg-50"
                    }`}
                    onClick={() => {
                      // setOrderModelData(order);
                      router.push(`order/${order.id}`);
                    }}
                  >
                    <td className="p-2 font-medium text-text">{order.id}</td>
                    <td className="p-2">
                      {new Timestamp(
                        order.orderDate.seconds,
                        order.orderDate.nanoseconds,
                      )
                        .toDate()
                        .toDateString()}
                    </td>
                    <td className="p-2 font-medium text-text">
                      {order.status}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* {orderModelData && (
        <>
          <div
            className="absolute z-40 w-screen h-screen bg-primary-400/35"
            onClick={() => {
              setOrderModelData(null);
            }}
          ></div>
          <div className="flex w-screen h-screen absolute items-center justify-center self-center justify-self-center">
            <OrderModel order={orderModelData} />
          </div>
        </>
      )} */}
    </>
  );
}

export default Page;

// function OrderModel({ order }) {
//   const [data, setData] = useState();
//   useEffect(() => {
//     async function init() {
//       setData(await getProductData("08zm4A6ZyAhxxw8ntS0d"));
//     }
//     init();
//   }, []);
//   if (data && order) {
//     console.log(data);
//     return (
//       <div
//         className="flex z-50 flex-col p-10 bg-bg rounded-md min-w-96"
//         onClick={() => {}}
//       >
//         <p className="font-bold text-lg text-center">Order Overview</p>
//         <p className="font-thin text-md text-center">{order.id}</p>
//         <div className="grid grid-cols-2">
//           <div>
//             <p className="font-thin mt-4">Product Name: </p>
//             <p className="font-light">{data.name}</p>
//           </div>
//           <div>
//             <p className="font-thin mt-4">Amount: </p>
//             <p className="font-light">{order.amount}</p>
//           </div>
//           <div>
//             <p className="font-thin mt-4">Amount: </p>
//             <p className="font-light">{order.price} PKR</p>
//           </div>
//           <div>
//             <p className="font-thin mt-4">Address: </p>
//             <p className="font-light">{order.address}</p>
//           </div>
//           <div>
//             <p className="font-thin mt-4">Contact: </p>
//             <p className="font-light">{order.contactNo}</p>
//           </div>
//           <div>
//             <p className="font-thin mt-4">Ordered Date: </p>
//             <p className="font-light">
//               {new Timestamp(
//                 order.orderDate.seconds,
//                 order.orderDate.nanoseconds
//               )
//                 .toDate()
//                 .toDateString()}
//             </p>
//           </div>
//         </div>
//         <div className="flex flex-row gap-12 items-center justify-center mt-2">
//           {order.prevStatus && (
//             <div className="py-2 px-3 bg-primary rounded-md text-bg hover:bg-primary-400 duration-200 hover:cursor-pointer">
//               Decrease Status ({order.prevStatus})
//             </div>
//           )}
//           {order.nextStatus && (
//             <div className="py-2 px-3 bg-secondary-600 rounded-md text-bg hover:bg-secondary-500 duration-200 hover:cursor-pointer">
//               Increase Status ({order.nextStatus})
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   }
// }
