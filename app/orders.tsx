import { useFocusEffect } from "@react-navigation/native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppDrawerModal } from "@/components/AppDrawerModal";
import { AppHeader } from "@/components/AppHeader";
import { OrderCard } from "@/components/OrderCard";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} from "@/services/orderService";
import type { Order, OrderStatus } from "@/types/order";

export default function OrdersScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ filter?: string }>();
  const { user, role, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const activeFilter = params.filter;
  const showAllOrders = isAdmin && activeFilter === "all";
  const pageTitle = showAllOrders ? "Client Orders" : "My Orders";

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const fetchedOrders = showAllOrders
        ? await getAllOrders(role)
        : await getUserOrders(user.uid);

      setOrders(fetchedOrders);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch orders.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, role, showAllOrders]);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders]),
  );

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

  const handleDeleteOrder = (orderId: string) => {
    Alert.alert(
      "Delete Order",
      "Are you sure you want to delete this order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteOrder(orderId);
              setOrders((prev) => prev.filter((ord) => ord.id !== orderId));
              Alert.alert("Deleted", "Order has been deleted.");
            } catch (error) {
              Alert.alert("Error", "Failed to delete order.");
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title={pageTitle} onMenuPress={() => setMenuVisible(true)} />

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
          {orders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              orderNumber={orders.length - index}
              isAdmin={isAdmin}
              onUpdateStatus={handleUpdateStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          ))}
        </ScrollView>
      )}

      <AppDrawerModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
      />
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
});

