import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { AppHeader } from "@/components/AppHeader";
import { DishList } from "@/components/DishList";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteDish,
  getDishes,
  toggleDishAvailability,
} from "@/services/dishService";
import { getUserProfile } from "@/services/userService";
import type { Dish } from "@/types/dish";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(1);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadData = async () => {
      try {
        const [profile, dishesData] = await Promise.all([
          getUserProfile(user.uid),
          getDishes(),
        ]);
        const nextRole = Number(profile?.role ?? 1);
        setRole(nextRole);
        setIsAdmin(nextRole === 0);
        setDishes(dishesData);
      } catch (error) {
        Alert.alert("Error", "Unable to load dishes.");
      } finally {
        setLoadingDishes(false);
      }
    };

    loadData();
  }, [user]);

  if (!user) {
    return <Redirect href="/login" />;
  }

  const handleCreate = () => router.push("/create-dish" as never);
  const handleEdit = (dish: Dish) =>
    router.push({
      pathname: "/edit-dish" as never,
      params: { dishId: dish.id },
    } as never);

  const handleDelete = async (dish: Dish) => {
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can delete dishes.");
      return;
    }

    Alert.alert("Delete dish", `Delete ${dish.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDish(dish.id, role);
            setDishes((current) =>
              current.filter((item) => item.id !== dish.id),
            );
          } catch (error) {
            Alert.alert("Error", "Unable to delete dish.");
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async (dish: Dish) => {
    if (!isAdmin) {
      Alert.alert("Permission denied", "Only admins can change availability.");
      return;
    }

    try {
      await toggleDishAvailability(dish.id, !dish.is_available, role);
      setDishes((current) =>
        current.map((item) =>
          item.id === dish.id
            ? { ...item, is_available: !item.is_available }
            : item,
        ),
      );
    } catch (error) {
      Alert.alert("Error", "Unable to update dish availability.");
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Home" onMenuPress={() => setMenuVisible(true)} />

      <DishList
        dishes={dishes}
        isAdmin={isAdmin}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleAvailability={handleToggleAvailability}
        title="Today's Menu"
        emptyMessage={
          loadingDishes ? "Loading dishes..." : "No dishes created yet."
        }
      />

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
                router.replace("/home" as never);
              }}
            >
              <Text style={styles.menuItemText}>Home</Text>
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
  menuItemText: {
    color: "#fff8f2",
    fontSize: 16,
    fontWeight: "600",
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
