import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

const normalizeRole = (value: unknown): number => {
  if (typeof value === "number") {
    return value === 0 ? 0 : 1;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "0" || normalized === "admin") {
      return 0;
    }

    if (normalized === "1" || normalized === "user") {
      return 1;
    }
  }

  return 1;
};

export const createUserProfile = async (user: {
  uid: string;
  email: string;
  displayName: string;
}) => {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    role: 1,
    createdAt: serverTimestamp(),
  };

  await setDoc(userRef, profile);
  return profile;
};

export const getUserProfile = async (uid: string) => {
  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Partial<UserProfile>;
  return {
    ...data,
    role: normalizeRole(data.role),
  } as UserProfile;
};
