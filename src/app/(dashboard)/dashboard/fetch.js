import { db, storage } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

export async function fetchSeller(uid) {
  return await getDoc(doc(db, "seller", uid)).then(async (snap) => {
    if (!snap.exists) {
      console.error("User DoesNot Exists");
    }
    return { id: snap.id, ...snap.data() };
  });
}

export async function fetchSellerProducts(user) {
  const prodsIds = user["products"];
  if (prodsIds) {
    const products = await Promise.all(prodsIds.map((id) => fetchProduct(id)));
    // console.log(products);
    return products;
  }
  return [];
}

export async function fetchOrderData(user) {
  const orderIds = user["orders"];

  if (orderIds) {
    const orders = await Promise.all(orderIds.map((id) => fetchOrder(id)));
    // console.log(products);
    return orders;
  }
  return [];
}

export async function fetchOrder(oid) {
  const orderData = await getDoc(doc(db, "orders", oid)).then(async (snap) => {
    if (!snap.exists()) {
      console.error("Order Doesnot Exists");
    }

    return await updateDoc(doc(db, "orders", oid), {})
      .then(() => {
        return { id: snap.id, ...snap.data() };
      })
      .catch((e) => {
        console.log(e);
      });
  });

  if (!orderData) {
    console.error("Product Doesnt exists");
  }

  // console.log(orderData);
  return orderData;
}

export async function fetchProduct(pid) {
  const prodData = await getDoc(doc(db, "products", pid)).then(async (snap) => {
    if (!snap.exists()) {
      console.error("Product Doesnot Exists");
    }

    return await updateDoc(doc(db, "products", pid), {})
      .then(() => {
        return { id: snap.id, ...snap.data() };
      })
      .catch((e) => {
        console.log(e);
      });
  });

  if (!prodData) {
    console.error("Product Doesnt exists");
  }

  console.log(prodData);
  return prodData;
}
