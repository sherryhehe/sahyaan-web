import { auth, db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

async function createUserBasePlate(uid, country) {
  const docRef = doc(db, "seller", uid);
  await setDoc(
    docRef,
    {
      country: country,
      role: "seller",
      approved: false,
    },
    { merge: true }
  );
}

export async function loginSeller(sellerId) {}

export async function signupWithEmail(username, email, password, country) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  await updateProfile(user, {
    displayName: username,
  });
  await createUserBasePlate(user.uid, country);
  return user;
}

async function loginGmail() {}
