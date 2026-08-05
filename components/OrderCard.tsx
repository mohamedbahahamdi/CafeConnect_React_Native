import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Order, OrderStatus } from "@/types/order";

interface OrderCardProps {
  order: Order;
  orderNumber?: number;
  isAdmin?: boolean;
  onUpdateStatus?: (orderId: string, nextStatus: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
}

const formatDate = (createdAt: unknown): string => {
  if (!createdAt) return "";
  let date: Date | null = null;
  if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "toMillis" in createdAt &&
    typeof (createdAt as { toMillis: () => number }).toMillis === "function"
  ) {
    date = new Date((createdAt as { toMillis: () => number }).toMillis());
  } else if (
    typeof createdAt === "object" &&
    createdAt !== null &&
    "seconds" in createdAt &&
    typeof (createdAt as { seconds: number }).seconds === "number"
  ) {
    date = new Date((createdAt as { seconds: number }).seconds * 1000);
  } else if (createdAt instanceof Date) {
    date = createdAt;
  } else if (typeof createdAt === "number" || typeof createdAt === "string") {
    date = new Date(createdAt);
  }

  if (!date || isNaN(date.getTime())) return "";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const OrderCard = ({
  order,
  orderNumber,
  isAdmin = false,
  onUpdateStatus,
  onDeleteOrder,
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
  const formattedDate = formatDate(order.createdAt);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.orderIdWrap}>
          <Text style={styles.orderId}>
            Order #{orderNumber ?? 1}
          </Text>
          {formattedDate ? (
            <Text style={styles.orderDate}>{formattedDate}</Text>
          ) : null}
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
          {onDeleteOrder ? (
            <TouchableOpacity
              style={styles.deleteCrossBtn}
              onPress={() => onDeleteOrder(order.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Delete order"
            >
              <Ionicons name="close-circle" size={22} color="#dc2626" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.itemsList}>
        {order.items.map((item, index) => (
          <View key={`${order.id}-${item.dishId}-${index}`} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity}x {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              {(item.price * item.quantity).toFixed(2)} dt
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>{order.total.toFixed(2)} dt</Text>
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
  orderDate: {
    fontSize: 12,
    color: "#7a5c45",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteCrossBtn: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
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
