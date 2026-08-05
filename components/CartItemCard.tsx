import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { OrderItem } from "@/types/order";

interface CartItemCardProps {
  item: OrderItem;
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemove: (dishId: string) => void;
}

export const CartItemCard = ({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) => {
  const itemTotal = item.price * item.quantity;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.unitPrice}>{item.price.toFixed(2)} dt each</Text>
        </View>
        <TouchableOpacity
          onPress={() => onRemove(item.dishId)}
          style={styles.removeBtn}
        >
          <Text style={styles.removeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerRow}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQuantity(item.dishId, item.quantity - 1)}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => onUpdateQuantity(item.dishId, item.quantity + 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.itemTotal}>{itemTotal.toFixed(2)} dt</Text>
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2b1810",
  },
  unitPrice: {
    fontSize: 13,
    color: "#7a5c45",
    marginTop: 2,
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    color: "#dc2626",
    fontSize: 16,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f4e9df",
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#4b2e1f",
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  quantityText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4b2e1f",
    marginHorizontal: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b2e1f",
  },
});
