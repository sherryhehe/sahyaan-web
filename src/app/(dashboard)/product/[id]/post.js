import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

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

export async function updateImage(prodImages, index, image, pid) {
  const file = dataURLtoFile(image.content, image.path);

  await uploadBytes(
    ref(storage, `/images/products/${pid}/${index}.jpg`),
    file,
  ).then(async () => {
    prodImages[index] = `/images/products/${pid}/${index}.jpg`;

    await updateDoc(doc(db, "products", pid), {
      images: prodImages,
    });
  });
}

export async function updateFeild(pid, feild, value) {
  const updateData = {};
  updateData[feild] = value;
  await updateDoc(doc(db, "products", pid), updateData);
}

export async function updateProduct(pid, data) {
  delete data["imageRef"];
  delete data["images"];
  await updateDoc(doc(db, "products", pid), data);
}
