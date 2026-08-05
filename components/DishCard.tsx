import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Dish } from "@/types/dish";

interface DishCardProps {
  dish: Dish;
  isAdmin: boolean;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  onToggleAvailability: (dish: Dish) => void;
  onAddToCart?: (dish: Dish) => void;
}

export const DishCard = ({
  dish,
  isAdmin,
  onEdit,
  onDelete,
  onToggleAvailability,
  onAddToCart,
}: DishCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoSection}>
        <Text style={styles.name}>{dish.name}</Text>
        <Text style={styles.description}>{dish.description}</Text>
        <Text style={styles.price}>Price: ${dish.price.toFixed(2)}</Text>
        <Text style={dish.is_available ? styles.available : styles.unavailable}>
          {dish.is_available ? "Available" : "Unavailable"}
        </Text>
      </View>

      <View style={styles.actions}>
        {dish.is_available && onAddToCart ? (
          <TouchableOpacity
            style={styles.buttonSuccess}
            onPress={() => onAddToCart(dish)}
          >
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        ) : null}

        {isAdmin ? (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={() => onToggleAvailability(dish)}
            >
              <Text style={styles.buttonText}>Toggle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => onEdit(dish)}>
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDanger}
              onPress={() => onDelete(dish)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoSection: {
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  description: {
    color: "#475569",
    fontSize: 14,
  },
  price: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "600",
  },
  available: {
    color: "#16a34a",
    fontWeight: "600",
  },
  unavailable: {
    color: "#dc2626",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#4b2e1f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonSuccess: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDanger: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
