import { db } from "@/firebase/firebase";
import {
  arrayUnion,
  doc,
  increment,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

export async function updateOrderStatus(oid, status, sid) {
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
                    : status === "finished"
                      ? "The order has been completed and closed"
                      : "",
      }),
    });
    if (status === "delivered") {
      await updateDoc(doc(db, "seller", sid), { sale: increment(1) });
    }
    console.log("done");
  } catch (e) {
    console.error(e);
  }
}
