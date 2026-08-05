import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";

import { AppDrawerModal } from "@/components/AppDrawerModal";
import { AppHeader } from "@/components/AppHeader";
import { DishList } from "@/components/DishList";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  deleteDish,
  getDishes,
  toggleDishAvailability,
} from "@/services/dishService";
import type { Dish } from "@/types/dish";

export default function HomeScreen() {
  const router = useRouter();
  const { user, role, isAdmin } = useAuth();
  const { addToCart } = useCart();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadData = async () => {
      try {
        const dishesData = await getDishes();
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

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish);
    Alert.alert("Added to Cart", `${dish.name} added to your cart.`);
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
        onAddToCart={handleAddToCart}
        title="Our Menu"
        emptyMessage={
          loadingDishes ? "Loading dishes..." : "No dishes created yet."
        }
      />

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
});

