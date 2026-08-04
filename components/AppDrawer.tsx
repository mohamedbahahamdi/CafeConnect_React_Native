import { DrawerActions, useNavigation } from "@react-navigation/native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/hooks/useAuth";

interface AppDrawerProps {
  onClose?: () => void;
}

export const AppDrawer = ({ onClose }: AppDrawerProps) => {
  const navigation = useNavigation();
  const { logout } = useAuth();

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
          onClose?.();
        }}
      >
        <Text style={styles.itemText}>Home</Text>
      </Pressable>
      <Pressable
        style={styles.item}
        onPress={() => {
          navigation.navigate("home" as never);
          onClose?.();
        }}
      >
        <Text style={styles.itemText}>Dashboard</Text>
      </Pressable>
      <Pressable style={styles.item} onPress={handleLogout}>
        <Text style={styles.itemText}>Logout</Text>
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
  itemText: {
    color: "#fff8f2",
    fontSize: 16,
    fontWeight: "600",
  },
});
