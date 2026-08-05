export type OrderStatus = "pending" | "ready" | "paid";

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt?: unknown;
}

export interface OrderInput {
  userId: string;
  items: OrderItem[];
  total: number;
}
