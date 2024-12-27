import { db } from "@/firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function updateSeller(user, data) {
  const userDoc = doc(db, "seller", user);
  await setDoc(
    userDoc,
    data,

    { merge: true },
  );
}
