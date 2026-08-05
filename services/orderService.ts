import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

const ORDERS_COLLECTION = "orders";

const ensureAdminAccess = (role: number) => {
  if (role !== 0) {
    throw new Error("Permission denied");
  }
};

const toOrder = (id: string, data: Record<string, unknown>): Order => ({
  id,
  userId: String(data.userId ?? ""),
  items: Array.isArray(data.items)
    ? data.items.map((item) => ({
        dishId: String(item.dishId ?? ""),
        name: String(item.name ?? ""),
        price: Number(item.price ?? 0),
        quantity: Number(item.quantity ?? 1),
      }))
    : [],
  total: Number(data.total ?? 0),
  status: (data.status as OrderStatus) || "pending",
  createdAt: data.createdAt,
});

export const createOrder = async (
  userId: string,
  items: OrderItem[],
  total: number,
): Promise<Order> => {
  if (!items || items.length === 0) {
    throw new Error("Cannot place an empty order");
  }

  const orderData = {
    userId,
    items,
    total,
    status: "pending" as OrderStatus,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);

  return {
    id: docRef.id,
    userId,
    items,
    total,
    status: "pending",
  };
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) =>
    toOrder(docSnapshot.id, docSnapshot.data()),
  );
};

export const getAllOrders = async (role: number): Promise<Order[]> => {
  ensureAdminAccess(role);

  const q = query(
    collection(db, ORDERS_COLLECTION),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) =>
    toOrder(docSnapshot.id, docSnapshot.data()),
  );
};

export const updateOrderStatus = async (
  orderId: string,
  status: OrderStatus,
  role: number,
): Promise<void> => {
  ensureAdminAccess(role);

  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(orderRef, { status });
};
