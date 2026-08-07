import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { CustomButton } from "@/components/CustomButton";
import { DishCard } from "@/components/DishCard";
import { SearchBar } from "@/components/SearchBar";
import { useAuth } from "@/hooks/useAuth";
import {
  deleteDish,
  getDishes,
  toggleDishAvailability,
} from "@/services/dishService";
import { getUserProfile } from "@/services/userService";
import type { Dish } from "@/types/dish";

export default function DishesScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    const q = searchQuery.toLowerCase().trim();
    return dishes.filter(
      (dish) =>
        dish.name.toLowerCase().includes(q) ||
        (dish.description && dish.description.toLowerCase().includes(q)),
    );
  }, [dishes, searchQuery]);

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
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Please sign in to view dishes.</Text>
      </View>
    );
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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dishes</Text>
        {isAdmin ? (
          <TouchableOpacity style={styles.addBtn} onPress={handleCreate}>
            <Text style={styles.addBtnText}>+ Add Menu Items</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search dishes..."
      />

      <ScrollView contentContainerStyle={styles.list}>
        {dishes.length === 0 ? (
          <Text style={styles.empty}>No dishes created yet.</Text>
        ) : filteredDishes.length === 0 ? (
          <Text style={styles.empty}>No dishes match your search.</Text>
        ) : (
          filteredDishes.map((dish) => (
            <DishCard
              key={dish.id}
              dish={dish}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleAvailability={handleToggleAvailability}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4b2e1f",
  },
  addBtn: {
    backgroundColor: "#4b2e1f",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: "center",
    color: "#64748b",
    marginTop: 24,
  },
});
