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

const formatTime = (createdAt: unknown): string => {
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

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
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
      case "done":
        return { bg: "#dcfce7", text: "#15803d", label: "Done" };
      case "ready":
        return { bg: "#dbeafe", text: "#1e40af", label: "Ready" };
      case "paid":
        return { bg: "#dcfce7", text: "#15803d", label: "Paid" };
      default:
        return { bg: "#f3f4f6", text: "#374151", label: status };
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === "pending") return "done";
    if (current === "done") return "pending";
    if (current === "ready") return "paid";
    return null;
  };

  const badge = getStatusBadgeStyle(order.status);
  const nextStatus = getNextStatus(order.status);
  const formattedDate = formatDate(order.created_at ?? order.createdAt);
  const formattedTime = formatTime(order.created_at ?? order.createdAt);
  const orderItems = order.products && order.products.length > 0 ? order.products : order.items;
  const orderTotal = order.total_price ?? order.total ?? 0;
  const itemsSummary = orderItems
    .map((item) => `${item.quantity}x ${item.name}`)
    .join(", ");

  return (
    <View style={styles.card}>
      {isAdmin ? (
        <View style={styles.adminSummary}>
          <Text style={styles.adminSummaryText}>
            {itemsSummary} → {badge.label}
          </Text>
          {formattedTime ? (
            <Text style={styles.adminSummaryTime}>{formattedTime}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={styles.orderIdWrap}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.orderId}>
              Order #{orderNumber ?? 1}
            </Text>
            {order.table_number && order.table_number !== "N/A" ? (
              <View style={styles.tableChip}>
                <Text style={styles.tableChipText}>
                  Table #{order.table_number}
                </Text>
              </View>
            ) : null}
          </View>
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
        {orderItems.map((item, index) => (
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
        <Text style={styles.totalAmount}>{orderTotal.toFixed(2)} dt</Text>
      </View>

      {isAdmin && nextStatus && onUpdateStatus ? (
        <TouchableOpacity
          style={[
            styles.actionBtn,
            nextStatus === "pending" ? styles.actionBtnSecondary : null,
          ]}
          onPress={() => onUpdateStatus(order.id, nextStatus)}
        >
          <Text style={styles.actionBtnText}>
            Mark as {nextStatus === "done" ? "Done" : nextStatus === "pending" ? "Pending" : nextStatus}
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
  adminSummary: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1e5d8",
  },
  adminSummaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4b2e1f",
    lineHeight: 22,
  },
  adminSummaryTime: {
    fontSize: 13,
    color: "#7a5c45",
    marginTop: 2,
    fontWeight: "500",
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
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  tableChip: {
    backgroundColor: "#fefaf6",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d4a373",
  },
  tableChipText: {
    fontSize: 12,
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
  actionBtnSecondary: {
    backgroundColor: "#78350f",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
