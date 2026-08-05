import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} from "@/services/orderService";
import { getUserProfile } from "@/services/userService";
import type { Order, OrderStatus } from "@/types/order";

export default function OrdersScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(1);
  const [menuVisible, setMenuVisible] = useState(false);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const profile = await getUserProfile(user.uid);
      const userRole = Number(profile?.role ?? 1);
      setRole(userRole);
      const adminFlag = userRole === 0;
      setIsAdmin(adminFlag);

      const fetchedOrders = adminFlag
        ? await getAllOrders(userRole)
        : await getUserOrders(user.uid);

      setOrders(fetchedOrders);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleUpdateStatus = async (
    orderId: string,
    nextStatus: OrderStatus,
  ) => {
    try {
      await updateOrderStatus(orderId, nextStatus, role);
      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === orderId ? { ...ord, status: nextStatus } : ord,
        ),
      );
      Alert.alert("Status Updated", `Order updated to ${nextStatus}.`);
    } catch (error) {
      Alert.alert("Error", "Failed to update order status.");
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={isAdmin ? "All Orders" : "My Orders"}
        onMenuPress={() => setMenuVisible(true)}
      />

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4b2e1f" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders found.</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#4b2e1f"
            />
          }
        >
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isAdmin={isAdmin}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </ScrollView>
      )}

      <Modal
        visible={menuVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuCard}>
            <Text style={styles.menuTitle}>CafeeConnect</Text>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/home" as never);
              }}
            >
              <Text style={styles.menuItemText}>Menu</Text>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.push("/cart" as never);
              }}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.menuItemText}>Cart</Text>
                {itemCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{itemCount}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
            <Pressable
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                router.replace("/orders" as never);
              }}
            >
              <Text style={styles.menuItemText}>
                {isAdmin ? "All Orders" : "My Orders"}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.menuItem, styles.logoutItem]}
              onPress={() => {
                setMenuVisible(false);
                logout();
              }}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
            <Pressable
              style={styles.closeButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f7efe8",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#7a5c45",
  },
  list: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    justifyContent: "flex-start",
  },
  menuCard: {
    width: "72%",
    height: "100%",
    backgroundColor: "#4b2e1f",
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  menuTitle: {
    color: "#fff8f2",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuItemText: {
    color: "#fff8f2",
    fontSize: 16,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#d97706",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 24,
  },
  closeButtonText: {
    color: "#f4d9c6",
    fontWeight: "600",
  },
  logoutItem: {
    marginTop: 12,
  },
  logoutText: {
    color: "#fecaca",
    fontSize: 16,
    fontWeight: "700",
  },
});
