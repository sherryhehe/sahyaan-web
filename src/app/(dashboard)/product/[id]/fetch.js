import { db, storage } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
export async function fetchProduct(pid) {
  //  console.log("seller id", await getCurrentUserUID());
  const prodData = await getDoc(doc(db, "products", pid)).then(async (snap) => {
    if (!snap.exists()) {
      console.error("Product Doesnot Exists");
    }

    return await updateDoc(doc(db, "products", pid), {})
      .then(() => {
        // console.log("update");
        return { id: snap.id, ...snap.data() };
      })
      .catch((e) => {
        console.log(e);
      });
    // return { id: snap.id, ...snap.data() };
  });

  // console.log(prodData);
  if (!prodData) {
    console.error("Product Doesnt exists");
  }
  prodData.imageRef = prodData.images;
  prodData.images = await Promise.all(
    prodData.images.map((path) => getDownloadURL(ref(storage, path))),
  );

  // return { id: snap.id, ...prod };
  console.log(prodData);
  return prodData;
}
