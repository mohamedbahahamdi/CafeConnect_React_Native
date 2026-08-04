export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  imagePath: string;
  is_available: boolean;
  createdAt?: unknown;
}

export interface DishInput {
  name: string;
  description: string;
  price: number;
  imagePath: string;
  is_available: boolean;
}
