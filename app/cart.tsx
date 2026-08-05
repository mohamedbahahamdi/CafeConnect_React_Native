import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { CartItemCard } from "@/components/CartItemCard";
import { CustomButton } from "@/components/CustomButton";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/services/orderService";

export default function CartScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart, total, itemCount } =
    useCart();
  const [submitting, setSubmitting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty. Add some dishes first!");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(user.uid, cart, total);
      clearCart();
      Alert.alert(
        "Order Placed!",
        "Your order has been submitted successfully.",
        [
          {
            text: "View Orders",
            onPress: () => router.push("/orders" as never),
          },
        ],
      );
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
          <Text style={styles.emptyText}>Your cart is currently empty.</Text>
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
              <CustomButton
                title="Place Order"
                onPress={handlePlaceOrder}
              />
            )}
          </View>
        </View>
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
                router.replace("/cart" as never);
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
                router.push("/orders" as never);
              }}
            >
              <Text style={styles.menuItemText}>My Orders</Text>
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
