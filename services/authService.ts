import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    type User,
} from "firebase/auth";

import { auth } from "@/firebase";
import { createUserProfile } from "@/services/userService";

const mapAuthError = (error: unknown) => {
  const message =
    error instanceof Error ? error.message : "An unexpected error occurred.";

  if (message.includes("invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (message.includes("weak-password")) {
    return "Password should be at least 6 characters long.";
  }

  if (message.includes("email-already-in-use")) {
    return "An account with this email already exists.";
  }

  if (
    message.includes("wrong-password") ||
    message.includes("invalid-credential")
  ) {
    return "Incorrect email or password.";
  }

  if (message.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }

  return message;
};

export const signUp = async (email: string, password: string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const firebaseUser = userCredential.user;

  await createUserProfile({
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? email,
    displayName: firebaseUser.displayName ?? "",
  });

  return firebaseUser as User;
};

export const signIn = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password,
  );
  return userCredential.user as User;
};

export const logout = async () => {
  await signOut(auth);
};

export const getAuthErrorMessage = (error: unknown) => mapAuthError(error);
