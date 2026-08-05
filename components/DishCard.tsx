import { Ionicons } from "@expo/vector-icons";
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
        <Text style={styles.price}>Price: {dish.price.toFixed(2)} dt</Text>
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
              style={styles.crossDeleteBtn}
              onPress={() => onDelete(dish)}
              accessibilityLabel="Delete dish"
            >
              <Ionicons name="close" size={18} color="#fff" />
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
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  infoSection: {
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: "700",
  },
  description: {
    color: "#475569",
    fontSize: 13,
  },
  price: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "600",
  },
  available: {
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 13,
  },
  unavailable: {
    color: "#dc2626",
    fontWeight: "600",
    fontSize: 13,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    gap: 6,
    marginTop: 10,
  },
  button: {
    backgroundColor: "#4b2e1f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonSuccess: {
    backgroundColor: "#2e7d32",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  crossDeleteBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
