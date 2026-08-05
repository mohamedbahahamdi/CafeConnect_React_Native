import React, { createContext, useMemo, useState } from "react";

import type { Dish } from "@/types/dish";
import type { OrderItem } from "@/types/order";

interface CartContextValue {
  cart: OrderItem[];
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, setCart] = useState<OrderItem[]>([]);

  const addToCart = (dish: Dish) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.dishId === dish.id,
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }

      return [
        ...prevCart,
        {
          dishId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (dishId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.dishId !== dishId));
  };

  const updateQuantity = (dishId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(dishId);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.dishId === dishId ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const itemCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      total,
      itemCount,
    }),
    [cart, total, itemCount],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = React.useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within a CartProvider");
  }

  return context;
};
