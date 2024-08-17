import { db, storage } from "@/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

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
      getDoc(doc(db, "products", id)).then(async (snap) => {
        if (!snap.exists) {
          console.log(`Product ${id} doesnot exists`);
          return;
        }

        const prod = snap.data();
        prod.images = await Promise.all(
          prod.images.map((path) => getDownloadURL(ref(storage, path))),
        );

        return { id: snap.id, ...prod };
      }),
    ),
  );

  return prods;
}
