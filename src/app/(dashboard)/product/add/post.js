import {
  doc,
  setDoc,
  collection,
  addDoc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
const { storage, db } = require("@/firebase/firebase");

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[arr.length - 1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export async function addProduct(id, data, uid) {
  console.log(data);

  //const productId = uuidv4(); // Generate a unique ID for the new product
  //data["images"] = images; // Initialize empty images array
  await setDoc(doc(db, "products", id), data);
  console.log(uid);
  await updateDoc(doc(db, "seller", uid), { products: arrayUnion(id) });
}

export async function uploadImage(productId, image, index) {
  console.log(image);
  const file = dataURLtoFile(image.content, image.name);
  const imagePath = `/images/products/${productId}/${index}.jpg`;

  await uploadBytes(ref(storage, imagePath), file);
  const url = await getDownloadURL(ref(storage, imagePath));
  //  Update the product document with the new image URL
  // const productRef = doc(db, "products", productId);
  // await setDoc(
  //   productRef,
  //   {
  //     images: arrayUnion(imagePath),
  //   },
  //   { merge: true },
  // );

  return { imagePath, url };
}

export async function addField(productId, field, value) {
  const updateData = {};
  updateData[field] = value;
  await setDoc(doc(db, "products", productId), updateData, { merge: true });
}
