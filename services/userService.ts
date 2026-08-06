import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase";
import type { UserProfile } from "@/types/user";

const USERS_COLLECTION = "users";

const ensureAdminAccess = (role: number) => {
  if (role !== 0) {
    throw new Error("Permission denied");
  }
};

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

const toUserProfile = (uid: string, data: Record<string, unknown>): UserProfile => ({
  uid,
  email: String(data.email ?? ""),
  displayName: String(data.displayName ?? ""),
  role: normalizeRole(data.role),
  isBlocked: Boolean(data.isBlocked),
  blockedAt: data.blockedAt,
  deletedAt: data.deletedAt,
  createdAt: data.createdAt,
});

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

  return toUserProfile(snapshot.id, snapshot.data() as Record<string, unknown>);
};

export const getAllUsers = async (role: number): Promise<UserProfile[]> => {
  ensureAdminAccess(role);

  const snapshot = await getDocs(query(collection(db, USERS_COLLECTION)));

  return snapshot.docs
    .map((docSnap) =>
      toUserProfile(docSnap.id, docSnap.data() as Record<string, unknown>),
    )
    .filter((profile) => profile.role !== 0 && !profile.deletedAt)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export const blockUser = async (
  uid: string,
  role: number,
  adminUid: string,
) => {
  ensureAdminAccess(role);

  if (uid === adminUid) {
    throw new Error("You cannot block your own account.");
  }

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error("User not found.");
  }

  const target = toUserProfile(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );

  if (target.role === 0) {
    throw new Error("Admin accounts cannot be blocked.");
  }

  await updateDoc(userRef, {
    isBlocked: true,
    blockedAt: serverTimestamp(),
  });
};

export const unblockUser = async (uid: string, role: number) => {
  ensureAdminAccess(role);

  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, {
    isBlocked: false,
    blockedAt: deleteField(),
  });
};

export const deleteUserAccount = async (
  uid: string,
  role: number,
  adminUid: string,
) => {
  ensureAdminAccess(role);

  if (uid === adminUid) {
    throw new Error("You cannot delete your own account.");
  }

  const userRef = doc(db, USERS_COLLECTION, uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    throw new Error("User not found.");
  }

  const target = toUserProfile(
    snapshot.id,
    snapshot.data() as Record<string, unknown>,
  );

  if (target.role === 0) {
    throw new Error("Admin accounts cannot be deleted.");
  }

  await updateDoc(userRef, {
    isBlocked: true,
    deletedAt: serverTimestamp(),
    blockedAt: serverTimestamp(),
  });
};
