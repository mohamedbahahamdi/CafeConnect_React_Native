export type OrderStatus = "pending" | "done" | "ready" | "paid";

export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  user_ref: string;
  userId: string;
  products: OrderItem[];
  items: OrderItem[];
  total_price: number;
  total: number;
  status: OrderStatus;
  table_number: string;
  created_at?: unknown;
  createdAt?: unknown;
}

export interface OrderInput {
  userId: string;
  user_ref?: string;
  products: OrderItem[];
  items?: OrderItem[];
  total_price: number;
  total?: number;
  table_number: string;
}

