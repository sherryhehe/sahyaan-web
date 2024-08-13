import { db } from "@/firebase/firebase";
import { getDoc, doc, Timestamp } from "firebase/firestore";

export async function fetchOrders(sellerId) {
  const userSnap = await getDoc(doc(db, "seller", sellerId));
  if (!userSnap.exists()) {
    console.error("User Doc doesnot exists");
  }

  const docPromises = userSnap
    .data()
    ["orders"].map((id) => getDoc(doc(db, "orders", id)));
  const docSnapshots = await Promise.all(docPromises);
  const docs = docSnapshots.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  }));
  console.log(docs);

  const sortedData = docs.sort(
    (a, b) =>
      new Timestamp(a.orderDate.seconds, a.orderDate.nanoseconds).toDate() -
      new Timestamp(b.orderDate.seconds, b.orderDate.nanoseconds).toDate()
  );
  return sortedData;
}

export async function getProductData(prodId) {
  const prodSnap = await getDoc(doc(db, "products", prodId));
  if (!prodSnap.exists()) {
    console.error("Product doesnot exists");
  }
  console.log(prodSnap.data());
  return { id: prodSnap.id, ...prodSnap.data() };
}
