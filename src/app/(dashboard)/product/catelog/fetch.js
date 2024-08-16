import { db } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function fetchCatelog(sid) {
  const sellerData = await getDoc(doc(db, "seller", sid)).then((snap) => {
    if (!snap.exists()) {
      console.error("Seller Doesnot Exists");
    }
    return { id: snap.id, ...snap.data() };
  });

  console.log(sellerData);
  const prods = await Promise.all(
    sellerData.products.map((id) =>
      getDoc(doc(db, "products", id)).then((snap) => {
        if (!snap.exists) {
          console.log(`Product ${id} doesnot exists`);
          return;
        }
        return { id: snap.id, ...snap.data() };
      }),
    ),
  );

  return prods;
}
