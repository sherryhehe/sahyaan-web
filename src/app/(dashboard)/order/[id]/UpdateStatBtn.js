"use client";
import { React, useEffect, useState } from "react";
import { updateOrderStatus } from "./post";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function UpdateStateBtn({ oid, init_val }) {
  const [orderStatus, setStatus] = useState(init_val);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <div className="flex h-10 md:h-auto flex-row gap-4">
      <select
        value={orderStatus}
        onChange={(e) => {
          const updateVal = e.target.value;
          //updateOrderStatus(oid, updateVal).then(() => {
          //console.log(updateVal);
          setStatus(updateVal);
          // });
        }}
        className="px-4 border border-secondary rounded-md bg-bg"
      >
        <option value="confirmed">Confirmed</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>

      {orderStatus != init_val && (
        <div
          className="px-4 py-2 rounded-md duration-300  min-w-32 hover:cursor-pointer bg-primary hover:bg-primary-400"
          onClick={() => {
            setLoading(true);
            updateOrderStatus(oid, orderStatus).then(() => {
              toast.success("Client will be soon notified!");
              router.refresh();
              setLoading(false);
            });
          }}
        >
          {loading ? (
            <Loading
              className={"w-10 justify-self-center mx-auto self-center"}
            />
          ) : (
            <p className="text-bg">Update & Notify</p>
          )}
        </div>
      )}
    </div>
  );
}
