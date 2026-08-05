import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface AppDrawerProps {
  onClose?: () => void;
}

export const AppDrawer = ({ onClose }: AppDrawerProps) => {
  const navigation = useNavigation();
  const { logout } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    await logout();
    onClose?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CafeeConnect</Text>
      <Pressable
        style={styles.item}
        onPress={() => {
          navigation.dispatch(DrawerActions.closeDrawer());
          navigation.navigate("home" as never);
          onClose?.();
        }}
      >
        <Text style={styles.itemText}>Menu</Text>
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => {
          navigation.navigate("cart" as never);
          onClose?.();
        }}
      >
        <View style={styles.rowBetween}>
          <Text style={styles.itemText}>Cart</Text>
          {itemCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => {
          navigation.navigate("orders" as never);
          onClose?.();
        }}
      >
        <Text style={styles.itemText}>My Orders</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4b2e1f",
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff8f2",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 24,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.15)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
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
  logoutText: {
    color: "#fecaca",
    fontSize: 16,
    fontWeight: "700",
  },
});
