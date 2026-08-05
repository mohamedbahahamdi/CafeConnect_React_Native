import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppDrawerModal } from "@/components/AppDrawerModal";
import { AppHeader } from "@/components/AppHeader";
import { CartItemCard } from "@/components/CartItemCard";
import { CustomButton } from "@/components/CustomButton";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/services/orderService";

export default function CartScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, total, itemCount } =
    useCart();
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(user.uid, cart, total);
      clearCart();
      router.replace({
        pathname: "/orders",
        params: { filter: "mine" },
      } as never);
    } catch (error) {
      Alert.alert(
        "Order Error",
        "Failed to place order. Please try again later.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="My Cart" onMenuPress={() => setMenuVisible(true)} />

      {cart.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Your cart is empty.</Text>
          <CustomButton
            title="Browse Menu"
            onPress={() => router.push("/home" as never)}
          />
        </View>
      ) : (
        <View style={styles.content}>
          <ScrollView contentContainerStyle={styles.list}>
            {cart.map((item) => (
              <CartItemCard
                key={item.dishId}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            ))}
          </ScrollView>

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Items:</Text>
              <Text style={styles.summaryValue}>{itemCount}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
            </View>

            {submitting ? (
              <ActivityIndicator
                size="large"
                color="#4b2e1f"
                style={styles.spinner}
              />
            ) : (
              <CustomButton title="Place Order" onPress={handlePlaceOrder} />
            )}
          </View>
        </View>
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
  content: {
    flex: 1,
  },
  list: {
    paddingBottom: 16,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#7a5c45",
  },
  summaryCard: {
    backgroundColor: "#fffdf9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4b2e1f",
  },
  spinner: {
    marginVertical: 12,
  },
});

