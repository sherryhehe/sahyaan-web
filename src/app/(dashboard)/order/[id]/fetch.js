import { db, storage } from "@/firebase/firebase";
import { getDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

export default async function getOrderDetails(id) {
  try {
    const orderSnap = await getDoc(doc(db, "orders", id));

    if (!orderSnap.exists()) {
      console.error("Order document does not exist");
      return null;
    }

    const orderData = orderSnap.data();

    const productPromises = orderData.prods.map(async (prod) => {
      const fullProductData = await getProductData(prod.id);
      return {
        ...fullProductData,
        ...prod,
      };
    });

    const products = await Promise.all(productPromises);

    return {
      id: orderSnap.id,
      ...orderData,
      products,
    };
  } catch (error) {
    console.error("Error getting order details:", error);
    return null;
  }
}

export const getFileUrl = async (path) => {
  try {
    const fileRef = ref(storage, path);
    const url = await getDownloadURL(fileRef);
    console.log("File URL: ", url);
    return url;
  } catch (error) {
    console.error("Error getting file URL: ", error);
  }
};

async function getProductData(prodId) {
  try {
    const prodSnap = await getDoc(doc(db, "products", prodId));

    if (!prodSnap.exists()) {
      console.error("Product does not exist");
      return null;
    }
    const prodData = prodSnap.data();
    prodData.thumbnail = await getDownloadURL(ref(storage, prodData.images[0]));
    // prodData.thumbnail = prodImage;
    console.log("Product: ", prodData);

    return { id: prodSnap.id, ...prodData };
  } catch (error) {
    console.error("Error getting product data:", error);
    return null;
  }
}
