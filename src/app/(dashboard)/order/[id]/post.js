import { db } from "@/firebase/firebase";
import { arrayUnion, doc, Timestamp, updateDoc } from "firebase/firestore";

export async function updateOrderStatus(oid, status) {
  try {
    await updateDoc(doc(db, "orders", oid), {
      status: status,
      timeline: arrayUnion({
        status: status,
        time: Timestamp.now(),
        tagLine:
          status == "confirmed"
            ? "The payment has been confirmed"
            : status == "processing"
              ? "The order is being packed and will be shipped soon"
              : status == "shipped"
                ? "The order has been shipped and will arrive shortly"
                : status == "delivered"
                  ? "The order has been delivered"
                  : status == "cancelled"
                    ? "The order has been cancled"
                    : "",
      }),
    });
    console.log("done");
  } catch (e) {
    console.error(e);
  }
}
