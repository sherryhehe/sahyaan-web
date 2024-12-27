import { auth, db } from "@/firebase/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

async function createUserBasePlate(uid, username, country) {
  const docRef = doc(db, "seller", uid);
  await setDoc(
    docRef,
    {
      country: country,
      role: "seller",
      approved: false,
      debt: 0,
      orders: [],
      products: [],
      name: username,
      onboarding: false,
    },
    { merge: true },
  );
}

export async function loginSeller(sellerId) {}

export async function signupWithEmail(username, email, password, country) {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await updateProfile(user, {
    displayName: username,
  });
  await createUserBasePlate(user.uid, username, country);
  return user;
}

export const googleSignin = async (country) => {
  try {
    const provider = new GoogleAuthProvider();
    // Get the user's ID token

    // Create a Google credential with the token
    const result = await signInWithPopup(auth, provider);

    // Extract the user information
    const user = result.user;

    createUserBasePlate(user.uid, user.displayName, country);
    // //  // console.log("User UID:", user.uid);

    return user.uid;
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    return error;
  }
};
async function loginGmail() {}
