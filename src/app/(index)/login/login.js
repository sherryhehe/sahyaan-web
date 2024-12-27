import { auth, db } from "@/firebase/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

export async function loginEmail(email, password) {
  return await signInWithEmailAndPassword(auth, email, password).then(
    (userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
      return user;
    },
  );
}

export async function loginSeller(email, password) {
  const seller = await loginEmail(email, password);
  const sellersnap = await getDoc(doc(db, "seller", seller.uid));

  if (!sellersnap.exists()) {
    console.error("user doesnot exists");
    await signOut(auth);
  }
}

async function loginGmail() {}
