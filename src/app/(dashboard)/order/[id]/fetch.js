import { db } from "@/firebase/firebase";
import { getDoc, doc } from "firebase/firestore";

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
        amount: prod.amount,
        price: prod.price,
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

async function getProductData(prodId) {
  try {
    const prodSnap = await getDoc(doc(db, "products", prodId));

    if (!prodSnap.exists()) {
      console.error("Product does not exist");
      return null;
    }

    return { id: prodSnap.id, ...prodSnap.data() };
  } catch (error) {
    console.error("Error getting product data:", error);
    return null;
  }
}
