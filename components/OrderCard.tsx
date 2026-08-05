import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
  order: Order;
  isAdmin?: boolean;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

export const OrderCard = ({
  order,
  isAdmin = false,
  onUpdateStatus,
}: OrderCardProps) => {
  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return { bg: "#fef3c7", text: "#b45309", label: "Pending" };
      case "ready":
        return { bg: "#dbeafe", text: "#1e40af", label: "Ready" };
      case "paid":
        return { bg: "#dcfce7", text: "#15803d", label: "Paid" };
      default:
        return { bg: "#f3f4f6", text: "#374151", label: status };
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "pending") return "ready";
    if (current === "ready") return "paid";
    return null;
  };

  const badge = getStatusBadgeStyle(order.status);
  const nextStatus = getNextStatus(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderIdWrap}>
          <Text style={styles.orderId}>Order #{order.id.slice(-6)}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.itemsList}>
        {order.items.map((item, index) => (
          <View key={`${order.id}-${item.dishId}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
      </View>

      {isAdmin && nextStatus && onUpdateStatus ? (
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onUpdateStatus(order.id, nextStatus)}
        >
          <Text style={styles.actionBtnText}>
            Mark as {nextStatus === "ready" ? "Ready" : "Paid"}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderIdWrap: {
    flex: 1,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  itemsList: {
    gap: 6,
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 14,
    color: "#334155",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b2e1f",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  actionBtn: {
    marginTop: 12,
    backgroundColor: "#4b2e1f",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
