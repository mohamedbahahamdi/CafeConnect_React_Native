import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase";
import type { Dish, DishInput } from "@/types/dish";

const DISHES_COLLECTION = "dishes";

const ensureAdminAccess = (role: number) => {
  if (role !== 0) {
    throw new Error("Permission denied");
  }
};

const toDish = (id: string, data: Record<string, unknown>): Dish => ({
  id,
  name: String(data.name ?? ""),
  description: String(data.description ?? ""),
  price: Number(data.price ?? 0),
  imagePath: String(data.imagePath ?? ""),
  is_available: Boolean(data.is_available),
  createdAt: data.createdAt,
});

export const getDishes = async (): Promise<Dish[]> => {
  const q = query(
    collection(db, DISHES_COLLECTION),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) =>
    toDish(docSnapshot.id, docSnapshot.data()),
  );
};

export const createDish = async (
  dish: DishInput,
  role: number,
): Promise<Dish> => {
  ensureAdminAccess(role);

  const docRef = await addDoc(collection(db, DISHES_COLLECTION), {
    ...dish,
    createdAt: serverTimestamp(),
  });

  return {
    id: docRef.id,
    ...dish,
  };
};

export const updateDish = async (
  id: string,
  updates: Partial<DishInput>,
  role: number,
): Promise<void> => {
  ensureAdminAccess(role);

  const dishRef = doc(db, DISHES_COLLECTION, id);
  await updateDoc(dishRef, updates);
};

export const toggleDishAvailability = async (
  id: string,
  isAvailable: boolean,
  role: number,
): Promise<void> => {
  ensureAdminAccess(role);

  const dishRef = doc(db, DISHES_COLLECTION, id);
  await updateDoc(dishRef, { is_available: isAvailable });
};

export const deleteDish = async (id: string, role: number): Promise<void> => {
  ensureAdminAccess(role);

  const dishRef = doc(db, DISHES_COLLECTION, id);
  await deleteDoc(dishRef);
};
