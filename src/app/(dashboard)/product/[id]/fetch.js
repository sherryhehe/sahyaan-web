import { db, storage } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

export async function fetchProduct(pid, sellerId) {
  console.log(`PID: ${pid}- SID ${sellerId}`);
  const prodData = await getDoc(doc(db, "products", pid)).then(async (snap) => {
    if (!snap.exists()) {
      throw "Product Doesnt Exists 1";
    }
    return { id: snap.id, ...snap.data() };
  });

  if (!prodData) {
    throw "Product Doesnt Exists 2";
  }
  if (prodData.seller !== sellerId) {
    throw "Product Doesnt Exists 3";
  }

  prodData.imageRef = prodData.images;
  prodData.images = await Promise.all(
    prodData.images.map((path) => getDownloadURL(ref(storage, path))),
  );

  // console.log(prodData);
  return prodData;
}
