import { useFocusEffect } from "@react-navigation/native";
import { Redirect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
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
import { PaginationControls } from "@/components/PaginationControls";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import { PAGE_SIZE, usePagination } from "@/hooks/usePagination";
import {
  deleteOrder,
  getAllOrders,
  getUserOrders,
  updateOrderStatus,
} from "@/services/orderService";
import type { Order, OrderStatus } from "@/types/order";

export default function OrdersScreen() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const { user, role, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = useMemo(() => {
    if (!searchQuery.trim()) return orders;
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((order) => {
      const matchId = order.id.toLowerCase().includes(q);
      const matchTable = (order.table_number || "").toLowerCase().includes(q);
      const matchStatus = order.status.toLowerCase().includes(q);
      const matchItems = (order.items || order.products || []).some((item) =>
        item.name.toLowerCase().includes(q),
      );
      return matchId || matchTable || matchStatus || matchItems;
    });
  }, [orders, searchQuery]);

  const {
    page,
    totalPages,
    shouldPaginate,
    paginatedItems: paginatedOrders,
    goToNext,
    goToPrev,
  } = usePagination(filteredOrders);

  const activeFilter = params.filter;
  const showAllOrders = isAdmin && activeFilter === "all";
  const pageTitle = showAllOrders ? "Admin Dashboard" : "My Orders";

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

  const groupedByTable = useMemo(() => {
    const map: Record<string, Order[]> = {};
    paginatedOrders.forEach((ord) => {
      const tableKey =
        ord.table_number && ord.table_number !== "N/A"
          ? `Table ${ord.table_number}`
          : "Unassigned Table";
      if (!map[tableKey]) {
        map[tableKey] = [];
      }
      map[tableKey].push(ord);
    });
    return map;
  }, [paginatedOrders]);

  const tableKeys = Object.keys(groupedByTable).sort((a, b) =>
    a.localeCompare(b),
  );
  const pendingCount = orders.filter((o) => o.status === "pending").length;

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
      Alert.alert("Status Updated", `Order marked as ${nextStatus}.`);
    } catch {
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
            } catch {
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

      {showAllOrders ? (
        <View style={styles.statsBanner}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{tableKeys.length}</Text>
            <Text style={styles.statLabel}>Active Tables</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: "#b45309" }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Orders</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
        </View>
      ) : null}

      {orders.length > 0 ? (
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search orders by table, status, item..."
        />
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4b2e1f" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders found.</Text>
        </View>
      ) : filteredOrders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No orders match your search.</Text>
        </View>
      ) : showAllOrders ? (
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
          {tableKeys.map((tableKey) => {
            const tableOrders = groupedByTable[tableKey];
            const tablePending = tableOrders.filter((o: Order) => o.status === "pending").length;

            return (
              <View key={tableKey} style={styles.tableGroupSection}>
                <View style={styles.tableHeaderBar}>
                  <View style={styles.tableHeaderLeft}>
                    <Text style={styles.tableHeaderIcon}>🪑</Text>
                    <Text style={styles.tableHeaderTitle}>{tableKey}</Text>
                  </View>
                  <View style={styles.tableHeaderBadge}>
                    <Text style={styles.tableHeaderBadgeText}>
                      {tableOrders.length} order{tableOrders.length > 1 ? "s" : ""} ({tablePending} pending)
                    </Text>
                  </View>
                </View>

                {tableOrders.map((order: Order) => {
                  const globalIndex = paginatedOrders.findIndex(
                    (item) => item.id === order.id,
                  );

                  return (
                    <OrderCard
                      key={order.id}
                      order={order}
                      orderNumber={
                        orders.length - (page - 1) * PAGE_SIZE - globalIndex
                      }
                      isAdmin={isAdmin}
                      onUpdateStatus={handleUpdateStatus}
                      onDeleteOrder={handleDeleteOrder}
                    />
                  );
                })}
              </View>
            );
          })}

          {shouldPaginate ? (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          ) : null}
        </ScrollView>
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
          {paginatedOrders.map((order, index) => (
            <OrderCard
              key={order.id}
              order={order}
              orderNumber={orders.length - (page - 1) * PAGE_SIZE - index}
              isAdmin={isAdmin}
              onUpdateStatus={handleUpdateStatus}
              onDeleteOrder={handleDeleteOrder}
            />
          ))}

          {shouldPaginate ? (
            <PaginationControls
              page={page}
              totalPages={totalPages}
              onPrev={goToPrev}
              onNext={goToNext}
            />
          ) : null}
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
  statsBanner: {
    flexDirection: "row",
    backgroundColor: "#fffdf9",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e8dcd0",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4b2e1f",
  },
  statLabel: {
    fontSize: 12,
    color: "#7a5c45",
    fontWeight: "600",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#e8dcd0",
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
  tableGroupSection: {
    marginBottom: 20,
  },
  tableHeaderBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#4b2e1f",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  tableHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableHeaderIcon: {
    fontSize: 16,
  },
  tableHeaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff8f2",
  },
  tableHeaderBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tableHeaderBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

