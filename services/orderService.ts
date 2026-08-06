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

const toOrder = (id: string, data: Record<string, unknown>): Order => {
  const rawProducts = Array.isArray(data.products)
    ? data.products
    : Array.isArray(data.items)
      ? data.items
      : [];

  const products: OrderItem[] = rawProducts.map((item) => ({
    dishId: String(item.dishId ?? ""),
    name: String(item.name ?? ""),
    price: Number(item.price ?? 0),
    quantity: Number(item.quantity ?? 1),
  }));

  const totalPrice = Number(data.total_price ?? data.total ?? 0);
  const userIdStr = String(data.user_ref ?? data.userId ?? "");
  const createdAtVal = data.created_at ?? data.createdAt;

  return {
    id,
    user_ref: userIdStr,
    userId: userIdStr,
    products,
    items: products,
    total_price: totalPrice,
    total: totalPrice,
    status: (data.status as OrderStatus) || "pending",
    table_number: String(data.table_number ?? data.tableNumber ?? "N/A"),
    created_at: createdAtVal,
    createdAt: createdAtVal,
  };
};

export const createOrder = async (
  userId: string,
  items: OrderItem[],
  total: number,
  tableNumber: string = "N/A",
): Promise<Order> => {
  if (!items || items.length === 0) {
    throw new Error("Cannot place an empty order");
  }

  const orderData = {
    user_ref: userId,
    userId,
    products: items,
    items,
    total_price: total,
    total,
    status: "pending" as OrderStatus,
    table_number: tableNumber.trim() || "N/A",
    created_at: serverTimestamp(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);

  return {
    id: docRef.id,
    user_ref: userId,
    userId,
    products: items,
    items,
    total_price: total,
    total,
    status: "pending",
    table_number: tableNumber.trim() || "N/A",
  };
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const q1 = query(
    collection(db, ORDERS_COLLECTION),
    where("userId", "==", userId),
  );
  const q2 = query(
    collection(db, ORDERS_COLLECTION),
    where("user_ref", "==", userId),
  );

  const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
  const orderMap = new Map<string, Order>();

  snap1.docs.forEach((docSnap) => {
    orderMap.set(docSnap.id, toOrder(docSnap.id, docSnap.data()));
  });
  snap2.docs.forEach((docSnap) => {
    orderMap.set(docSnap.id, toOrder(docSnap.id, docSnap.data()));
  });

  const orders = Array.from(orderMap.values());

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

