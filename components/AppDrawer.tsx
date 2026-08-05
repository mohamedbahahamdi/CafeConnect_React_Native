import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface AppDrawerProps {
  onClose?: () => void;
}

export const AppDrawer = ({ onClose }: AppDrawerProps) => {
  const router = useRouter();
  const { logout, isAdmin } = useAuth();
  const { itemCount } = useCart();

  const handleLogout = async () => {
    onClose?.();
    await logout();
  };

  const handleNavigate = (
    pathname: string,
    params?: Record<string, string>,
  ) => {
    onClose?.();
    if (params) {
      router.push({ pathname, params } as never);
    } else {
      router.push(pathname as never);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CafeeConnect</Text>
      <Pressable style={styles.item} onPress={() => handleNavigate("/home")}>
        <Text style={styles.itemText}>Menu</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={() => handleNavigate("/cart")}>
        <View style={styles.rowBetween}>
          <Text style={styles.itemText}>Cart</Text>
          {itemCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
          ) : null}
        </View>
      </Pressable>

      {isAdmin ? (
        <Pressable
          style={styles.item}
          onPress={() => handleNavigate("/orders", { filter: "all" })}
        >
          <Text style={styles.itemText}>All Orders</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.item}
        onPress={() => handleNavigate("/orders", { filter: "mine" })}
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

