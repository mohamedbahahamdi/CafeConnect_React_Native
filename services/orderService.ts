import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/firebase";
import { getUserProfile } from "@/services/userService";
import type { Order, OrderItem, OrderStatus } from "@/types/order";

const ORDERS_COLLECTION = "orders";

const ensureAdminAccess = (role: number) => {
  if (role !== 0) {
    throw new Error("Permission denied");
  }
};

const getTimestampMs = (createdAt: unknown): number => {
  if (!createdAt) return Date.now();
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "toMillis" in createdAt &&
    typeof (createdAt as { toMillis: () => number }).toMillis === "function"
  ) {
    return (createdAt as { toMillis: () => number }).toMillis();
  }
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "seconds" in createdAt &&
    typeof (createdAt as { seconds: number }).seconds === "number"
  ) {
    return (createdAt as { seconds: number }).seconds * 1000;
  }
  if (createdAt instanceof Date) return createdAt.getTime();
  if (typeof createdAt === "number") return createdAt;
  return Date.now();
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
  );

  const snapshot = await getDocs(q);

  const orders = snapshot.docs.map((docSnapshot) =>
    toOrder(docSnapshot.id, docSnapshot.data()),
  );

  return orders.sort(
    (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt),
  );
};

export const getAllOrders = async (role: number): Promise<Order[]> => {
  ensureAdminAccess(role);

  const q = query(collection(db, ORDERS_COLLECTION));

  const snapshot = await getDocs(q);

  const orders = snapshot.docs.map((docSnapshot) =>
    toOrder(docSnapshot.id, docSnapshot.data()),
  );

  const uniqueUserIds = Array.from(
    new Set(orders.map((o) => o.userId).filter(Boolean)),
  );

  const userProfiles = await Promise.all(
    uniqueUserIds.map(async (uid) => {
      const profile = await getUserProfile(uid);
      return { uid, role: profile?.role ?? 1 };
    }),
  );

  const adminUserIds = new Set(
    userProfiles.filter((p) => p.role === 0).map((p) => p.uid),
  );

  const clientOrders = orders.filter((o) => !adminUserIds.has(o.userId));

  return clientOrders.sort(
    (a, b) => getTimestampMs(b.createdAt) - getTimestampMs(a.createdAt),
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

export const deleteOrder = async (orderId: string): Promise<void> => {
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);
  await deleteDoc(orderRef);
};

